
let currentUser = null;
let currentUserRole = null;

auth.onAuthStateChanged(user => {
    currentUser = user;
    if (user) {
        const docRef = db.collection('users').doc(user.uid);
        docRef.get()
            .then(doc => {
                if (doc.exists) {
                    currentUserRole = doc.data().role;
                    if (typeof onUserStateChange === 'function') {
                        onUserStateChange(user, doc.data());
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching user role:', error);
            });
    } else {
        currentUserRole = null;
        if (typeof onUserStateChange === 'function') {
            onUserStateChange(null, null);
        }
    }
});

function getCurrentUser() { return currentUser; }
function getCurrentUserRole() { return currentUserRole; }

function requireAuth(role) {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            unsubscribe();
            if (user) {
                if (role) {
                    db.collection('users').doc(user.uid).get()
                        .then(doc => {
                            if (doc.exists && doc.data().role === role) {
                                resolve(user);
                            } else {
                                reject(new Error('Unauthorized: incorrect role'));
                            }
                        })
                        .catch(reject);
                } else {
                    resolve(user);
                }
            } else {
                reject(new Error('Not authenticated'));
            }
        });
    });
}

function registerWithEmail(email, password, role, profileData) {
    return auth.createUserWithEmailAndPassword(email, password)
        .then(cred => {
            return db.collection('users').doc(cred.user.uid).set({
                email,
                role,
                ...profileData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            }).then(() => {
                return cred.user.sendEmailVerification();
            }).then(() => {
                return cred.user;
            });
        });
}

function loginWithEmail(email, password) {
    return auth.signInWithEmailAndPassword(email, password);
}

function logout() {
    return auth.signOut();
}

function sendPasswordReset(email) {
    return auth.sendPasswordResetEmail(email);
}

function reauthenticate(password) {
    const user = auth.currentUser;
    const cred = firebase.auth.EmailAuthProvider.credential(user.email, password);
    return user.reauthenticateWithCredential(cred);
}

const FirebaseServices = {
    shifts: {
        getAll: async () => {
            return await db.collection('shifts').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('shifts').doc(id).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('shifts').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('shifts').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('shifts').doc(id).delete();
            return true;
        },
        count: async () => {
            const snapshot = await db.collection('shifts').get();
            return snapshot.size;
        },
        getAvailable: async () => {
            return await db.collection('shifts').where('status', '==', 'open').get();
        },
        getUpcoming: async (caregiverId) => {
            return await db.collection('shifts')
                .where('caregiverId', '==', caregiverId)
                .where('status', 'in', ['assigned', 'in-progress'])
                .get();
        },
        accept: async (shiftId, caregiverId) => {
            await db.collection('shifts').doc(shiftId).update({
                status: 'assigned',
                caregiverId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: shiftId, status: 'assigned', caregiverId };
        }
    },

    careRequests: {
        getAll: async () => {
            return await db.collection('careRequests').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('careRequests').doc(id).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('careRequests').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('careRequests').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('careRequests').doc(id).delete();
            return true;
        }
    },

    applications: {
        getAll: async () => {
            return await db.collection('applications').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('applications').doc(id).get();
        },
        getByType: async (type) => {
            return await db.collection('applications').where('type', '==', type).get();
        },
        create: async (data) => {
            const docRef = await db.collection('applications').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            await db.collection('applications').doc(id).update(data);
            return { id, ...data };
        },
        updateStatus: async (id, status) => {
            await db.collection('applications').doc(id).update({ status, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            return { id, status };
        },
        remove: async (id) => {
            await db.collection('applications').doc(id).delete();
            return true;
        },
        count: async () => {
            const snapshot = await db.collection('applications').get();
            return snapshot.size;
        },
        countPending: async () => {
            const snapshot = await db.collection('applications').where('status', '==', 'pending').get();
            return snapshot.size;
        }
    },

    providers: {
        getAll: async () => {
            return await db.collection('providers').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('providers').doc(id).get();
        },
        create: async (data) => {
            const docRef = await db.collection('providers').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            await db.collection('providers').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('providers').doc(id).delete();
            return true;
        }
    },

    users: {
        getAll: async () => {
            return await db.collection('users').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('users').doc(id).get();
        },
        getByEmail: async (email) => {
            return await db.collection('users').where('email', '==', email).get();
        },
        getByRole: async (role) => {
            return await db.collection('users').where('role', '==', role).get();
        },
        create: async (uid, data) => {
            await db.collection('users').doc(uid).set(data);
            return { id: uid, ...data };
        },
        update: async (id, data) => {
            await db.collection('users').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('users').doc(id).delete();
            return true;
        },
        adminCreateUser: async (email, password, role, profileData) => {
            const userRecord = await auth.createUserWithEmailAndPassword(email, password);
            const uid = userRecord.user.uid;
            const userData = {
                email,
                role,
                ...profileData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            };
            await db.collection('users').doc(uid).set(userData);
            return { uid, ...userData };
        },
        count: async () => {
            const snapshot = await db.collection('users').get();
            return snapshot.size;
        },
        countByRole: async (role) => {
            const snapshot = await db.collection('users').where('role', '==', role).get();
            return snapshot.size;
        },
        updateRole: async (uid, newRole) => {
            await db.collection('users').doc(uid).update({ role: newRole });
            return { id: uid, role: newRole };
        },
        activate: async (uid) => {
            await db.collection('users').doc(uid).update({ status: 'active', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            return { id: uid, status: 'active' };
        },
        deactivate: async (uid) => {
            await db.collection('users').doc(uid).update({ status: 'inactive', updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            return { id: uid, status: 'inactive' };
        },
        countReferrals: async (uid) => {
            const snapshot = await db.collection('referrals').where('referrerId', '==', uid).get();
            return snapshot.size;
        },
        getReferralSignups: async () => {
            return await db.collection('users').where('referredBy', '>', '').get();
        }
    },

    facilities: {
        getAll: async () => {
            return await db.collection('facilities').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('facilities').doc(id).get();
        },
        getByProvider: async (providerId) => {
            return await db.collection('facilities').where('providerId', '==', providerId).limit(1).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('facilities').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('facilities').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('facilities').doc(id).delete();
            return true;
        },
        count: async () => {
            const snapshot = await db.collection('facilities').get();
            return snapshot.size;
        }
    },

    vacancies: {
        getByProvider: async (providerId) => {
            return await db.collection('vacancies').where('providerId', '==', providerId).get();
        },
        getAll: async () => {
            return await db.collection('vacancies').orderBy('createdAt', 'desc').get();
        },
        create: async (data) => {
            const docRef = await db.collection('vacancies').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            await db.collection('vacancies').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('vacancies').doc(id).delete();
            return true;
        }
    },

    providerPricing: {
        getByProvider: async (providerId) => {
            return await db.collection('providerPricing').where('providerId', '==', providerId).get();
        },
        set: async (providerId, data) => {
            const snapshot = await db.collection('providerPricing').where('providerId', '==', providerId).get();
            if (!snapshot.empty) {
                const doc = snapshot.docs[0];
                await db.collection('providerPricing').doc(doc.id).update(data);
                return { id: doc.id, ...data };
            } else {
                const docRef = await db.collection('providerPricing').add({ providerId, ...data });
                return { id: docRef.id, providerId, ...data };
            }
        }
    },

    bookings: {
        getAll: async () => {
            return await db.collection('bookings').orderBy('createdAt', 'desc').get();
        },
        getByFamily: async (familyId) => {
            return await db.collection('bookings').where('familyId', '==', familyId).get();
        },
        getByProvider: async (providerId) => {
            return await db.collection('bookings').where('providerId', '==', providerId).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('bookings').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            await db.collection('bookings').doc(id).update(data);
            return { id, ...data };
        }
    },

    messages: {
        getConversation: async (userId1, userId2) => {
            return await db.collection('messages')
                .where('participants', 'array-contains', userId1)
                .get();
        },
        send: async (from, to, content) => {
            const docRef = await db.collection('messages').add({
                from,
                to,
                content,
                participants: [from, to],
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                read: false
            });
            return { id: docRef.id };
        },
        getInbox: async (userId) => {
            return await db.collection('messages')
                .where('participants', 'array-contains', userId)
                .get();
        },
        getUnreadCount: async (userId) => {
            try {
                var snap = await db.collection('messages')
                    .where('toUserId', '==', userId)
                    .where('read', '==', false)
                    .get();
                return snap.size;
            } catch(e) {
                return 0;
            }
        }
    },

    reviews: {
        getByProvider: async (providerId) => {
            return await db.collection('reviews').where('providerId', '==', providerId).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('reviews').add(data);
            return { id: docRef.id, ...data };
        }
    },

    community: {
        getAll: async () => {
            return await db.collection('community').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('community').doc(id).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('community').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            await db.collection('community').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('community').doc(id).delete();
            return true;
        }
    },

    activityLog: {
        getAll: async () => {
            return await db.collection('activityLog').orderBy('timestamp', 'desc').limit(100).get();
        },
        add: async (action, details) => {
            const docRef = await db.collection('activityLog').add({
                action,
                details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id };
        }
    },

    activity: {
        getAll: async (limitCount) => {
            limitCount = limitCount || 50;
            return await db.collection('activityLog').orderBy('timestamp', 'desc').limit(limitCount).get();
        },
        log: async (action, details) => {
            const docRef = await db.collection('activityLog').add({
                action,
                details,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id };
        }
    },

    referrals: {
        getAll: async () => {
            return await db.collection('referrals').orderBy('createdAt', 'desc').get();
        },
        getByFamily: async (familyId) => {
            return await db.collection('referrals').where('familyId', '==', familyId).get();
        },
        getByProvider: async (providerId) => {
            return await db.collection('referrals').where('providerId', '==', providerId).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('referrals').add(data);
            return { id: docRef.id, ...data };
        },
        updateStatus: async (id, status) => {
            await db.collection('referrals').doc(id).update({ status, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            return { id, status };
        },
        count: async () => {
            const snapshot = await db.collection('referrals').get();
            return snapshot.size;
        }
    },

    payments: {
        getAll: async () => {
            return await db.collection('payments').orderBy('createdAt', 'desc').get();
        },
        getTotalThisMonth: async () => {
            const start = new Date();
            start.setDate(1);
            start.setHours(0, 0, 0, 0);
            return await db.collection('payments').where('createdAt', '>=', start).get();
        }
    },

    tours: {
        getAll: async () => {
            return await db.collection('tours').orderBy('date', 'asc').get();
        },
        updateStatus: async (id, status) => {
            await db.collection('tours').doc(id).update({ status, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
            return { id, status };
        },
        remove: async (id) => {
            await db.collection('tours').doc(id).delete();
            return true;
        }
    },

    blogPosts: {
        getAll: async () => {
            return await db.collection('blogPosts').orderBy('createdAt', 'desc').get();
        },
        getById: async (id) => {
            return await db.collection('blogPosts').doc(id).get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('blogPosts').add(data);
            return { id: docRef.id, ...data };
        },
        update: async (id, data) => {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('blogPosts').doc(id).update(data);
            return { id, ...data };
        },
        remove: async (id) => {
            await db.collection('blogPosts').doc(id).delete();
            return true;
        },
        count: async () => {
            const snapshot = await db.collection('blogPosts').get();
            return snapshot.size;
        }
    },

    contactMessages: {
        getAll: async () => {
            return await db.collection('contactMessages').orderBy('createdAt', 'desc').get();
        },
        create: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('contactMessages').add(data);
            return { id: docRef.id, ...data };
        },
        countUnread: async () => {
            const snapshot = await db.collection('contactMessages').where('read', '==', false).get();
            return snapshot.size;
        }
    },

    heroImages: {
        getAll: async () => {
            return await db.collection('heroImages').orderBy('order', 'asc').get();
        },
        add: async (data) => {
            data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection('heroImages').add(data);
            return { id: docRef.id, ...data };
        },
        remove: async (id) => {
            await db.collection('heroImages').doc(id).delete();
            return true;
        }
    },

    credentials: {
        getByCaregiver: async (caregiverId) => {
            return await db.collection('credentials').where('caregiverId', '==', caregiverId).get();
        }
    },

    newsletter: {
        subscribe: async (email) => {
            const docRef = await db.collection('newsletter').add({
                email,
                subscribedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return { id: docRef.id, email };
        }
    },

    savedCommunities: {
        getByFamily: async (familyId) => {
            return await db.collection('savedCommunities').where('familyId', '==', familyId).get();
        }
    },

    settings: {
        get: async (id) => {
            return await db.collection('settings').doc(id).get();
        },
        update: async (id, data) => {
            data.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
            await db.collection('settings').doc(id).set(data, { merge: true });
            return data;
        }
    },

    formatCurrency: function(amount) {
        if (amount == null || isNaN(amount)) return '$0';
        return '$' + Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    },

    formatDate: function(date) {
        if (!date) return 'N/A';
        const d = date.toDate ? date.toDate() : new Date(date);
        return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    },

    formatTimestamp: function(timestamp) {
        if (!timestamp) return 'N/A';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
};

function getNextId(collection) {
    return db.collection(collection).get().then(snapshot => {
        let maxId = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.id && typeof data.id === 'number' && data.id > maxId) {
                maxId = data.id;
            }
        });
        return maxId + 1;
    });
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getDocumentIdByField(collection, field, value) {
    return db.collection(collection).where(field, '==', value).get()
        .then(snapshot => {
            if (snapshot.empty) return null;
            return snapshot.docs[0].id;
        });
}
