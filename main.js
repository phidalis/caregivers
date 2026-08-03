// ==========================================
// MERCY SENIOR SOLUTIONS - Main JavaScript
// ==========================================

document.addEventListener('DOMContentLoaded', function() {

    // ------------------------------------------
    // NAVIGATION
    // ------------------------------------------
    
    // Sticky navbar with scroll effect
    var navbar = document.querySelector('.navbar');
    var lastScroll = 0;
    
    if (navbar) {
        window.addEventListener('scroll', function() {
            var currentScroll = window.pageYOffset;
            
            if (currentScroll > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            lastScroll = currentScroll;
        });
    }
    
    // Mobile hamburger menu
    var hamburger = document.querySelector('.hamburger');
    var mobileNav = document.querySelector('.mobile-nav');
    var mobileNavOverlay = document.querySelector('.mobile-nav-overlay');
    var mobileNavLinks = document.querySelectorAll('.mobile-nav a');
    
    function toggleMobileNav() {
        hamburger.classList.toggle('active');
        mobileNav.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    }
    
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileNav);
    }
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', toggleMobileNav);
    }
    
    mobileNavLinks.forEach(function(link) {
        link.addEventListener('click', toggleMobileNav);
    });

    // ------------------------------------------
    // ADMIN/PORTAL SIDEBAR (mobile drawer)
    // ------------------------------------------

    var portalSidebar = document.getElementById('sidebar');
    var sidebarToggleBtn = document.getElementById('sidebarToggle');
    var sidebarCloseBtn = document.getElementById('sidebarClose');
    var sidebarOverlayEl = document.getElementById('sidebarOverlay');

    function openSidebar() {
        if (!portalSidebar) return;
        portalSidebar.classList.add('active');
        if (sidebarOverlayEl) sidebarOverlayEl.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        if (!portalSidebar) return;
        portalSidebar.classList.remove('active');
        if (sidebarOverlayEl) sidebarOverlayEl.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', openSidebar);
    }
    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', closeSidebar);
    }
    if (sidebarOverlayEl) {
        sidebarOverlayEl.addEventListener('click', closeSidebar);
    }
    // Close the drawer whenever a nav link/tab is selected on mobile
    document.querySelectorAll('.sidebar-nav a').forEach(function(link) {
        link.addEventListener('click', closeSidebar);
    });
    
    // ------------------------------------------
    // SCROLL ANIMATIONS (Intersection Observer)
    // ------------------------------------------
    
    var animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    var observerOptions = {
        root: null,
        rootMargin: '0px 0px -80px 0px',
        threshold: 0.1
    };
    
    var observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(function(el) {
        observer.observe(el);
    });
    
    // ------------------------------------------
    // TALK TO A SENIOR OFFICER
    // (self-contained widget lives in senior-officer-chat.js)
    // ------------------------------------------

    function escapeHtml(text) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(text));
        return div.innerHTML;
    }
    
    // ------------------------------------------
    // FORM HANDLING - Submit to Firestore
    // ------------------------------------------
    
    // Care Request Form
    var careForm = document.getElementById('careRequestForm');
    if (careForm) {
        careForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(careForm)) return;
            
            var formData = new FormData(careForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            data.status = 'new';
            data.source = 'request_caregiver_form';
            
            var btn = careForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.classList.add('loading');
            
            FirebaseServices.careRequests.create(data).then(function() {
                if (typeof EmailNotifications !== 'undefined') {
                    EmailNotifications.send('care_request', data).catch(function(e) { console.warn(e); });
                }
                careForm.innerHTML = '<div class="inline-confirm">' +
                    '<div class="inline-confirm-icon"><i class="fas fa-check"></i></div>' +
                    '<h3>Request Submitted!</h3>' +
                    '<p>Thank you for reaching out, ' + escapeHtml(data.name || '') + '. Our care advisors will review your request and contact you within 24 hours.</p>' +
                    '<div class="inline-confirm-steps">' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">1</div><span>A senior care advisor will review your needs</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">2</div><span>We will match you with the best care options</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">3</div><span>You will receive a personalized care plan</span></div>' +
                    '</div>' +
                    '<a href="contact.html" class="btn btn-gold"><i class="fas fa-calendar-check"></i> Schedule a Call</a>' +
                    '</div>';
            }).catch(function(err) {
                showNotification('Error submitting request. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    
    // Career Application Form
    var careerForm = document.getElementById('careerForm');
    if (careerForm) {
        careerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(careerForm)) return;
            
            var formData = new FormData(careerForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            data.certifications = formData.getAll('certifications');
            data.type = 'career';
            
            var btn = careerForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.classList.add('loading');
            
            FirebaseServices.applications.create(data).then(function() {
                if (typeof EmailNotifications !== 'undefined') {
                    EmailNotifications.send('career', data).catch(function(e) { console.warn(e); });
                }
                FirebaseServices.activity.log({
                    type: 'application',
                    description: 'New career application from ' + data.name,
                    icon: 'fas fa-user-plus',
                    color: 'blue'
                }).catch(function(logErr) {
                    console.warn('Activity log skipped:', logErr);
                });
                showNotification('Your application has been submitted. We will review it and get back to you soon.', 'success');
                careerForm.reset();
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            }).catch(function(err) {
                showNotification('Error submitting application. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    
    // Provider Application Form
    var providerForm = document.getElementById('providerForm');
    if (providerForm) {
        providerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(providerForm)) return;
            
            var formData = new FormData(providerForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            data.paymentOptions = formData.getAll('paymentOptions');
            data.type = 'provider';
            
            var btn = providerForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            btn.classList.add('loading');
            
            FirebaseServices.applications.create(data).then(function() {
                if (typeof EmailNotifications !== 'undefined') {
                    EmailNotifications.send('provider', data).catch(function(e) { console.warn(e); });
                }
                FirebaseServices.activity.log({
                    type: 'application',
                    description: 'New provider application: ' + data.facilityName,
                    icon: 'fas fa-hospital',
                    color: 'gold'
                }).catch(function(logErr) {
                    console.warn('Activity log skipped:', logErr);
                });
                providerForm.innerHTML = '<div class="inline-confirm">' +
                    '<div class="inline-confirm-icon"><i class="fas fa-check"></i></div>' +
                    '<h3>Application Submitted!</h3>' +
                    '<p>Thank you for your interest in partnering with Mercy Senior Solutions. Our partnerships team will review your application and contact you within 48 hours.</p>' +
                    '<div class="inline-confirm-steps">' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">1</div><span>Our team will verify your facility credentials</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">2</div><span>A partnership specialist will reach out to you</span></div>' +
                    '<div class="inline-confirm-step"><div class="inline-confirm-step-num">3</div><span>We will set up your provider profile and listing</span></div>' +
                    '</div>' +
                    '<a href="contact.html" class="btn btn-gold"><i class="fas fa-phone"></i> Contact Us</a>' +
                    '</div>';
            }).catch(function(err) {
                showNotification('Error submitting application. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    


    // Contact Form
    var contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(contactForm)) return;
            
            var formData = new FormData(contactForm);
            var data = {};
            formData.forEach(function(value, key) {
                data[key] = value;
            });
            
            var btn = contactForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            btn.classList.add('loading');
            
            FirebaseServices.contactMessages.create(data).then(function() {
                if (typeof EmailNotifications !== 'undefined') {
                    EmailNotifications.send('contact', data).catch(function(e) { console.warn(e); });
                }
                showNotification('Your message has been sent. We will respond within 24 hours.', 'success');
                contactForm.reset();
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            }).catch(function(err) {
                showNotification('Error sending message. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
                btn.classList.remove('loading');
            });
        });
    }
    
    // Newsletter Form
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var emailInput = newsletterForm.querySelector('input[type="email"]');
            var email = emailInput.value.trim();
            
            FirebaseServices.newsletter.subscribe(email).then(function() {
                showNotification('Thank you for subscribing to our newsletter.', 'success');
                newsletterForm.reset();
            }).catch(function(err) {
                showNotification('Error subscribing. Please try again.', 'error');
                console.error(err);
            });
        });
    }
    
    // Star Rating Input (Leave a Review form)
    var starRatingInput = document.getElementById('starRatingInput');
    var reviewRatingInput = document.getElementById('reviewRatingInput');
    var reviewStarIcons = [];
    if (starRatingInput && reviewRatingInput) {
        reviewStarIcons = Array.prototype.slice.call(starRatingInput.querySelectorAll('i'));
        reviewStarIcons.forEach(function(star) {
            star.addEventListener('click', function() {
                var value = parseInt(this.getAttribute('data-value'));
                reviewRatingInput.value = value;
                reviewStarIcons.forEach(function(s) {
                    var sVal = parseInt(s.getAttribute('data-value'));
                    s.classList.toggle('active', sVal <= value);
                });
            });
        });
    }

    // Leave a Review Form
    var reviewForm = document.getElementById('reviewForm');
    if (reviewForm) {
        reviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var rating = parseInt(reviewRatingInput.value) || 0;
            if (rating < 1) {
                showNotification('Please select a star rating before submitting.', 'error');
                return;
            }
            if (!validateForm(reviewForm)) return;

            var formData = new FormData(reviewForm);
            var data = {};
            formData.forEach(function(value, key) {
                if (key === 'rating') return;
                data[key] = value;
            });
            data.rating = rating;
            data.status = 'pending';
            data.createdAt = (typeof firebase !== 'undefined' && firebase.firestore) ? firebase.firestore.FieldValue.serverTimestamp() : new Date();

            if (typeof db === 'undefined') {
                showNotification('Unable to submit review right now. Please try again later.', 'error');
                return;
            }

            var btn = reviewForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            db.collection('testimonials').add(data).then(function() {
                showNotification('Thank you! Your review has been submitted and is pending approval.', 'success');
                reviewForm.reset();
                reviewRatingInput.value = 0;
                reviewStarIcons.forEach(function(s) { s.classList.remove('active'); });
                btn.disabled = false;
                btn.innerHTML = origText;
            }).catch(function(err) {
                showNotification('Error submitting review. Please try again.', 'error');
                console.error(err);
                btn.disabled = false;
                btn.innerHTML = origText;
            });
        });
    }

    // Homepage Testimonials Loader (approved reviews from Firestore)
    function loadHomepageTestimonials() {
        var grid = document.getElementById('testimonialsGrid');
        if (!grid || typeof db === 'undefined') return;
        db.collection('testimonials').where('status', '==', 'approved').orderBy('createdAt', 'desc').limit(6).get().then(function(snap) {
            if (snap.empty) return; // keep the default sample testimonials in place
            var html = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var rating = Math.max(1, Math.min(5, parseInt(r.rating) || 5));
                var stars = '';
                for (var i = 1; i <= 5; i++) { stars += '<i class="' + (i <= rating ? 'fas' : 'far') + ' fa-star"></i>'; }
                var initial = (r.name || '?').trim().charAt(0).toUpperCase() || '?';
                html += '<div class="testimonial-card animated">' +
                    '<div class="testimonial-stars">' + stars + '</div>' +
                    '<p class="testimonial-quote">' + escapeHtml(r.message || '') + '</p>' +
                    '<div class="testimonial-author"><div class="testimonial-avatar">' + initial + '</div>' +
                    '<div class="testimonial-author-info"><h5>' + escapeHtml(r.name || 'Anonymous') + '</h5><span>' + escapeHtml(r.relationship || '') + '</span></div></div></div>';
            });
            grid.innerHTML = html;
        }).catch(function(err) { console.error('Error loading testimonials:', err); });
    }

    // ------------------------------------------
    // NOTIFICATION SYSTEM
    // ------------------------------------------
    
    function showNotification(message, type) {
        var existing = document.querySelector('.notification');
        if (existing) existing.remove();
        
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + (type || 'success');
        notification.innerHTML = '<div class="notification-content"><span>' + message + '</span><button class="notification-close">&times;</button></div>';
        
        document.body.appendChild(notification);
        
        setTimeout(function() {
            notification.classList.add('show');
        }, 10);
        
        notification.querySelector('.notification-close').addEventListener('click', function() {
            notification.classList.remove('show');
            setTimeout(function() { notification.remove(); }, 300);
        });
        
        setTimeout(function() {
            notification.classList.remove('show');
            setTimeout(function() { notification.remove(); }, 300);
        }, 5000);
    }
    
    // Add notification CSS dynamically
    var notificationStyles = document.createElement('style');
    notificationStyles.textContent = '\
        .notification {\
            position: fixed;\
            top: 100px;\
            right: 30px;\
            z-index: 10000;\
            max-width: 420px;\
            transform: translateX(120%);\
            transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);\
        }\
        .notification.show {\
            transform: translateX(0);\
        }\
        .notification-content {\
            background: white;\
            padding: 20px 24px;\
            border-radius: 14px;\
            box-shadow: 0 10px 40px rgba(0,0,0,0.12);\
            display: flex;\
            align-items: center;\
            justify-content: space-between;\
            gap: 16px;\
            border-left: 4px solid #2F7D4A;\
        }\
        .notification-success { border-left-color: #2F7D4A; }\
        .notification-error { border-left-color: #DC2626; }\
        .notification-content span {\
            font-family: "Lato", sans-serif;\
            font-size: 14px;\
            color: #1F2937;\
            line-height: 1.5;\
        }\
        .notification-close {\
            background: none;\
            border: none;\
            font-size: 20px;\
            color: #6B7280;\
            cursor: pointer;\
            padding: 0 4px;\
            line-height: 1;\
        }\
    ';
    document.head.appendChild(notificationStyles);
    
    // ------------------------------------------
    // INLINE FIELD VALIDATION (TASK 3)
    // ------------------------------------------
    
    function validateField(field) {
        var formGroup = field.closest('.form-group');
        if (!formGroup) return true;
        
        var errorEl = formGroup.querySelector('.field-error-message');
        var isValid = true;
        var message = '';
        
        if (field.hasAttribute('required') && !field.value.trim()) {
            isValid = false;
            message = 'This field is required';
        } else if (field.type === 'email' && field.value.trim()) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(field.value.trim())) {
                isValid = false;
                message = 'Please enter a valid email address';
            }
        } else if (field.type === 'tel' && field.value.trim()) {
            var phoneDigits = field.value.replace(/\D/g, '');
            if (phoneDigits.length < 10) {
                isValid = false;
                message = 'Please enter a valid phone number';
            }
        }
        
        if (isValid) {
            formGroup.classList.remove('field-error');
            if (errorEl) errorEl.remove();
        } else {
            formGroup.classList.add('field-error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.className = 'field-error-message';
                formGroup.appendChild(errorEl);
            }
            errorEl.textContent = message;
        }
        
        return isValid;
    }
    
    function validateForm(form) {
        var fields = form.querySelectorAll('input[required], select[required], textarea[required]');
        var allValid = true;
        fields.forEach(function(field) {
            if (!validateField(field)) {
                allValid = false;
            }
        });
        return allValid;
    }
    
    document.querySelectorAll('.form-group input, .form-group select, .form-group textarea').forEach(function(field) {
        field.addEventListener('blur', function() {
            if (this.hasAttribute('required') || this.type === 'email' || this.type === 'tel') {
                validateField(this);
            }
        });
        field.addEventListener('input', function() {
            var formGroup = this.closest('.form-group');
            if (formGroup && formGroup.classList.contains('field-error')) {
                validateField(this);
            }
        });
    });
    
    // ------------------------------------------
    // CHAT WIDGET BUSINESS HOURS (TASK 6)
    // ------------------------------------------
    
    function isWithinBusinessHours() {
        var now = new Date();
        var day = now.getDay();
        var hour = now.getHours();
        var minutes = now.getMinutes();
        var timeInMinutes = hour * 60 + minutes;
        
        if (day === 0) return false;
        if (day >= 1 && day <= 5) {
            return timeInMinutes >= 480 && timeInMinutes < 1080;
        }
        if (day === 6) {
            return timeInMinutes >= 540 && timeInMinutes < 900;
        }
        return false;
    }
    
    var chatStatusEl = document.querySelector('.chat-status');
    if (chatStatusEl) {
        if (!isWithinBusinessHours()) {
            chatStatusEl.textContent = 'Offline - Leave a message';
            chatStatusEl.style.color = 'rgba(255,255,255,0.5)';
            chatStatusEl.style.setProperty('--dot-color', '#6B7280');
            
            var chatMessagesContainer = document.querySelector('.chat-messages');
            if (chatMessagesContainer) {
                var welcomeMsg = chatMessagesContainer.querySelector('.chat-message.received p');
                if (welcomeMsg) {
                    welcomeMsg.textContent = 'Our office is currently closed. Leave us a message and we will get back to you on the next business day.';
                }
            }
        }
    }
    
    // ------------------------------------------
    // FIND CARE FORM (State/City dropdown logic)
    // ------------------------------------------

    var fcState = document.getElementById('fcState');
    var fcCity = document.getElementById('fcCity');
    var fcForm = document.getElementById('findCareForm');

    var US_STATE_CITIES = {
        'Alabama': ['Birmingham', 'Montgomery', 'Huntsville', 'Mobile', 'Tuscaloosa', 'Hoover', 'Dothan', 'Auburn', 'Decatur', 'Madison'],
        'Alaska': ['Anchorage', 'Fairbanks', 'Juneau', 'Sitka', 'Ketchikan', 'Wasilla', 'Kenai', 'Kodiak'],
        'Arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale', 'Gilbert', 'Tempe', 'Peoria', 'Surprise'],
        'Arkansas': ['Little Rock', 'Fort Smith', 'Fayetteville', 'Springdale', 'Jonesboro', 'Rogers', 'Conway', 'North Little Rock', 'Bentonville'],
        'California': ['Los Angeles', 'San Diego', 'San Jose', 'San Francisco', 'Fresno', 'Sacramento', 'Long Beach', 'Oakland', 'Bakersfield', 'Anaheim', 'Santa Ana', 'Riverside', 'Irvine'],
        'Colorado': ['Denver', 'Colorado Springs', 'Aurora', 'Fort Collins', 'Lakewood', 'Thornton', 'Arvada', 'Westminster', 'Pueblo', 'Boulder'],
        'Connecticut': ['Bridgeport', 'New Haven', 'Stamford', 'Hartford', 'Waterbury', 'Norwalk', 'Danbury', 'New Britain', 'Greenwich'],
        'Delaware': ['Wilmington', 'Dover', 'Newark', 'Middletown', 'Smyrna', 'Milford'],
        'Florida': ['Jacksonville', 'Miami', 'Tampa', 'Orlando', 'St. Petersburg', 'Hialeah', 'Tallahassee', 'Port St. Lucie', 'Cape Coral', 'Fort Lauderdale', 'Pembroke Pines'],
        'Georgia': ['Atlanta', 'Augusta', 'Columbus', 'Macon', 'Savannah', 'Athens', 'Sandy Springs', 'Roswell', 'Albany'],
        'Hawaii': ['Honolulu', 'Hilo', 'Kailua', 'Kapolei', 'Pearl City', 'Waipahu', 'Kaneohe'],
        'Idaho': ['Boise', 'Meridian', 'Nampa', 'Idaho Falls', 'Pocatello', 'Caldwell', "Coeur d'Alene", 'Twin Falls'],
        'Illinois': ['Chicago', 'Aurora', 'Naperville', 'Joliet', 'Rockford', 'Springfield', 'Elgin', 'Peoria', 'Champaign', 'Waukegan'],
        'Indiana': ['Indianapolis', 'Fort Wayne', 'Evansville', 'South Bend', 'Carmel', 'Fishers', 'Bloomington', 'Hammond', 'Gary'],
        'Iowa': ['Des Moines', 'Cedar Rapids', 'Davenport', 'Sioux City', 'Iowa City', 'Waterloo', 'Ames', 'Council Bluffs'],
        'Kansas': ['Wichita', 'Overland Park', 'Kansas City', 'Topeka', 'Olathe', 'Lawrence', 'Shawnee', 'Manhattan'],
        'Kentucky': ['Louisville', 'Lexington', 'Bowling Green', 'Owensboro', 'Covington', 'Richmond', 'Florence'],
        'Louisiana': ['New Orleans', 'Baton Rouge', 'Shreveport', 'Lafayette', 'Lake Charles', 'Kenner', 'Bossier City', 'Monroe'],
        'Maine': ['Portland', 'Lewiston', 'Bangor', 'South Portland', 'Auburn', 'Biddeford'],
        'Maryland': ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Waldorf', 'Frederick', 'Rockville', 'Bethesda', 'Gaithersburg', 'Annapolis'],
        'Massachusetts': ['Boston', 'Worcester', 'Springfield', 'Cambridge', 'Lowell', 'Brockton', 'New Bedford', 'Quincy', 'Lynn'],
        'Michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing', 'Flint', 'Dearborn', 'Livonia'],
        'Minnesota': ['Minneapolis', 'St. Paul', 'Rochester', 'Duluth', 'Bloomington', 'Brooklyn Park', 'Plymouth', 'St. Cloud'],
        'Mississippi': ['Jackson', 'Gulfport', 'Southaven', 'Hattiesburg', 'Biloxi', 'Meridian', 'Tupelo'],
        'Missouri': ['Kansas City', 'St. Louis', 'Springfield', 'Columbia', 'Independence', "Lee's Summit", "O'Fallon", 'St. Joseph'],
        'Montana': ['Billings', 'Missoula', 'Great Falls', 'Bozeman', 'Butte', 'Helena', 'Kalispell'],
        'Nebraska': ['Omaha', 'Lincoln', 'Bellevue', 'Grand Island', 'Kearney', 'Fremont'],
        'Nevada': ['Las Vegas', 'Henderson', 'Reno', 'North Las Vegas', 'Sparks', 'Carson City'],
        'New Hampshire': ['Manchester', 'Nashua', 'Concord', 'Dover', 'Rochester', 'Keene'],
        'New Jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Trenton', 'Clifton', 'Camden', 'Cherry Hill'],
        'New Mexico': ['Albuquerque', 'Las Cruces', 'Rio Rancho', 'Santa Fe', 'Roswell', 'Farmington'],
        'New York': ['New York City', 'Buffalo', 'Rochester', 'Yonkers', 'Syracuse', 'Albany', 'New Rochelle', 'Schenectady', 'Utica', 'White Plains'],
        'North Carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville', 'Cary', 'Wilmington', 'High Point', 'Asheville'],
        'North Dakota': ['Fargo', 'Bismarck', 'Grand Forks', 'Minot', 'West Fargo'],
        'Ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton', 'Parma', 'Canton', 'Youngstown'],
        'Oklahoma': ['Oklahoma City', 'Tulsa', 'Norman', 'Broken Arrow', 'Edmond', 'Lawton', 'Moore'],
        'Oregon': ['Portland', 'Eugene', 'Salem', 'Gresham', 'Hillsboro', 'Beaverton', 'Bend', 'Medford'],
        'Pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton', 'Bethlehem', 'Lancaster', 'Harrisburg'],
        'Rhode Island': ['Providence', 'Warwick', 'Cranston', 'Pawtucket', 'East Providence', 'Woonsocket'],
        'South Carolina': ['Columbia', 'Charleston', 'North Charleston', 'Mount Pleasant', 'Rock Hill', 'Greenville', 'Summerville'],
        'South Dakota': ['Sioux Falls', 'Rapid City', 'Aberdeen', 'Brookings', 'Watertown'],
        'Tennessee': ['Nashville', 'Memphis', 'Knoxville', 'Chattanooga', 'Clarksville', 'Murfreesboro', 'Franklin'],
        'Texas': ['Houston', 'San Antonio', 'Dallas', 'Austin', 'Fort Worth', 'El Paso', 'Arlington', 'Corpus Christi', 'Plano', 'Irving'],
        'Utah': ['Salt Lake City', 'West Valley City', 'Provo', 'West Jordan', 'Orem', 'Sandy', 'Ogden', 'St. George'],
        'Vermont': ['Burlington', 'South Burlington', 'Rutland', 'Essex', 'Montpelier'],
        'Virginia': ['Virginia Beach', 'Norfolk', 'Chesapeake', 'Richmond', 'Newport News', 'Alexandria', 'Hampton', 'Roanoke', 'Arlington'],
        'Washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Kent', 'Everett', 'Renton', 'Spokane Valley', 'Kirkland'],
        'West Virginia': ['Charleston', 'Huntington', 'Morgantown', 'Parkersburg', 'Wheeling'],
        'Wisconsin': ['Milwaukee', 'Madison', 'Green Bay', 'Kenosha', 'Racine', 'Appleton', 'Waukesha'],
        'Wyoming': ['Cheyenne', 'Casper', 'Laramie', 'Gillette', 'Rock Springs']
    };

    function populateFcCities(stateName) {
        if (!fcCity) return;
        var cities = US_STATE_CITIES[stateName] || [];
        fcCity.innerHTML = '<option value="">Select City</option>';
        cities.forEach(function(city) {
            fcCity.innerHTML += '<option value="' + city + '">' + city + '</option>';
        });
    }

    if (fcState) {
        fcState.addEventListener('change', function() {
            populateFcCities(this.value);
        });
    }

    if (fcForm) {
        fcForm.addEventListener('submit', function(e) {
            e.preventDefault();
            if (!validateForm(fcForm)) return;

            var state = document.getElementById('fcState').value;
            var city = document.getElementById('fcCity').value;
            var careType = document.getElementById('fcCareType').value;
            var name = document.getElementById('fcName').value.trim();
            var email = document.getElementById('fcEmail').value.trim();
            var phone = document.getElementById('fcPhone').value.trim();
            var familyGroup = document.getElementById('fcFamilyGroup').value;
            var notes = document.getElementById('fcNotes').value.trim();

            var addonCheckboxes = fcForm.querySelectorAll('input[name="addons"]:checked');
            var addons = [];
            addonCheckboxes.forEach(function(cb) { addons.push(cb.value); });

            var data = {
                state: state,
                city: city,
                careType: careType,
                name: name,
                email: email,
                phone: phone,
                familyGroup: familyGroup,
                addons: addons,
                notes: notes,
                source: 'find_care_form',
                status: 'new'
            };

            var btn = fcForm.querySelector('button[type="submit"]');
            var origText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            FirebaseServices.facilitiesRequest.create(data).then(function() {
                if (typeof EmailNotifications !== 'undefined') {
                    EmailNotifications.send('find_care', data).catch(function(e) { console.warn(e); });
                }
                fcForm.style.display = 'none';
                document.getElementById('findCareConfirm').style.display = '';
                btn.disabled = false;
                btn.innerHTML = origText;
            }).catch(function(err) {
                showNotification('Error submitting request. Please try again.', 'error');
                btn.disabled = false;
                btn.innerHTML = origText;
            });
        });
    }
    
    // ------------------------------------------
    // RESOURCE CATEGORY FILTER (TASK 5)
    // ------------------------------------------
    
    var filterPills = document.querySelectorAll('.resource-filter-pill');
    var resourceCards = document.querySelectorAll('.resource-card[data-modal]');
    
    if (filterPills.length > 0 && resourceCards.length > 0) {
        filterPills.forEach(function(pill) {
            pill.addEventListener('click', function() {
                filterPills.forEach(function(p) { p.classList.remove('active'); });
                this.classList.add('active');
                
                var filter = this.getAttribute('data-filter');
                
                resourceCards.forEach(function(card) {
                    if (filter === 'all') {
                        card.style.display = '';
                        return;
                    }
                    var badge = card.querySelector('.badge');
                    var category = badge ? badge.textContent.trim() : '';
                    card.style.display = (category === filter) ? '' : 'none';
                });
            });
        });
    }
    
    // ------------------------------------------
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ------------------------------------------
    
    document.querySelectorAll('a[href^="#"]').forEach(function(anchor) {
        anchor.addEventListener('click', function(e) {
            var targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            var target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                var offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ------------------------------------------
    // SEARCH FILTER TOGGLE (Families section)
    // ------------------------------------------
    
    var advancedToggle = document.querySelector('.advanced-toggle');
    var advancedFilters = document.querySelector('.advanced-filters');
    
    if (advancedToggle && advancedFilters) {
        advancedToggle.addEventListener('click', function() {
            advancedFilters.classList.toggle('active');
            this.textContent = advancedFilters.classList.contains('active') ? 'Hide Advanced Filters' : 'Show Advanced Filters';
        });
    }
    
    // ------------------------------------------
    // FILE UPLOAD PREVIEW
    // ------------------------------------------
    
    document.querySelectorAll('.file-upload input[type="file"]').forEach(function(input) {
        input.addEventListener('change', function() {
            var fileName = this.files[0] ? this.files[0].name : 'No file chosen';
            var label = this.parentElement.querySelector('.file-label');
            if (label) label.textContent = fileName;
        });
    });
    
    // ------------------------------------------
    // COUNTER ANIMATION (for stats)
    // ------------------------------------------
    
    var counters = document.querySelectorAll('.counter');
    
    function animateCounter(el) {
        var target = parseInt(el.getAttribute('data-target'));
        var suffix = el.getAttribute('data-suffix');
        if (suffix === null) suffix = '+';
        var current = 0;
        var increment = target / 60;
        var timer = setInterval(function() {
            current += increment;
            if (current >= target) {
                el.textContent = target.toLocaleString() + suffix;
                clearInterval(timer);
            } else {
                el.textContent = Math.floor(current).toLocaleString() + suffix;
            }
        }, 30);
    }
    
    var counterObserver = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(function(counter) {
        counterObserver.observe(counter);
    });
    
    // ------------------------------------------
    // PORTAL LOGOUT
    // ------------------------------------------
    
    var logoutLinks = document.querySelectorAll('.sidebar-logout');
    logoutLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            sessionStorage.removeItem('adminCreds');
            if (typeof auth !== 'undefined') {
                auth.signOut().then(function() {
                    window.location.href = 'login.html';
                }).catch(function() {
                    window.location.href = 'login.html';
                });
            } else {
                window.location.href = 'login.html';
            }
        });
    });
    
    // ------------------------------------------
    // PORTAL TAB SWITCHING
    // ------------------------------------------
    
    var sidebarTabs = document.querySelectorAll('.sidebar-nav a[data-tab]');
    var portalTabs = document.querySelectorAll('.portal-tab');
    var quickActions = document.querySelectorAll('.portal-quick-action');
    
    function switchTab(tabId) {
        // Update sidebar active state
        sidebarTabs.forEach(function(link) {
            link.classList.remove('active');
            if (link.getAttribute('data-tab') === tabId) {
                link.classList.add('active');
            }
        });
        
        // Show/hide tab content
        portalTabs.forEach(function(tab) {
            tab.classList.remove('active');
            if (tab.id === 'tab-' + tabId) {
                tab.classList.add('active');
            }
        });
        
        // Update URL hash without scrolling
        if (history.replaceState) {
            history.replaceState(null, null, '#' + tabId);
        }
        
        // Close mobile nav overlay
        var mobileNav = document.querySelector('.mobile-nav');
        if (mobileNav) mobileNav.classList.remove('active');
        var hamburger = document.querySelector('.hamburger');
        if (hamburger) hamburger.classList.remove('active');
        var overlay = document.querySelector('.mobile-nav-overlay');
        if (overlay) overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    sidebarTabs.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var tabId = this.getAttribute('data-tab');
            switchTab(tabId);
        });
    });
    
    quickActions.forEach(function(btn) {
        btn.addEventListener('click', function() {
            var tabId = this.getAttribute('data-tab');
            if (tabId) switchTab(tabId);
        });
    });
    
    // Load tab from URL hash
    var hash = window.location.hash.replace('#', '');
    if (hash) {
        switchTab(hash);
    }
    
    // ------------------------------------------
    // NAV SCROLL INDICATOR
    // ------------------------------------------
    
    var navLinksWrapper = document.querySelector('.nav-links-wrapper');
    var navScrollIndicator = document.querySelector('.nav-scroll-indicator');
    var navLinks = document.querySelector('.nav-links');
    
    if (navLinks && navScrollIndicator) {
        function checkNavScroll() {
            if (!navLinksWrapper || !navScrollIndicator) return;
            var isScrollable = navLinks.scrollWidth > navLinks.clientWidth;
            var isAtEnd = navLinks.scrollLeft + navLinks.clientWidth >= navLinks.scrollWidth - 10;
            
            if (!isScrollable || isAtEnd) {
                navScrollIndicator.classList.add('hidden');
            } else {
                navScrollIndicator.classList.remove('hidden');
            }
        }
        
        navLinks.addEventListener('scroll', checkNavScroll);
        window.addEventListener('resize', checkNavScroll);
        checkNavScroll();
    }
    
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a, .mobile-nav a').forEach(function(link) {
        var href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }
    });
    
    // ------------------------------------------
    // RESOURCE MODALS
    // ------------------------------------------
    
    var resourceCards = document.querySelectorAll('.resource-card[data-modal]');
    var activeModal = null;
    
    resourceCards.forEach(function(card) {
        card.addEventListener('click', function() {
            var modalId = this.getAttribute('data-modal');
            var modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
                activeModal = modal;
            }
        });
    });
    
    function closeResourceModal() {
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
            activeModal = null;
        }
    }
    
    document.querySelectorAll('.resource-modal-close').forEach(function(btn) {
        btn.addEventListener('click', closeResourceModal);
    });
    
    document.querySelectorAll('.resource-modal-overlay').forEach(function(overlay) {
        overlay.addEventListener('click', closeResourceModal);
    });
    
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') closeResourceModal();
    });
    
    // ------------------------------------------
    // TYPING EFFECT (for hero)
    // ------------------------------------------
    
    var typingElement = document.querySelector('.typing-text');
    if (typingElement) {
        var words = ['the Right Care.', 'Trusted Providers.', 'Compassionate Caregivers.'];
        var wordIndex = 0;
        var charIndex = 0;
        var isDeleting = false;
        
        function typeEffect() {
            var currentWord = words[wordIndex];
            
            if (isDeleting) {
                typingElement.textContent = currentWord.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typingElement.textContent = currentWord.substring(0, charIndex + 1);
                charIndex++;
            }
            
            var typeSpeed = isDeleting ? 50 : 100;
            
            if (!isDeleting && charIndex === currentWord.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }
            
            setTimeout(typeEffect, typeSpeed);
        }
        
        typeEffect();
    }
    
    // ------------------------------------------
    // HERO SLIDESHOW
    // ------------------------------------------
    
    var heroSlideshow = document.getElementById('heroSlideshow');
    var heroDotsContainer = document.getElementById('heroDots');
    
    if (heroSlideshow) {
        var heroSlides = heroSlideshow.querySelectorAll('.hero-slide');
        var currentSlide = 0;
        var slideInterval = null;
        var defaultHeroImages = [
            'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1571624436279-b272aff752b5?w=1920&h=1080&fit=crop',
            'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=1920&h=1080&fit=crop'
        ];
        
        function buildHeroDots(count) {
            if (!heroDotsContainer) return;
            heroDotsContainer.innerHTML = '';
            for (var i = 0; i < count; i++) {
                var dot = document.createElement('div');
                dot.className = 'hero-dot' + (i === 0 ? ' active' : '');
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', function() {
                    goToSlide(parseInt(this.getAttribute('data-index')));
                });
                heroDotsContainer.appendChild(dot);
            }
        }
        
        function goToSlide(index) {
            if (heroSlides.length === 0) return;
            heroSlides[currentSlide].classList.remove('active');
            currentSlide = index;
            heroSlides[currentSlide].classList.add('active');
            
            var dots = heroDotsContainer ? heroDotsContainer.querySelectorAll('.hero-dot') : [];
            dots.forEach(function(d, i) {
                d.classList.toggle('active', i === currentSlide);
            });
        }
        
        function nextSlide() {
            goToSlide((currentSlide + 1) % heroSlides.length);
        }
        
        function startSlideshow() {
            if (slideInterval) clearInterval(slideInterval);
            slideInterval = setInterval(nextSlide, 6000);
        }
        
        buildHeroDots(heroSlides.length);
        startSlideshow();
        
        if (typeof FirebaseServices !== 'undefined' && FirebaseServices.heroImages) {
            FirebaseServices.heroImages.getAll().then(function(snap) {
                if (snap.empty) return;
                
                heroSlideshow.innerHTML = '';
                heroSlides = [];
                var images = [];
                
                snap.forEach(function(doc) {
                    var img = doc.data();
                    if (img.active !== false && img.url) {
                        images.push(img);
                    }
                });
                
                if (images.length === 0) return;
                
                images.forEach(function(img, i) {
                    var slide = document.createElement('div');
                    slide.className = 'hero-slide' + (i === 0 ? ' active' : '');
                    slide.style.backgroundImage = "url('" + img.url + "')";
                    heroSlideshow.appendChild(slide);
                    heroSlides.push(slide);
                });
                
                currentSlide = 0;
                buildHeroDots(images.length);
                startSlideshow();
            }).catch(function() {
                console.log('Using default hero images');
            });
        }
        
        heroSlideshow.addEventListener('mouseenter', function() {
            if (slideInterval) clearInterval(slideInterval);
        });
        
        heroSlideshow.addEventListener('mouseleave', function() {
            startSlideshow();
        });
    }
    
    // ------------------------------------------
    // PORTAL DATA LOADING FROM FIRESTORE
    // ------------------------------------------
    
    // Only run if FirebaseServices is available
    if (typeof FirebaseServices === 'undefined') return;
    
    var page = window.location.pathname.split('/').pop() || 'index.html';
    
    var portalPages = ['admin.html', 'family-portal.html', 'caregiver-portal.html'];
    
    if (portalPages.indexOf(page) !== -1) {
        auth.onAuthStateChanged(function(user) {
            if (!user) {
                window.location.href = 'login.html';
                return;
            }
            
            db.collection('users').doc(user.uid).get().then(function(doc) {
                if (!doc.exists) {
                    auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }
                
                var userData = doc.data();
                var role = userData.role;
                
                // Admin guard
                if (page === 'admin.html' && role !== 'admin') {
                    auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }
                
                // Caregiver guard
                if (page === 'caregiver-portal.html' && role !== 'caregiver' && role !== 'admin') {
                    auth.signOut();
                    window.location.href = 'login.html';
                    return;
                }
                
                // Update user display
                var userName = userData.name || userData.firstName || user.email;
                
                if (page === 'admin.html') {
                    var adminUserEl = document.querySelector('.portal-user span');
                    if (adminUserEl) adminUserEl.textContent = 'Admin Dashboard';
                    initUserAvatar(document.getElementById('adminAvatar'), userName, user.uid, userData.profilePhoto);
                    loadAdminDashboard();
                }
                
                if (page === 'family-portal.html') {
                    var familyNameEl = document.getElementById('familyUserName');
                    if (familyNameEl) familyNameEl.textContent = 'Welcome, ' + userName;
                    initUserAvatar(document.getElementById('familyAvatar'), userName, user.uid, userData.profilePhoto);
                    loadFamilyDashboard(user.uid);
                    loadPortalReferral(user.uid, userName, 'family');
                }
                
                if (page === 'caregiver-portal.html') {
                    var cgNameEl = document.getElementById('caregiverUserName');
                    if (cgNameEl) cgNameEl.textContent = 'Welcome, ' + userName;
                    initUserAvatar(document.getElementById('caregiverAvatar'), userName, user.uid, userData.profilePhoto);
                    loadCaregiverDashboard(user.uid);
                    loadPortalReferral(user.uid, userName, 'cg');
                }
            });
        });
    }
    
    // ==========================================
    // USER AVATAR (INITIALS + CLOUDINARY UPLOAD)
    // ==========================================
    function getInitials(name) {
        if (!name) return '??';
        var parts = name.trim().split(/\s+/);
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
        return parts[0].charAt(0).toUpperCase() + parts[parts.length - 1].charAt(0).toUpperCase();
    }
    
    function initUserAvatar(avatarEl, name, userId, profilePhoto) {
        if (!avatarEl) return;
        avatarEl.innerHTML = '';
        
        if (profilePhoto) {
            var img = document.createElement('img');
            img.src = profilePhoto;
            img.alt = 'Profile';
            avatarEl.appendChild(img);
        } else {
            avatarEl.textContent = getInitials(name);
        }
        
        var overlay = document.createElement('div');
        overlay.className = 'avatar-upload-overlay';
        overlay.innerHTML = '<i class="fas fa-camera"></i>';
        avatarEl.appendChild(overlay);
        
        avatarEl.onclick = function() {
            openAvatarUpload(userId, avatarEl, name);
        };
    }
    
    function openAvatarUpload(userId, avatarEl, userName) {
        if (typeof cloudinary === 'undefined') {
            showNotification('Photo upload is not available right now.', 'error');
            return;
        }
        
        cloudinary.openUploadWidget({
            cloudName: 'qqwevfkz',
            uploadPreset: 'mercysolutions',
            folder: 'profiles',
            cropping: true,
            croppingAspectRatio: 1,
            maxImageSize: 2000000,
            sources: ['local', 'url'],
            styles: {
                palette: {
                    window: '#FFFFFF',
                    sourceBg: '#F5F7FA',
                    windowBorder: '#D4A33A',
                    activeTabBackground: '#081B3A',
                    activeTab: '#FFFFFF',
                    inactiveTab: '#6B7280',
                    inactiveTabBackground: '#E5E7EB'
                }
            }
        }, function(error, result) {
            if (error) {
                console.error('Avatar upload error:', error);
                return;
            }
            if (result && result.event === 'success') {
                var photoUrl = result.info.secure_url;
                avatarEl.innerHTML = '';
                var img = document.createElement('img');
                img.src = photoUrl;
                img.alt = 'Profile';
                avatarEl.appendChild(img);
                
                var overlay = document.createElement('div');
                overlay.className = 'avatar-upload-overlay';
                overlay.innerHTML = '<i class="fas fa-camera"></i>';
                avatarEl.appendChild(overlay);
                
                db.collection('users').doc(userId).update({ profilePhoto: photoUrl })
                    .then(function() {
                        showNotification('Profile photo updated.', 'success');
                    })
                    .catch(function() {
                        showNotification('Photo uploaded but could not save.', 'error');
                    });
            }
        });
    }
    
    // ==========================================
    // ADMIN DASHBOARD LOADER
    // ==========================================
    function loadAdminDashboard() {
        // Load counts from the 'users' collection by role
        FirebaseServices.users.countByRole('family').then(function(snap) {
            var el = document.getElementById('adminTotalFamilies');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalFamilies'); });
        
        FirebaseServices.users.countByRole('provider').then(function(snap) {
            var el = document.getElementById('adminTotalProviders');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalProviders'); });
        
        FirebaseServices.users.countByRole('caregiver').then(function(snap) {
            var el = document.getElementById('adminTotalCaregivers');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalCaregivers'); });
        
        FirebaseServices.referrals.count().then(function(snap) {
            var el = document.getElementById('adminTotalReferrals');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalReferrals'); });
        
        FirebaseServices.shifts.count().then(function(snap) {
            var el = document.getElementById('adminTotalShifts');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminTotalShifts'); });
        
        FirebaseServices.applications.countPending().then(function(snap) {
            var el = document.getElementById('adminPendingApps');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminPendingApps'); });
        
        FirebaseServices.contactMessages.countUnread().then(function(snap) {
            var el = document.getElementById('adminUnreadMsgs');
            if (el) el.textContent = snap.toLocaleString();
        }).catch(function() { setFallback('adminUnreadMsgs'); });
        
        // Revenue
        FirebaseServices.payments.getTotalThisMonth().then(function(snap) {
            var total = 0;
            snap.forEach(function(doc) {
                total += doc.data().amount || 0;
            });
            var el = document.getElementById('adminRevenue');
            if (el) el.textContent = FirebaseServices.formatCurrency(total);
        }).catch(function() { setFallback('adminRevenue', '$0'); });
        
        // Growth rate — compare this month vs last month users
        var now = new Date();
        var thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        var lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        var thisMonthCount = 0;
        var lastMonthCount = 0;
        
        db.collection('users').get().then(function(snap) {
            snap.forEach(function(doc) {
                var ts = doc.data().createdAt;
                if (!ts) return;
                var d;
                if (ts.toDate) d = ts.toDate();
                else if (ts.seconds) d = new Date(ts.seconds * 1000);
                else return;
                if (d >= thisMonthStart) thisMonthCount++;
                else if (d >= lastMonthStart) lastMonthCount++;
            });
            var growth = 0;
            if (lastMonthCount > 0) growth = Math.round(((thisMonthCount - lastMonthCount) / lastMonthCount) * 100);
            else if (thisMonthCount > 0) growth = 100;
            var gEl = document.getElementById('adminGrowth');
            if (gEl) gEl.textContent = (growth >= 0 ? '+' : '') + growth + '%';
        }).catch(function() { setFallback('adminGrowth', '0%'); });
        
        // Load activity
        loadAdminActivity();
        
        // Load pending actions
        loadAdminPendingActions();
        
        // Load charts
        loadAdminCharts();
        
        // Load analytics and reports into dashboard
        loadAdminAnalytics();
        loadAdminReports();
    }
    
    function loadAdminActivity() {
        var container = document.getElementById('adminActivityList');
        if (!container) return;
        
        FirebaseServices.activity.getAll(10).then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<div class="activity-item" style="text-align:center; padding:40px; color:#6B7280;"><p>No activity yet. Activity will appear here as users interact with the platform.</p></div>';
                return;
            }
            
            container.innerHTML = '';
            snap.forEach(function(doc) {
                var a = doc.data();
                var timeStr = FirebaseServices.formatTimestamp(a.timestamp);
                var iconColor = a.color || 'blue';
                
                container.innerHTML += '\
                    <div class="activity-item">\
                        <div class="activity-icon ' + iconColor + '"><i class="' + (a.icon || 'fas fa-info-circle') + '"></i></div>\
                        <div class="activity-info">\
                            <p>' + escapeHtml(a.description) + '</p>\
                            <span>' + timeStr + '</span>\
                        </div>\
                    </div>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading admin activity:', err);
        });
    }
    
    function loadAdminPendingActions() {
        var tbody = document.getElementById('adminPendingTable');
        if (!tbody) return;
        
        FirebaseServices.applications.getByType('provider').then(function(snap) {
            var pendingApps = [];
            snap.forEach(function(doc) {
                var a = doc.data();
                if (a.status === 'pending') {
                    pendingApps.push(a);
                }
            });
            
            FirebaseServices.applications.getByType('career').then(function(snap2) {
                snap2.forEach(function(doc) {
                    var a = doc.data();
                    if (a.status === 'pending') {
                        pendingApps.push(a);
                    }
                });
                
                if (pendingApps.length === 0) {
                    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No pending actions.</td></tr>';
                    return;
                }
                
                tbody.innerHTML = '';
                pendingApps.forEach(function(app) {
                    var dateStr = FirebaseServices.formatTimestamp(app.createdAt);
                    var priority = app.type === 'provider' ? 'active' : 'pending';
                    var priorityLabel = app.type === 'provider' ? 'High' : 'Medium';
                    
                    tbody.innerHTML += '\
                        <tr>\
                            <td><strong>' + escapeHtml(app.name || app.facilityName || 'Application') + '</strong></td>\
                            <td>' + (app.type === 'provider' ? 'Provider Application' : 'Career Application') + '</td>\
                            <td>' + dateStr + '</td>\
                            <td><span class="status-badge ' + priority + '">' + priorityLabel + '</span></td>\
                            <td><button class="btn btn-primary" style="padding: 8px 16px; font-size: 13px;">Review</button></td>\
                        </tr>\
                    ';
                });
            });
        }).catch(function(err) {
            console.error('Error loading pending actions:', err);
        });
    }
    
    function loadAdminCharts() {
        buildDashboardChart('adminReferralChart', 'referrals', 'rgba(8,27,58,');
        buildDashboardChart('adminRevenueChart', 'payments', 'rgba(212,163,58,');
    }
    
    function buildDashboardChart(containerId, collection, colorBase) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#6B7280;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        db.collection(collection).get().then(function(snap) {
            var monthCounts = {};
            var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var now = new Date();
            
            for (var i = 5; i >= 0; i--) {
                var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                var key = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
                monthCounts[key] = { label: monthNames[d.getMonth()], count: 0 };
            }
            
            snap.forEach(function(doc) {
                var data = doc.data();
                var ts = data.createdAt || data.timestamp;
                if (!ts) return;
                var date;
                if (ts.toDate) date = ts.toDate();
                else if (typeof ts === 'string') date = new Date(ts);
                else if (ts.seconds) date = new Date(ts.seconds * 1000);
                else return;
                var key = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
                if (monthCounts[key] !== undefined) monthCounts[key].count++;
            });
            
            var entries = Object.values(monthCounts);
            var maxVal = Math.max.apply(null, entries.map(function(e) { return e.count; }));
            if (maxVal === 0) maxVal = 1;
            
            container.innerHTML = '';
            entries.forEach(function(entry, i) {
                var heightPct = Math.max((entry.count / maxVal) * 100, 4);
                var shade = 0.15 + (i * 0.15);
                container.innerHTML += '<div style="flex:1; display:flex; flex-direction:column; align-items:center;">' +
                    '<div style="width:100%; background:' + colorBase + shade + '); border-radius: 8px 8px 0 0; height:' + heightPct + '%; min-height:4px; position:relative;">' +
                    '<span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:11px; font-weight:700; color:#081B3A;">' + entry.count + '</span></div>' +
                    '<span style="font-size:11px; color:#6B7280; margin-top:6px;">' + entry.label + '</span></div>';
            });
        }).catch(function(err) {
            console.error('Dashboard chart error:', err);
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#DC2626;">Error loading chart.</div>';
        });
    }
    
    // ==========================================
    // ==========================================
    // PORTAL REFERRAL LINK LOADER
    // ==========================================
    function loadPortalReferral(userId, userName, prefix) {
        prefix = prefix || 'family';
        var linkEl = document.getElementById(prefix + 'ReferralLink');
        var countEl = document.getElementById(prefix + 'ReferralCount');
        var listEl = document.getElementById(prefix + 'ReferralList');
        
        if (!linkEl) return;
        
        var code = '';
        db.collection('users').doc(userId).get().then(function(doc) {
            if (!doc.exists) return;
            var data = doc.data();
            code = data.referralCode || '';
            if (!code) {
                code = (userName || 'USER').replace(/[^a-zA-Z]/g, '').substring(0, 5).toUpperCase() + userId.substring(0, 4).toUpperCase();
                return db.collection('users').doc(userId).update({ referralCode: code }).then(function() { return code; });
            }
            return code;
        }).then(function(finalCode) {
            if (!finalCode) return;
            var baseUrl = window.location.origin + window.location.pathname.replace(/[^\/]*$/, 'register.html');
            linkEl.value = baseUrl + '?ref=' + finalCode;
            
            return FirebaseServices.users.countReferrals(userId);
        }).then(function(count) {
            if (countEl) countEl.textContent = count || 0;
            if (count > 0 && listEl) {
                return FirebaseServices.users.getReferralSignups(userId);
            }
        }).then(function(snap) {
            if (!snap || !listEl || snap.empty) return;
            var html = '<table class="dash-table" style="margin-top:12px;"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Date</th></tr></thead><tbody>';
            snap.forEach(function(doc) {
                var s = doc.data();
                html += '<tr><td>' + escapeHtml(s.newUserName || '--') + '</td><td>' + escapeHtml(s.newUserEmail || '--') + '</td><td>' + capitalize(s.newUserRole || 'family') + '</td><td>' + FirebaseServices.formatTimestamp(s.createdAt) + '</td></tr>';
            });
            html += '</tbody></table>';
            listEl.innerHTML = html;
        }).catch(function(err) {
            console.error('Referral loader error:', err);
        });
    }
    
    // ADMIN TAB SWITCHING & DATA LOADERS
    // ==========================================
    
    var adminTabsLoaded = {};
    
    var adminSidebarLinks = document.querySelectorAll('.sidebar-nav a[data-tab]');
    adminSidebarLinks.forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var tabId = this.getAttribute('data-tab');
            
            adminSidebarLinks.forEach(function(l) { l.classList.remove('active'); });
            this.classList.add('active');
            
            document.querySelectorAll('.portal-tab').forEach(function(tab) {
                tab.classList.remove('active');
            });
            var targetTab = document.getElementById('tab-' + tabId);
            if (targetTab) targetTab.classList.add('active');
            
            if (history.replaceState) {
                history.replaceState(null, null, '#' + tabId);
            }
            
            if (page === 'admin.html' && !adminTabsLoaded[tabId]) {
                adminTabsLoaded[tabId] = true;
                loadAdminTab(tabId);
            }
        });
    });
    
    var adminHash = window.location.hash.replace('#', '');
    if (adminHash && page === 'admin.html') {
        var hashLink = document.querySelector('.sidebar-nav a[data-tab="' + adminHash + '"]');
        if (hashLink) hashLink.click();
    }
    
    function loadAdminTab(tabId) {
        switch(tabId) {
            case 'users': loadAdminUsers(); break;
            case 'servicerequests': loadAdminCareRequests(); break;
            case 'carerequests': loadAdminActualCareRequests(); break;
            case 'contactmessages': loadAdminContactMessages(); break;
            case 'referrals': loadAdminReferrals(); break;
            case 'appointments': loadAdminAppointments(); break;
            case 'resources': loadAdminResources(); break;
            case 'testimonials': loadAdminTestimonials(); break;
            case 'applications': loadAdminApplications(); break;
            case 'shifts': loadAdminShifts(); break;
            case 'payments': loadAdminPayments(); break;
            case 'media': loadAdminMedia(); break;
            case 'content': loadAdminContent(); break;
            case 'emailtemplates': loadAdminEmailTemplates(); break;
            case 'settings': loadAdminSettings(); break;
        }
    }

    function loadAdminCaregivers() {
        var tbody = document.getElementById('caregiversTableBody');
        if (!tbody) return;

        FirebaseServices.users.getByRole('caregiver').then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#6B7280;">No caregiver accounts found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var u = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(u.createdAt);
                var status = u.active !== false ? 'active' : 'pending';
                var statusLabel = u.active !== false ? 'Active' : 'Inactive';
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</strong></td>\
                    <td>' + escapeHtml(u.email || '') + '</td>\
                    <td>' + escapeHtml(u.phone || '--') + '</td>\
                    <td>' + escapeHtml(u.availability || 'Flexible') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + statusLabel + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" onclick="adminViewUser(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminToggleUserActive(\'' + doc.id + '\', ' + (u.active !== false) + ')"><i class="fas fa-power-off"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminChangeUserRole(\'' + doc.id + '\', \'' + (u.role || 'caregiver') + '\')" title="Change Role"><i class="fas fa-user-tag"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteUser(\'caregiver\', \'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#DC2626;">Error loading caregivers.</td></tr>';
        });

        var searchEl = document.getElementById('caregiversSearch');
        if (searchEl) {
            searchEl.oninput = function() {
                var filter = this.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(function(row) {
                    row.style.display = row.textContent.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
                });
            };
        }
    }

    function loadAdminUsers() {
        loadAdminFamilies();
        if (!window._usersSubTabInitialized) {
            window._usersSubTabInitialized = true;
            var subNav = document.getElementById('usersSubNav');
            if (!subNav) return;
            subNav.querySelectorAll('[data-users-subtab]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    subNav.querySelectorAll('[data-users-subtab]').forEach(function(b) { b.classList.remove('active'); });
                    this.classList.add('active');
                    var subtab = this.getAttribute('data-users-subtab');
                    document.querySelectorAll('.users-subtab').forEach(function(el) { el.style.display = 'none'; });
                    var target = document.getElementById('subtab-' + subtab);
                    if (target) {
                        target.style.display = '';
                        if (subtab === 'families') loadAdminFamilies();
                        else if (subtab === 'caregivers') loadAdminCaregivers();
                        else if (subtab === 'admins') loadAdminAdmins();
                    }
                });
            });
        }
    }
    
    // --- FAMILIES ---
    function loadAdminFamilies() {
        var tbody = document.getElementById('familiesTableBody');
        if (!tbody) return;
        
        FirebaseServices.users.getByRole('family').then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#6B7280;">No family accounts found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            var familyDocs = [];
            snap.forEach(function(doc) { familyDocs.push({ id: doc.id, data: doc.data() }); });
            
            // Batch-load caregiver names
            var cgCache = {};
            familyDocs.forEach(function(item) {
                var u = item.data;
                var cgId = u.assignedCaregiverId || '';
                var dateStr = FirebaseServices.formatTimestamp(u.createdAt);
                var status = u.active !== false ? 'active' : 'pending';
                var statusLabel = u.active !== false ? 'Active' : 'Inactive';
                var cgName = cgId ? (cgCache[cgId] || 'Loading...') : '--';
                
                tbody.innerHTML += '<tr data-family-id="' + item.id + '" data-cg="' + cgId + '">\
                    <td><strong>' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</strong></td>\
                    <td>' + escapeHtml(u.email || '') + '</td>\
                    <td>' + escapeHtml(u.phone || '--') + '</td>\
                    <td class="assign-cg-cell" data-family-id="' + item.id + '" data-cg-id="' + cgId + '">' + (cgId ? '<span class="cg-name-placeholder" data-cg-id="' + cgId + '">Loading...</span>' : '<span class="no-cg">--</span>') + ' <button class="admin-action-btn edit assign-cg-btn" data-family-id="' + item.id + '" title="Assign Caregiver"><i class="fas fa-user-plus"></i></button></td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + statusLabel + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" onclick="adminViewUser(\'' + item.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminToggleUserActive(\'' + item.id + '\', ' + (u.active !== false) + ')"><i class="fas fa-power-off"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminChangeUserRole(\'' + item.id + '\', \'' + (u.role || 'family') + '\')" title="Change Role"><i class="fas fa-user-tag"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteUser(\'family\', \'' + item.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
                
                if (cgId && !cgCache[cgId]) {
                    db.collection('users').doc(cgId).get().then(function(cgDoc) {
                        if (cgDoc.exists) {
                            var cg = cgDoc.data();
                            var name = cg.name || cg.firstName + ' ' + (cg.lastName || '');
                            cgCache[cgId] = name;
                            var placeholder = tbody.querySelector('.cg-name-placeholder[data-cg-id="' + cgId + '"]');
                            if (placeholder) placeholder.textContent = name;
                        } else {
                            var placeholder = tbody.querySelector('.cg-name-placeholder[data-cg-id="' + cgId + '"]');
                            if (placeholder) placeholder.textContent = '(deleted)';
                        }
                    }).catch(function() {
                        var placeholder = tbody.querySelector('.cg-name-placeholder[data-cg-id="' + cgId + '"]');
                        if (placeholder) placeholder.textContent = 'Error';
                    });
                }
            });
            
            // Assign caregiver buttons
            tbody.querySelectorAll('.assign-cg-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var familyId = this.getAttribute('data-family-id');
                    var currentCg = tbody.querySelector('tr[data-family-id="' + familyId + '"]');
                    var currentCgId = currentCg ? currentCg.getAttribute('data-cg') : '';
                    promptAssignCaregiver(familyId, currentCgId, tbody);
                });
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#DC2626;">Error loading families.</td></tr>';
        });
        
        var searchEl = document.getElementById('familiesSearch');
        if (searchEl) {
            searchEl.oninput = function() {
                var filter = this.value.toLowerCase();
                tbody.querySelectorAll('tr').forEach(function(row) {
                    row.style.display = row.textContent.toLowerCase().indexOf(filter) > -1 ? '' : 'none';
                });
            };
        }
    }
    
    function promptAssignCaregiver(familyId, currentCgId, tbody) {
        // Build a caregiver select popup
        var overlay = document.createElement('div');
        overlay.className = 'admin-modal active';
        overlay.style.display = 'flex';
        overlay.innerHTML = '<div class="admin-modal-content" style="max-width:420px;">\
            <div class="admin-modal-header"><h3>Assign Caregiver</h3><button class="admin-modal-close close-assign-modal">&times;</button></div>\
            <div class="admin-form-grid">\
                <div class="form-group"><label>Select Caregiver</label><select id="assignCgSelect"><option value="">-- None --</option></select></div>\
            </div>\
            <div class="admin-modal-actions">\
                <button type="button" class="btn btn-outline close-assign-modal">Cancel</button>\
                <button type="button" class="btn btn-gold" id="confirmAssignCg"><i class="fas fa-check"></i> Assign</button>\
            </div>\
        </div>';
        document.body.appendChild(overlay);
        
        // Load caregivers
        var select = overlay.querySelector('#assignCgSelect');
        FirebaseServices.users.getByRole('caregiver').then(function(snap) {
            snap.forEach(function(doc) {
                var cg = doc.data();
                var name = cg.name || cg.firstName + ' ' + (cg.lastName || '');
                if (currentCgId === doc.id) {
                    select.innerHTML += '<option value="' + doc.id + '" selected>' + escapeHtml(name) + ' (' + escapeHtml(cg.email || '') + ')</option>';
                } else {
                    select.innerHTML += '<option value="' + doc.id + '">' + escapeHtml(name) + ' (' + escapeHtml(cg.email || '') + ')</option>';
                }
            });
        }).catch(function() {});
        
        overlay.querySelectorAll('.close-assign-modal').forEach(function(el) {
            el.addEventListener('click', function() { overlay.remove(); });
        });
        overlay.querySelector('#confirmAssignCg').addEventListener('click', function() {
            var cgId = select.value;
            var updateData = {};
            if (cgId) {
                updateData.assignedCaregiverId = cgId;
            } else {
                updateData.assignedCaregiverId = firebase.firestore.FieldValue.delete();
            }
            db.collection('users').doc(familyId).update(updateData).then(function() {
                showNotification('Caregiver assigned!', 'success');
                overlay.remove();
                loadAdminFamilies();
            }).catch(function(err) {
                showNotification('Error assigning caregiver.', 'error');
            });
        });
    }
    

    
    // --- CAREGIVERS ---
    // --- CARE REQUESTS ---
    function loadAdminCareRequests() {
        var tbody = document.getElementById('serviceRequestsTableBody');
        if (!tbody) return;

        FirebaseServices.facilitiesRequest.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#6B7280;">No facility requests found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);
                var status = r.status || 'new';

                tbody.innerHTML += '<tr data-status="' + status + '">\
                    <td><strong>' + escapeHtml(r.name || '--') + '</strong></td>\
                    <td>' + escapeHtml(r.email || '--') + '</td>\
                    <td>' + escapeHtml(r.phone || '--') + '</td>\
                    <td>' + escapeHtml(r.state || '--') + '</td>\
                    <td>' + escapeHtml(r.city || '--') + '</td>\
                    <td>' + escapeHtml(r.careType || '--') + '</td>\
                    <td>' + escapeHtml(r.familyGroup || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" title="View Details" onclick="adminViewCareRequest(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteFacilityRequest(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#DC2626;">Error loading facility requests.</td></tr>';
        });

        initModalClose('srDetailModal');
    }

    window.adminViewCareRequest = function(id) {
        FirebaseServices.facilitiesRequest.getAll().then(function(snap) {
            var r = null;
            snap.forEach(function(doc) {
                if (doc.id === id) r = doc.data();
            });
            if (!r) {
                showNotification('Request data not found.', 'error');
                return;
            }

            var modal = document.getElementById('srDetailModal');
            if (!modal) return;

            document.getElementById('srDetailName').textContent = r.name || '--';
            document.getElementById('srDetailEmail').textContent = r.email || '--';
            document.getElementById('srDetailPhone').textContent = r.phone || '--';
            document.getElementById('srDetailDate').textContent = FirebaseServices.formatTimestamp(r.createdAt);
            document.getElementById('srDetailCareType').textContent = r.careType || '--';
            document.getElementById('srDetailFamilyGroup').textContent = r.familyGroup || '--';
            document.getElementById('srDetailState').textContent = r.state || '--';
            document.getElementById('srDetailCity').textContent = r.city || '--';
            var addonsEl = document.getElementById('srDetailAddons');
            var addons = r.addons || [];
            addonsEl.innerHTML = addons.length ? addons.map(function(a) { return '<span class="badge">' + escapeHtml(a) + '</span>'; }).join(' ') : 'None';
            document.getElementById('srDetailNotes').textContent = r.notes || '--';

            var status = r.status || 'new';
            document.getElementById('srDetailStatusBadge').textContent = status.replace('_', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
            document.getElementById('srDetailStatusBadge').className = 'status-badge ' + status;

            var reviewedEl = document.getElementById('srDetailReviewed');
            if (reviewedEl) {
                reviewedEl.checked = r.reviewed === true;
                reviewedEl.onchange = function() {
                    FirebaseServices.facilitiesRequest.update(id, { reviewed: reviewedEl.checked }).catch(function(err) {
                        showNotification('Error updating review status.', 'error');
                    });
                };
            }

            modal.classList.add('active');
        });
    };

    // --- CARE REQUESTS (people requesting a caregiver, from the Request a Caregiver form) ---
    function loadAdminActualCareRequests() {
        var tbody = document.getElementById('careRequestsTableBody');
        if (!tbody) return;

        FirebaseServices.careRequests.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#6B7280;">No care requests found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);

                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(r.name || '--') + '</strong></td>\
                    <td>' + escapeHtml(r.phone || '--') + '</td>\
                    <td>' + escapeHtml(r.email || '--') + '</td>\
                    <td>' + escapeHtml(r.city || '--') + '</td>\
                    <td>' + escapeHtml(r.careType || '--') + '</td>\
                    <td>' + escapeHtml(r.hoursNeeded || '--') + '</td>\
                    <td>' + escapeHtml(r.startDate || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" title="View Details" onclick="adminViewActualCareRequest(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteCareRequest(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:30px; color:#DC2626;">Error loading care requests.</td></tr>';
        });

        initModalClose('acrDetailModal');
    }

    window.adminViewActualCareRequest = function(id) {
        FirebaseServices.careRequests.getById(id).then(function(doc) {
            if (!doc.exists) {
                showNotification('Request data not found.', 'error');
                return;
            }
            var r = doc.data();

            var modal = document.getElementById('acrDetailModal');
            if (!modal) return;

            document.getElementById('acrDetailName').textContent = r.name || '--';
            document.getElementById('acrDetailEmail').textContent = r.email || '--';
            document.getElementById('acrDetailPhone').textContent = r.phone || '--';
            document.getElementById('acrDetailDate').textContent = FirebaseServices.formatTimestamp(r.createdAt);
            document.getElementById('acrDetailCity').textContent = r.city || '--';
            document.getElementById('acrDetailCareType').textContent = r.careType || '--';
            document.getElementById('acrDetailHours').textContent = r.hoursNeeded || '--';
            document.getElementById('acrDetailDays').textContent = r.daysNeeded || '--';
            document.getElementById('acrDetailStartDate').textContent = r.startDate || '--';
            document.getElementById('acrDetailBudget').textContent = r.budget || '--';
            document.getElementById('acrDetailComments').textContent = r.comments || '--';

            var status = r.status || 'new';
            document.getElementById('acrDetailStatusBadge').textContent = status.replace('_', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
            document.getElementById('acrDetailStatusBadge').className = 'status-badge ' + status;

            var reviewedEl = document.getElementById('acrDetailReviewed');
            if (reviewedEl) {
                reviewedEl.checked = r.reviewed === true;
                reviewedEl.onchange = function() {
                    FirebaseServices.careRequests.update(id, { reviewed: reviewedEl.checked }).catch(function(err) {
                        showNotification('Error updating review status.', 'error');
                    });
                };
            }

            modal.classList.add('active');
        }).catch(function(err) {
            showNotification('Error loading request details.', 'error');
        });
    };

    // --- CONTACT MESSAGES (general inquiries from the Contact Us form) ---
    function loadAdminContactMessages() {
        var tbody = document.getElementById('contactMessagesTableBody');
        if (!tbody) return;

        FirebaseServices.contactMessages.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No contact messages found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);

                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(r.name || '--') + '</strong></td>\
                    <td>' + escapeHtml(r.phone || '--') + '</td>\
                    <td>' + escapeHtml(r.email || '--') + '</td>\
                    <td>' + escapeHtml(r.subject || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" title="View Details" onclick="adminViewContactMessage(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteContactMessage(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading contact messages.</td></tr>';
        });

        initModalClose('cmDetailModal');
    }

    window.adminViewContactMessage = function(id) {
        FirebaseServices.contactMessages.getAll().then(function(snap) {
            var r = null;
            snap.forEach(function(doc) {
                if (doc.id === id) r = doc.data();
            });
            if (!r) {
                showNotification('Message data not found.', 'error');
                return;
            }

            var modal = document.getElementById('cmDetailModal');
            if (!modal) return;

            document.getElementById('cmDetailName').textContent = r.name || '--';
            document.getElementById('cmDetailEmail').textContent = r.email || '--';
            document.getElementById('cmDetailPhone').textContent = r.phone || '--';
            document.getElementById('cmDetailDate').textContent = FirebaseServices.formatTimestamp(r.createdAt);
            document.getElementById('cmDetailSubject').textContent = r.subject || '--';
            document.getElementById('cmDetailMessage').textContent = r.message || '--';

            var reviewedEl = document.getElementById('cmDetailReviewed');
            if (reviewedEl) {
                reviewedEl.checked = r.reviewed === true;
                reviewedEl.onchange = function() {
                    FirebaseServices.contactMessages.update(id, { reviewed: reviewedEl.checked }).catch(function(err) {
                        showNotification('Error updating review status.', 'error');
                    });
                };
            }

            modal.classList.add('active');
        });
    };

    // --- REFERRALS ---
    // Cache of loaded referral (care request) docs, keyed by id, so the full-screen
    // detail/allocate modal can read them without an extra Firestore round trip.
    window._referralsCache = window._referralsCache || {};

    function loadAdminReferrals() {
        var tbody = document.getElementById('referralsTableBody');
        if (!tbody) return;
        
        FirebaseServices.referrals.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#6B7280;">No referrals found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                window._referralsCache[doc.id] = r;
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);
                var budgetStr = r.budget ? FirebaseServices.formatCurrency(r.budget) : '--';
                var status = r.status || 'new';
                
                tbody.innerHTML += '<tr data-status="' + status + '">\
                    <td>' + escapeHtml(r.familyName || r.name || '--') + '</td>\
                    <td>' + escapeHtml(r.patientName || '--') + '</td>\
                    <td>' + escapeHtml(r.careType || '--') + '</td>\
                    <td>' + budgetStr + '</td>\
                    <td>' + escapeHtml(r.providerName || 'Unassigned') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.replace('_', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); })) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" title="View &amp; Allocate" onclick="adminViewReferral(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn edit" title="Quick status update" onclick="adminUpdateReferralStatus(\'' + doc.id + '\', \'' + status + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteReferral(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#DC2626;">Error loading referrals.</td></tr>';
        });
    }

    // Referrals status filter (client-side, on already-loaded rows)
    document.querySelectorAll('#tab-referrals .admin-filter-bar [data-filter]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#tab-referrals .admin-filter-bar [data-filter]').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            var filter = this.getAttribute('data-filter');
            document.querySelectorAll('#referralsTableBody tr[data-status]').forEach(function(row) {
                row.style.display = (filter === 'all' || row.getAttribute('data-status') === filter) ? '' : 'none';
            });
        });
    });
    
    // --- APPOINTMENTS ---
    function loadAdminAppointments() {
        var tbody = document.getElementById('appointmentsTableBody');
        if (!tbody) return;
        
        FirebaseServices.tours.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No appointments scheduled.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var t = doc.data();
                var status = t.status || 'scheduled';
                
                tbody.innerHTML += '<tr>\
                    <td>' + escapeHtml(t.familyName || '--') + '</td>\
                    <td>' + escapeHtml(t.facilityName || '--') + '</td>\
                    <td>' + escapeHtml(t.date || '--') + '</td>\
                    <td>' + escapeHtml(t.time || '--') + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminUpdateTourStatus(\'' + doc.id + '\', \'' + status + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminDeleteTour(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading appointments.</td></tr>';
        });
    }
    
    // --- RESOURCES ---
    function loadAdminResources() {
        var tbody = document.getElementById('resourcesTableBody');
        if (!tbody) return;
        
        FirebaseServices.blogPosts.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No resources found. Click "New Resource" to create one.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var p = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(p.createdAt);
                var status = p.status || 'draft';
                
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(p.title || '--') + '</strong></td>\
                    <td>' + escapeHtml(p.category || '--') + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td>' + (p.views || 0) + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminEditResource(\'' + doc.id + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminDeleteResource(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading resources.</td></tr>';
        });
        
        var addBtn = document.getElementById('addResourceBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('resourceModalTitle').textContent = 'New Resource';
                document.getElementById('resourceForm').reset();
                document.querySelector('input[name="resourceId"]').value = '';
                document.getElementById('resourceModal').classList.add('active');
            };
        }
        
        var resourceForm = document.getElementById('resourceForm');
        if (resourceForm) {
            resourceForm.onsubmit = function(e) {
                e.preventDefault();
                var fd = new FormData(this);
                var data = {};
                fd.forEach(function(val, key) { data[key] = val; });
                
                var id = data.resourceId;
                delete data.resourceId;
                data.slug = (data.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
                
                var btn = this.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                btn.disabled = true;
                
                var promise = id ? FirebaseServices.blogPosts.update(id, data) : FirebaseServices.blogPosts.create(data);
                
                promise.then(function() {
                    document.getElementById('resourceModal').classList.remove('active');
                    btn.innerHTML = 'Save Resource';
                    btn.disabled = false;
                    loadAdminResources();
                }).catch(function(err) {
                    showNotification('Error saving resource: ' + err.message, 'error');
                    btn.innerHTML = 'Save Resource';
                    btn.disabled = false;
                });
            };
        }
        
        initModalClose('resourceModal');
    }
    
    // --- APPLICATIONS ---
    function loadAdminApplications() {
        var tbody = document.getElementById('applicationsTableBody');
        if (!tbody) return;

        initModalClose('appDetailModal');
        
        FirebaseServices.applications.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#6B7280;">No applications found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var a = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(a.createdAt);
                var status = a.status || 'pending';
                var typeLabel = a.type === 'provider' ? 'Provider' : 'Career';
                
                tbody.innerHTML += '<tr data-status="' + status + '">\
                    <td><strong>' + escapeHtml(a.name || a.facilityName || '--') + '</strong></td>\
                    <td>' + typeLabel + '</td>\
                    <td>' + escapeHtml(a.email || '--') + '</td>\
                    <td>' + escapeHtml(a.phone || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn view" title="View Details" onclick="adminViewApplication(\'' + doc.id + '\')"><i class="fas fa-eye"></i></button>\
                        <button class="admin-action-btn edit" title="Change Status" onclick="adminChangeApplicationStatus(\'' + doc.id + '\', \'' + status + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteApplication(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:30px; color:#DC2626;">Error loading applications.</td></tr>';
        });
    }

    // Applications status filter (client-side, on already-loaded rows)
    document.querySelectorAll('#tab-applications .admin-filter-bar [data-filter]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#tab-applications .admin-filter-bar [data-filter]').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            var filter = this.getAttribute('data-filter');
            document.querySelectorAll('#applicationsTableBody tr[data-status]').forEach(function(row) {
                row.style.display = (filter === 'all' || row.getAttribute('data-status') === filter) ? '' : 'none';
            });
        });
    });
    
    // --- TESTIMONIALS ---
    function loadAdminTestimonials() {
        var tbody = document.getElementById('testimonialsTableBody');
        if (!tbody) return;
        if (typeof db === 'undefined') {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Database not available.</td></tr>';
            return;
        }
        db.collection('testimonials').orderBy('createdAt', 'desc').get().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No reviews submitted yet.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var rating = Math.max(0, Math.min(5, parseInt(r.rating) || 0));
                var starsHtml = '';
                for (var i = 1; i <= 5; i++) { starsHtml += '<i class="' + (i <= rating ? 'fas' : 'far') + ' fa-star" style="color:#D4A33A;"></i>'; }
                var status = r.status || 'pending';
                var dateStr = (typeof FirebaseServices !== 'undefined' && FirebaseServices.formatTimestamp) ? FirebaseServices.formatTimestamp(r.createdAt) : '--';
                tbody.innerHTML += '<tr data-status="' + status + '">' +
                    '<td><strong>' + escapeHtml(r.name || 'Anonymous') + '</strong><br><span style="color:#6B7280; font-size:12px;">' + escapeHtml(r.relationship || '') + '</span></td>' +
                    '<td>' + starsHtml + '</td>' +
                    '<td style="max-width:320px;">' + escapeHtml(r.message || '') + '</td>' +
                    '<td>' + dateStr + '</td>' +
                    '<td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>' +
                    '<td><div class="admin-action-btns">' +
                        (status !== 'approved' ? '<button class="admin-action-btn view" title="Approve" onclick="adminUpdateTestimonialStatus(\'' + doc.id + '\', \'approved\')"><i class="fas fa-check"></i></button>' : '') +
                        (status !== 'rejected' ? '<button class="admin-action-btn edit" title="Reject" onclick="adminUpdateTestimonialStatus(\'' + doc.id + '\', \'rejected\')"><i class="fas fa-ban"></i></button>' : '') +
                        '<button class="admin-action-btn delete" title="Delete" onclick="adminDeleteTestimonial(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>' +
                    '</div></td>' +
                '</tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading reviews.</td></tr>';
        });
    }
    
    // Testimonials status filter (client-side, on already-loaded rows)
    document.querySelectorAll('#tab-testimonials [data-testimonial-filter]').forEach(function(btn) {
        btn.addEventListener('click', function() {
            document.querySelectorAll('#tab-testimonials [data-testimonial-filter]').forEach(function(b) { b.classList.remove('active'); });
            this.classList.add('active');
            var filter = this.getAttribute('data-testimonial-filter');
            document.querySelectorAll('#testimonialsTableBody tr[data-status]').forEach(function(row) {
                row.style.display = (filter === 'all' || row.getAttribute('data-status') === filter) ? '' : 'none';
            });
        });
    });
    
    // --- SHIFTS ---
    function loadAdminShifts() {
        var tbody = document.getElementById('shiftsTableBody');
        if (!tbody) return;
        
        FirebaseServices.shifts.getAll().then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#6B7280;">No shifts found. Create one to assign a caregiver to a care request.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var s = doc.data();
                var dateStr = s.date || FirebaseServices.formatTimestamp(s.createdAt);
                var status = s.status || 'open';
                var statusClass = status === 'upcoming' ? 'active' : status === 'completed' ? 'green' : 'pending';
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(s.clientName || '--') + '</strong></td>\
                    <td>' + escapeHtml(s.caregiverName || 'Unassigned') + '</td>\
                    <td>' + escapeHtml(dateStr) + '</td>\
                    <td>' + escapeHtml(s.startTime || '--') + ' - ' + escapeHtml(s.endTime || '--') + '</td>\
                    <td>' + escapeHtml(s.type || '--') + '</td>\
                    <td>' + (s.rate ? '$' + s.rate + '/hr' : '--') + '</td>\
                    <td><span class="status-badge ' + statusClass + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminUpdateShiftStatus(\'' + doc.id + '\', \'completed\')"><i class="fas fa-check"></i></button>\
                        <button class="admin-action-btn delete" onclick="adminDeleteShift(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center; padding:30px; color:#DC2626;">Error loading shifts.</td></tr>';
        });
        
        // Add shift button handler
        var addBtn = document.getElementById('addShiftBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('shiftForm').reset();
                poplateShiftForm();
                document.getElementById('shiftModal').classList.add('active');
            };
        }
        
        // Shift form submit
        var shiftForm = document.getElementById('shiftForm');
        if (shiftForm) {
            shiftForm.onsubmit = function(e) {
                e.preventDefault();
                var sel = document.getElementById('shiftCareRequest');
                var careReq = sel.options[sel.selectedIndex];
                var caregiverSel = document.getElementById('shiftCaregiver');
                var caregiver = caregiverSel.options[caregiverSel.selectedIndex];
                
                if (!careReq || !careReq.value) { showNotification('Select a care request.', 'error'); return; }
                if (!caregiver || !caregiver.value) { showNotification('Select a caregiver.', 'error'); return; }
                
                var fd = new FormData(this);
                var data = {};
                fd.forEach(function(val, key) { data[key] = val; });
                
                data.clientName = careReq.getAttribute('data-name');
                data.caregiverId = caregiver.value;
                data.caregiverName = caregiver.text;
                data.careRequestId = careReq.value;
                data.status = 'open';
                
                var btn = this.querySelector('button[type="submit"]');
                btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
                btn.disabled = true;
                
                FirebaseServices.shifts.create(data).then(function() {
                    showNotification('Shift created!', 'success');
                    document.getElementById('shiftModal').classList.remove('active');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Shift';
                    btn.disabled = false;
                    loadAdminShifts();
                }).catch(function(err) {
                    showNotification('Error: ' + err.message, 'error');
                    btn.innerHTML = '<i class="fas fa-plus"></i> Create Shift';
                    btn.disabled = false;
                });
            };
        }
        
        initModalClose('shiftModal');
    }
    
    function poplateShiftForm() {
        // Populate care requests
        var reqSel = document.getElementById('shiftCareRequest');
        if (reqSel) {
            reqSel.innerHTML = '<option value="">Select a care request</option>';
            FirebaseServices.careRequests.getAll().then(function(snap) {
                if (snap.empty) {
                    reqSel.innerHTML = '<option value="">No care requests found</option>';
                    return;
                }
                snap.forEach(function(doc) {
                    var r = doc.data();
                    reqSel.innerHTML += '<option value="' + doc.id + '" data-name="' + escapeHtml(r.name || r.familyName || 'Unknown') + '">' + escapeHtml(r.name || r.familyName || 'Unknown') + ' - ' + escapeHtml(r.careType || '--') + '</option>';
                });
            }).catch(function() {});
        }
        
        // Populate caregivers
        var cgSel = document.getElementById('shiftCaregiver');
        if (cgSel) {
            cgSel.innerHTML = '<option value="">Select a caregiver</option>';
            FirebaseServices.users.getByRole('caregiver').then(function(snap) {
                if (snap.empty) {
                    cgSel.innerHTML = '<option value="">No caregivers found</option>';
                    return;
                }
                snap.forEach(function(doc) {
                    var u = doc.data();
                    cgSel.innerHTML += '<option value="' + doc.id + '">' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</option>';
                });
            }).catch(function() {});
        }
    }
    
    // --- PAYMENTS ---
    function loadAdminPayments() {
        var tbody = document.getElementById('paymentsTableBody');
        if (!tbody) return;
        
        FirebaseServices.payments.getAll().then(function(snap) {
            var totalAll = 0;
            var totalMonth = 0;
            var count = 0;
            var now = new Date();
            var startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No payments found.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var p = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(p.createdAt);
                var amount = p.amount || 0;
                totalAll += amount;
                count++;
                
                if (p.createdAt && p.createdAt.toDate && p.createdAt.toDate() >= startOfMonth) {
                    totalMonth += amount;
                }
                
                var status = p.status || 'completed';
                
                tbody.innerHTML += '<tr>\
                    <td>' + escapeHtml(p.from || '--') + '</td>\
                    <td><strong>' + FirebaseServices.formatCurrency(amount) + '</strong></td>\
                    <td>' + escapeHtml(p.type || '--') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + (status.charAt(0).toUpperCase() + status.slice(1)) + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeletePayment(\'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
            
            setFallback('adminTotalRevenue', FirebaseServices.formatCurrency(totalAll));
            setFallback('adminMonthRevenue', FirebaseServices.formatCurrency(totalMonth));
            setFallback('adminTotalPayments', count.toString());
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading payments.</td></tr>';
        });
    }
    
    // --- ANALYTICS ---
    function loadAdminAnalytics() {
        var counts = { users: 0, communities: 0, referrals: 0, posts: 0, applications: 0, messages: 0, payments: 0, shifts: 0 };
        var completed = 0;
        var total = 8;
        
        function checkDone() {
            completed++;
            if (completed >= total) {
                setFallback('analyticsTotalUsers', counts.users.toString());
                setFallback('analyticsTotalCommunities', counts.communities.toString());
                setFallback('analyticsTotalReferrals', counts.referrals.toString());
                setFallback('analyticsTotalPosts', counts.posts.toString());
                setFallback('analyticsTotalApplications', counts.applications.toString());
                setFallback('analyticsTotalMessages', counts.messages.toString());
                setFallback('analyticsTotalPayments', counts.payments.toString());
                setFallback('analyticsTotalShifts', counts.shifts.toString());
            }
        }
        
        FirebaseServices.users.count().then(function(snap) { counts.users = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.facilities.count().then(function(snap) { counts.communities = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.referrals.count().then(function(snap) { counts.referrals = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.blogPosts.count().then(function(snap) { counts.posts = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.applications.count().then(function(snap) { counts.applications = snap; checkDone(); }).catch(checkDone);
        FirebaseServices.contactMessages.getAll().then(function(snap) { counts.messages = snap.size; checkDone(); }).catch(checkDone);
        FirebaseServices.payments.getAll().then(function(snap) { counts.payments = snap.size; checkDone(); }).catch(checkDone);
        FirebaseServices.shifts.count().then(function(snap) { counts.shifts = snap; checkDone(); }).catch(checkDone);
        
        buildRealChart('analyticsUserChart', 'users');
        buildRealChart('analyticsReferralChart', 'referrals');
        buildRealChart('analyticsApplicationChart', 'applications');
        buildRealChart('analyticsMessageChart', 'messages');
    }
    
    function buildRealChart(containerId, collection) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#6B7280;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        db.collection(collection).get().then(function(snap) {
            var monthCounts = {};
            var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
            var now = new Date();
            
            for (var i = 5; i >= 0; i--) {
                var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                var key = d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2);
                monthCounts[key] = { label: monthNames[d.getMonth()], count: 0 };
            }
            
            snap.forEach(function(doc) {
                var data = doc.data();
                var ts = data.createdAt || data.timestamp || data.subscribedAt;
                if (!ts) return;
                var date;
                if (ts.toDate) {
                    date = ts.toDate();
                } else if (typeof ts === 'string') {
                    date = new Date(ts);
                } else if (ts.seconds) {
                    date = new Date(ts.seconds * 1000);
                } else {
                    return;
                }
                var key = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2);
                if (monthCounts[key] !== undefined) {
                    monthCounts[key].count++;
                }
            });
            
            var entries = Object.values(monthCounts);
            var maxVal = Math.max.apply(null, entries.map(function(e) { return e.count; }));
            if (maxVal === 0) maxVal = 1;
            
            var colors = {
                users: { base: 'rgba(8,27,58,', max: 0.9 },
                referrals: { base: 'rgba(212,163,58,', max: 0.9 },
                applications: { base: 'rgba(16,185,129,', max: 0.9 },
                messages: { base: 'rgba(99,102,241,', max: 0.9 }
            };
            var c = colors[collection] || colors.users;
            
            container.innerHTML = '';
            entries.forEach(function(entry, i) {
                var heightPct = Math.max((entry.count / maxVal) * 100, 4);
                var shade = 0.15 + (i * 0.15);
                if (shade > c.max) shade = c.max;
                container.innerHTML += '<div style="flex:1; display:flex; flex-direction:column; align-items:center;">' +
                    '<div style="width:100%; background:' + c.base + shade + '); border-radius: 8px 8px 0 0; height:' + heightPct + '%; min-height:4px; position:relative;">' +
                    '<span style="position:absolute; top:-20px; left:50%; transform:translateX(-50%); font-size:11px; font-weight:700; color:#081B3A;">' + entry.count + '</span></div>' +
                    '<span style="font-size:11px; color:#6B7280; margin-top:6px;">' + entry.label + '</span></div>';
            });
        }).catch(function(err) {
            console.error('Chart error for ' + collection + ':', err);
            container.innerHTML = '<div style="text-align:center; padding:20px; color:#DC2626;">Error loading chart data.</div>';
        });
    }
    
    function loadAdminReports() {
        buildReport('reportUserBreakdown', 'users');
        buildReport('reportReferralBreakdown', 'referrals');
        buildReport('reportApplicationBreakdown', 'applications');
        buildReport('reportPaymentBreakdown', 'payments');
        buildReport('reportMessageBreakdown', 'contactMessages');
        buildReport('reportCommunityBreakdown', 'facilities');
    }
    
    function buildReport(containerId, collection) {
        var container = document.getElementById(containerId);
        if (!container) return;
        container.innerHTML = '<div style="text-align:center; padding:20px; color:#6B7280;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
        
        db.collection(collection).get().then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<p style="color:#6B7280; text-align:center;">No data available.</p>';
                return;
            }
            
            var total = snap.size;
            var breakdown = {};
            var statusBreakdown = {};
            var recentCount = 0;
            var thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            
            snap.forEach(function(doc) {
                var d = doc.data();
                
                if (d.role) {
                    breakdown[d.role] = (breakdown[d.role] || 0) + 1;
                } else if (d.status) {
                    statusBreakdown[d.status] = (statusBreakdown[d.status] || 0) + 1;
                } else if (d.type) {
                    breakdown[d.type] = (breakdown[d.type] || 0) + 1;
                }
                
                var ts = d.createdAt || d.timestamp || d.subscribedAt;
                if (ts) {
                    var date;
                    if (ts.toDate) date = ts.toDate();
                    else if (ts.seconds) date = new Date(ts.seconds * 1000);
                    else if (typeof ts === 'string') date = new Date(ts);
                    if (date && date >= thirtyDaysAgo) recentCount++;
                }
            });
            
            var html = '<div class="report-stats">';
            html += '<div class="report-stat"><span class="report-stat-num">' + total + '</span><span class="report-stat-label">Total</span></div>';
            html += '<div class="report-stat"><span class="report-stat-num">' + recentCount + '</span><span class="report-stat-label">Last 30 Days</span></div>';
            html += '</div>';
            
            var hasBreakdown = Object.keys(breakdown).length > 0;
            var hasStatus = Object.keys(statusBreakdown).length > 0;
            
            if (hasBreakdown) {
                html += '<div class="report-breakdown"><h5>Breakdown</h5>';
                Object.keys(breakdown).sort().forEach(function(key) {
                    var pct = total > 0 ? Math.round((breakdown[key] / total) * 100) : 0;
                    html += '<div class="report-bar-row"><span class="report-bar-label">' + capitalize(key) + '</span><div class="report-bar-track"><div class="report-bar-fill" style="width:' + pct + '%;"></div></div><span class="report-bar-pct">' + pct + '%</span></div>';
                });
                html += '</div>';
            }
            
            if (hasStatus) {
                html += '<div class="report-breakdown"><h5>Status</h5>';
                Object.keys(statusBreakdown).sort().forEach(function(key) {
                    var pct = total > 0 ? Math.round((statusBreakdown[key] / total) * 100) : 0;
                    html += '<div class="report-bar-row"><span class="report-bar-label">' + capitalize(key) + '</span><div class="report-bar-track"><div class="report-bar-fill status-' + key + '" style="width:' + pct + '%;"></div></div><span class="report-bar-pct">' + pct + '%</span></div>';
                });
                html += '</div>';
            }
            
            container.innerHTML = html;
        }).catch(function(err) {
            console.error('Report error for ' + collection + ':', err);
            container.innerHTML = '<p style="color:#DC2626;">Error loading report.</p>';
        });
    }
    
    function capitalize(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    // --- MEDIA LIBRARY ---
    function loadAdminMedia() {
        var grid = document.getElementById('mediaGrid');
        if (!grid) return;
        
        FirebaseServices.heroImages.getAll().then(function(snap) {
            if (snap.empty) {
                grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 60px; color: #6B7280;"><i class="fas fa-photo-film" style="font-size: 48px; color: #D4A33A; margin-bottom: 16px; display: block;"></i><h4 style="color: #081B3A;">No Media Uploaded</h4><p>Upload hero images and community photos via the Upload button above.</p></div>';
                return;
            }
            grid.innerHTML = '';
            snap.forEach(function(doc) {
                var img = doc.data();
                grid.innerHTML += '<div class="admin-media-card">\
                    <img src="' + (img.url || '') + '" alt="' + escapeHtml(img.caption || 'Image') + '" onerror="this.src=\'https://via.placeholder.com/400x300?text=Image\'">\
                    <div class="admin-media-actions">\
                        <button onclick="adminDeleteMedia(\'' + doc.id + '\')" title="Delete"><i class="fas fa-trash"></i></button>\
                    </div>\
                    <div class="admin-media-info"><p>' + escapeHtml(img.caption || 'Untitled') + '</p></div>\
                </div>';
            });
        }).catch(function(err) {
            grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #DC2626;">Error loading media.</div>';
        });
        
        var uploadBtn = document.getElementById('uploadMediaBtn');
        if (uploadBtn) {
            uploadBtn.onclick = function() {
                openCloudinaryWidget('hero');
            };
        }
    }
    
    // --- WEBSITE CONTENT CMS ---
    var WEBSITE_CONTENT_DEFAULTS = {
        hero: {
            headline: 'Helping Families Find the Right Care.',
            subHeadline: 'Helping Providers Thrive.',
            description: 'Compassionate senior placement, private caregiver coordination, and healthcare consulting \u2014 all in one place.',
            btn1Text: 'Find Care', btn1Link: 'services.html',
            btn2Text: 'Request a Caregiver', btn2Link: 'caregiver-services.html',
            btn3Text: 'Become a Provider', btn3Link: 'providers.html'
        },
        stats: {
            items: [
                { number: 500, suffix: '+', label: 'Families Assisted' },
                { number: 250, suffix: '+', label: 'Caregivers in Network' },
                { number: 100, suffix: '+', label: 'Provider Network' },
                { number: 98, suffix: '%', label: 'Family Satisfaction' }
            ]
        },
        welcome: {
            heading: 'Welcome to', goldText: 'Mercy Senior Solutions',
            text: 'For years, families have trusted Mercy Senior Solutions to guide them through one of life\u2019s most important decisions: finding the right care for someone they love. We combine local expertise with genuine compassion to match families, caregivers, and providers with the support they need.',
            text2: 'Whether you\u2019re searching for a senior living community, need a trusted in-home caregiver, or are a provider looking to grow, our team walks beside you every step of the way \u2014 at no cost to families.',
            image: 'https://images.unsplash.com/photo-1591741535018-d042766c62eb?w=700&h=500&fit=crop'
        },
        whyChooseUs: {
            heading: 'Why Families Choose Mercy',
            reasons: ['Free placement services','Local senior advisors','Carefully screened providers','Fast placement','No hidden fees','One-on-one guidance']
        },
        services: {
            heading: 'Our Services',
            subtitle: 'Comprehensive care solutions designed to support families, empower providers, and connect caregivers with meaningful opportunities.',
            cards: [
                { title: 'Senior Placement', description: 'We help families find the perfect living arrangement for their loved ones, tailored to their unique needs and preferences.', icon: 'fas fa-home', color: 'blue', link: 'senior-placement.html', items: ['Assisted Living','Memory Care','Adult Family Homes','Residential Care Homes','Independent Living','Skilled Nursing','Respite Care'] },
                { title: 'Private Caregiver Services', description: 'Professional in-home care services that provide comfort, dignity, and independence for your loved ones.', icon: 'fas fa-hands-holding-heart', color: 'gold', link: 'caregiver-services.html', items: ['Companion Care','Personal Care','Live-In Care','Overnight Care','Dementia Care','Hospital Sitters','Post-Surgical Care','Respite Care'] },
                { title: 'Healthcare Consulting', description: 'Strategic consulting services to help healthcare providers grow, optimize, and deliver exceptional care.', icon: 'fas fa-chart-line', color: 'green', link: 'healthcare-consulting.html', items: ['Occupancy Growth','Licensing Support','Startup Consulting','Marketing Strategy','Policy Development','Referral Partnerships','Provider Partnerships'] }
            ]
        },
        howItWorks: {
            heading: 'How It Works', subtitle: 'A simple, guided process to ensure your family finds the perfect care solution.',
            steps: [
                { title: 'Free Consultation', description: 'Share your needs with our senior advisors at no cost.', icon: 'fas fa-comments' },
                { title: 'Care Assessment', description: 'We evaluate medical, emotional, and lifestyle requirements.', icon: 'fas fa-clipboard-check' },
                { title: 'Personalized Recommendations', description: 'Receive a curated list of matching communities and providers.', icon: 'fas fa-list-check' },
                { title: 'Tour Communities or Arrange Care', description: 'Visit top options with guided tours arranged by our team.', icon: 'fas fa-building' },
                { title: 'Move With Confidence', description: 'We support you through the transition and beyond.', icon: 'fas fa-heart' }
            ]
        },
        families: {
            heading: 'Find Senior Care', goldText: 'Near You',
            description: 'Search our network of verified communities and caregivers to find the perfect match for your loved one.',
            badges: ['Background Verified','Licensed Communities','Family Rated'], image: ''
        },
        caregivers: {
            heading: 'Need Care at Home?', goldText: 'You Can Trust.',
            description: 'Our verified caregivers provide compassionate, professional in-home care. Every caregiver undergoes thorough background checks and credential verification.',
            checklist: ['Companionship & Social Engagement','Bathing & Personal Hygiene','Meal Preparation & Nutrition','Medication Reminders','Transportation & Errands','Light Housekeeping','Hospital Discharge Support'],
            image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=700&h=500&fit=crop'
        },
        careers: {
            heading: 'Join Our Team of', goldText: 'Compassionate Caregivers',
            description: 'Make a difference in the lives of seniors. We offer competitive pay, flexible schedules, training, and a supportive work environment.',
            image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=700&h=500&fit=crop'
        },
        providers: {
            title: 'Provider Partnership',
            description: 'Join our network of trusted communities and receive qualified referrals.',
            image: 'https://images.unsplash.com/photo-1582719471384-894fbb16e074?w=700&h=500&fit=crop'
        },
        resources: {
            heading: 'Resources & Guides', subtitle: 'Educational resources to help you make informed decisions about senior care.',
            cards: [
                { title: 'Hospital Discharge Planning', description: 'Essential steps to ensure a smooth transition from hospital to home or care facility.', badge: 'Planning', badgeClass: 'badge-blue', image: 'https://images.unsplash.com/photo-1516733725897-1aa73b87c8e8?w=400&h=250&fit=crop' },
                { title: 'Memory Care Guide', description: 'Understanding memory care options and choosing the right community for dementia care.', badge: 'Guide', badgeClass: 'badge-gold', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=250&fit=crop' },
                { title: 'Questions Before Touring', description: 'The top 20 questions every family should ask when touring a senior living community.', badge: 'Checklist', badgeClass: 'badge-green', image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=250&fit=crop' }
            ]
        },
        testimonials: {
            heading: 'What Families Are Saying', subtitle: 'Real stories from families we\u2019ve helped find the right care.',
            reviewFormHeading: 'Leave a Review', reviewFormSubtitle: 'Share your experience with Mercy Senior Solutions.'
        },
        contact: {
            heading: 'Get in Touch', subtitle: 'Ready to find the right care? Contact us for a free, no-obligation consultation.',
            phone: '(341) 618-9792', email: 'info@mercyseniorsolutions.com',
            hoursWeekday: 'Mon - Fri: 8:00 AM - 6:00 PM', hoursSaturday: 'Sat: 9:00 AM - 3:00 PM', hoursSunday: 'Sun: Closed',
            mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d86258.61359165764!2d-122.2015!3d47.6062!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x5490ab0d5e88f983%3A0x71e4897c420db!2sSeattle%2C%20WA!5e0!3m2!1sen!2sus!4v1690000000000!5m2!1sen!2sus'
        },
        footer: {
            description: 'Providing compassionate senior care solutions for families, healthcare providers, and private caregivers since 2020.',
            copyright: '\u00a9 2026 Mercy Senior Solutions. All rights reserved.',
            quickLinks: ['Home','About Us','Services','Careers','Contact'],
            serviceLinks: ['Senior Placement','Caregiver Services','Healthcare Consulting','Resources'],
            socialFacebook: '#', socialInstagram: '#', socialLinkedIn: '#', socialTwitter: '#'
        },
        about: {
            heading: 'About Mercy Senior Solutions',
            subheading: 'Compassionate care, personalized solutions, and a commitment to improving the lives of seniors and their families.',
            mission: 'Our mission is to bridge the gap between families seeking quality senior care and the providers who deliver it.',
            story: 'Founded in 2020, Mercy Senior Solutions started with a simple idea: make finding senior care easier.',
            values: ['Compassion','Integrity','Excellence','Community'], image: ''
        },
        chat: { welcomeMessage: 'Welcome to Mercy Senior Solutions. I\'m your Senior Officer assistant. Ask me anything about our services, or share your city/state and I can help point you to the nearest facility.', headerTitle: 'Talk to a Senior Officer' }
    };
    
    var CMS_SECTIONS = [
        { key: 'hero', label: 'Hero Section', icon: 'fas fa-image' },
        { key: 'stats', label: 'Statistics Bar', icon: 'fas fa-chart-simple' },
        { key: 'welcome', label: 'Welcome Section', icon: 'fas fa-house-chimney-heart' },
        { key: 'whyChooseUs', label: 'Why Choose Us', icon: 'fas fa-thumbs-up' },
        { key: 'services', label: 'Services', icon: 'fas fa-concierge-bell' },
        { key: 'howItWorks', label: 'How It Works', icon: 'fas fa-list-ol' },
        { key: 'families', label: 'For Families', icon: 'fas fa-users' },
        { key: 'caregivers', label: 'For Caregivers', icon: 'fas fa-hands-holding-heart' },
        { key: 'careers', label: 'Careers', icon: 'fas fa-briefcase' },
        { key: 'providers', label: 'For Providers', icon: 'fas fa-hospital' },
        { key: 'resources', label: 'Resources & Guides', icon: 'fas fa-book' },
        { key: 'contact', label: 'Contact Info', icon: 'fas fa-phone' },
        { key: 'footer', label: 'Footer', icon: 'fas fa-shoe-prints' },
        { key: 'about', label: 'About Page', icon: 'fas fa-info-circle' },
        { key: 'chat', label: 'Live Chat', icon: 'fas fa-comments' }
    ];
    
    var cmsData = {};
    
    function seedWebsiteContent() {
        return db.collection('settings').doc('websiteContent').get().then(function(doc) {
            if (doc.exists) { cmsData = doc.data(); return false; }
            return db.collection('settings').doc('websiteContent').set(WEBSITE_CONTENT_DEFAULTS).then(function() {
                cmsData = JSON.parse(JSON.stringify(WEBSITE_CONTENT_DEFAULTS));
                return true;
            });
        });
    }
    
    function loadAdminContent() {
        var container = document.getElementById('cmsSections');
        if (!container) return;
        seedWebsiteContent().then(function(seeded) {
            if (seeded) showNotification('Content seeded to Firestore from current website.', 'success');
            renderCmsEditor(container);
        }).catch(function(err) { container.innerHTML = '<p style="color:#DC2626;">Error loading CMS: ' + err.message + '</p>'; });
        
        var seedBtn = document.getElementById('seedContentBtn');
        if (seedBtn) {
            seedBtn.onclick = function() {
                db.collection('settings').doc('websiteContent').set(WEBSITE_CONTENT_DEFAULTS).then(function() {
                    cmsData = JSON.parse(JSON.stringify(WEBSITE_CONTENT_DEFAULTS));
                    renderCmsEditor(container);
                    showNotification('All content reset to defaults and seeded to Firestore.', 'success');
                }).catch(function() { showNotification('Error seeding content.', 'error'); });
            };
        }
    }
    
    function renderCmsEditor(container) {
        var html = '';
        CMS_SECTIONS.forEach(function(section) {
            html += '<div class="admin-content-card" id="cms-' + section.key + '">';
            html += '<h4><i class="' + section.icon + '" style="margin-right:8px; color:#D4A33A;"></i>' + section.label + '</h4>';
            html += '<div class="cms-fields" data-section="' + section.key + '">' + renderCmsFields(section.key, cmsData[section.key] || {}) + '</div>';
            html += '<button class="btn btn-gold cms-save-btn" data-section="' + section.key + '" style="margin-top:16px;"><i class="fas fa-save"></i> Save ' + section.label + '</button>';
            html += '</div>';
        });
        container.innerHTML = html;
        container.querySelectorAll('.cms-save-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { saveCmsSection(this.getAttribute('data-section')); });
        });
        container.querySelectorAll('.cms-img-upload-btn').forEach(function(btn) {
            btn.addEventListener('click', function() { openCmsImageUpload(this.getAttribute('data-target')); });
        });
        loadCmsHeroImages();
    }
    
    function renderCmsFields(key, data) {
        data = data || {}; var html = '';
        if (key === 'hero') {
            html += cmsIn('Main Headline','headline',data.headline) + cmsIn('Sub Headline','subHeadline',data.subHeadline) + cmsTx('Description','description',data.description);
            html += '<div class="admin-form-grid">' + cmsIn('Button 1 Text','btn1Text',data.btn1Text) + cmsIn('Button 1 Link','btn1Link',data.btn1Link) + cmsIn('Button 2 Text','btn2Text',data.btn2Text) + cmsIn('Button 2 Link','btn2Link',data.btn2Link) + cmsIn('Button 3 Text','btn3Text',data.btn3Text) + cmsIn('Button 3 Link','btn3Link',data.btn3Link) + '</div>';
            html += '<div class="cms-hero-images-wrap">';
            html += '<h5><i class="fas fa-images" style="color:#D4A33A; margin-right:8px;"></i>Hero Slideshow Images</h5>';
            html += '<p class="cms-hero-images-hint">These are the Unsplash / uploaded images that rotate on the homepage hero section. Add, update, or remove them below. Use "Update This Image" to change only one slide.</p>';
            html += '<div id="cmsHeroImagesManager"><div class="cms-hero-loading"><i class="fas fa-spinner fa-spin"></i> Loading hero slideshow images...</div></div>';
            html += '</div>';
        } else if (key === 'stats') {
            (data.items||[]).forEach(function(s,i) { html += '<div class="cms-repeater"><h5>Stat '+(i+1)+'</h5><div class="admin-form-grid">' + cmsIn('Number','items.'+i+'.number',s.number) + cmsIn('Suffix (+ or %)','items.'+i+'.suffix',s.suffix) + cmsIn('Label','items.'+i+'.label',s.label) + '</div></div>'; });
        } else if (key === 'welcome') {
            html += cmsIn('Heading','heading',data.heading) + cmsIn('Gold Text','goldText',data.goldText) + cmsTx('Paragraph 1','text',data.text) + cmsTx('Paragraph 2','text2',data.text2) + cmsImg('Section Image','image',data.image);
        } else if (key === 'whyChooseUs') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Reasons (one per line)','reasons',(data.reasons||[]).join('\n'));
        } else if (key === 'services') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            (data.cards||[]).forEach(function(c,i) { html += '<div class="cms-repeater"><h5>Service Card '+(i+1)+'</h5>' + cmsIn('Title','cards.'+i+'.title',c.title) + cmsTx('Description','cards.'+i+'.description',c.description) + cmsIn('Icon Class','cards.'+i+'.icon',c.icon) + cmsIn('Link','cards.'+i+'.link',c.link) + cmsTx('Items (one per line)','cards.'+i+'.items',(c.items||[]).join('\n')) + '</div>'; });
        } else if (key === 'howItWorks') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            (data.steps||[]).forEach(function(s,i) { html += '<div class="cms-repeater"><h5>Step '+(i+1)+'</h5>' + cmsIn('Title','steps.'+i+'.title',s.title) + cmsTx('Description','steps.'+i+'.description',s.description) + cmsIn('Icon Class','steps.'+i+'.icon',s.icon) + '</div>'; });
        } else if (key === 'families') {
            html += cmsIn('Heading','heading',data.heading) + cmsIn('Gold Text','goldText',data.goldText) + cmsTx('Description','description',data.description) + cmsTx('Trust Badges (one per line)','badges',(data.badges||[]).join('\n')) + cmsImg('Section Image','image',data.image);
        } else if (key === 'caregivers') {
            html += cmsIn('Heading','heading',data.heading) + cmsIn('Gold Text','goldText',data.goldText) + cmsTx('Description','description',data.description) + cmsTx('Checklist (one per line)','checklist',(data.checklist||[]).join('\n')) + cmsImg('Section Image','image',data.image);
        } else if (key === 'careers') {
            html += cmsIn('Heading','heading',data.heading) + cmsIn('Gold Text','goldText',data.goldText) + cmsTx('Description','description',data.description) + cmsImg('Section Image','image',data.image);
        } else if (key === 'providers') {
            html += cmsIn('Title','title',data.title) + cmsTx('Description','description',data.description) + cmsImg('Section Image','image',data.image);
        } else if (key === 'resources') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            (data.cards||[]).forEach(function(c,i) { html += '<div class="cms-repeater"><h5>Resource Card '+(i+1)+'</h5>' + cmsIn('Title','cards.'+i+'.title',c.title) + cmsTx('Description','cards.'+i+'.description',c.description) + cmsIn('Badge Label','cards.'+i+'.badge',c.badge) + cmsIn('Badge Class (badge-blue/gold/green)','cards.'+i+'.badgeClass',c.badgeClass) + cmsImg('Card Image','cards.'+i+'.image',c.image) + '</div>'; });
        } else if (key === 'testimonials') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            html += cmsIn('Review Form Heading','reviewFormHeading',data.reviewFormHeading) + cmsTx('Review Form Subtitle','reviewFormSubtitle',data.reviewFormSubtitle);
        } else if (key === 'contact') {
            html += cmsIn('Section Heading','heading',data.heading) + cmsTx('Section Subtitle','subtitle',data.subtitle);
            html += '<div class="admin-form-grid">' + cmsIn('Phone','phone',data.phone) + cmsIn('Email','email',data.email) + '</div>';
            html += '<div class="admin-form-grid">' + cmsIn('Weekday Hours','hoursWeekday',data.hoursWeekday) + cmsIn('Saturday Hours','hoursSaturday',data.hoursSaturday) + cmsIn('Sunday Hours','hoursSunday',data.hoursSunday) + '</div>';
            html += cmsTx('Google Maps Embed URL','mapEmbed',data.mapEmbed);
        } else if (key === 'footer') {
            html += cmsTx('Footer Description','description',data.description) + cmsIn('Copyright Text','copyright',data.copyright);
            html += '<div class="admin-form-grid">' + cmsIn('Facebook URL','socialFacebook',data.socialFacebook) + cmsIn('Instagram URL','socialInstagram',data.socialInstagram) + cmsIn('LinkedIn URL','socialLinkedIn',data.socialLinkedIn) + cmsIn('Twitter URL','socialTwitter',data.socialTwitter) + '</div>';
        } else if (key === 'about') {
            html += cmsIn('Page Heading','heading',data.heading) + cmsIn('Subheading','subheading',data.subheading) + cmsTx('Mission Statement','mission',data.mission) + cmsTx('Our Story','story',data.story) + cmsTx('Core Values (one per line)','values',(data.values||[]).join('\n')) + cmsImg('About Image','image',data.image);
        } else if (key === 'chat') {
            html += cmsIn('Chat Header Title','headerTitle',data.headerTitle) + cmsTx('Welcome Message','welcomeMessage',data.welcomeMessage);
        }
        return html;
    }
    
    function cmsIn(label,field,value) { return '<div class="form-group"><label>'+label+'</label><input type="text" class="cms-field" data-field="'+field+'" value="'+escapeHtml(value||'')+'"></div>'; }
    function cmsTx(label,field,value) { return '<div class="form-group"><label>'+label+'</label><textarea class="cms-field" data-field="'+field+'" rows="3">'+escapeHtml(value||'')+'</textarea></div>'; }
    function cmsImg(label,field,value) { var preview = value ? '<img src="'+value+'" style="max-width:200px; border-radius:8px; margin-top:8px;">' : '<span style="color:#9CA3AF;">No image</span>'; return '<div class="form-group"><label>'+label+'</label>'+preview+'<div style="display:flex; gap:8px; margin-top:8px;"><input type="text" class="cms-field" data-field="'+field+'" value="'+escapeHtml(value||'')+'" placeholder="Image URL" style="flex:1;"><button class="btn btn-outline cms-img-upload-btn" data-target="'+field+'" type="button"><i class="fas fa-cloud-arrow-up"></i> Upload</button></div></div>'; }
    
    function saveCmsSection(sectionKey) {
        var sectionEl = document.getElementById('cms-'+sectionKey); if (!sectionEl) return;
        var fields = sectionEl.querySelectorAll('.cms-field'); var updateData = {};
        fields.forEach(function(el) {
            var field = el.getAttribute('data-field'); var value = el.value; var parts = field.split('.');
            if (parts.length === 1) {
                if (field==='badges'||field==='checklist'||field==='values'||field==='reasons') { updateData[field] = value.split('\n').map(function(s){return s.trim();}).filter(Boolean); }
                else { updateData[field] = value; }
            } else if (parts.length >= 3 && (parts[0]==='cards'||parts[0]==='steps'||parts[0]==='items')) {
                var idx = parseInt(parts[1]); var subField = parts[2];
                if (!updateData[parts[0]]) updateData[parts[0]] = [];
                if (!updateData[parts[0]][idx]) updateData[parts[0]][idx] = {};
                if (subField==='items') { updateData[parts[0]][idx][subField] = value.split('\n').map(function(s){return s.trim();}).filter(Boolean); }
                else if (subField==='number') { updateData[parts[0]][idx][subField] = parseInt(value) || 0; }
                else { updateData[parts[0]][idx][subField] = value; }
            }
        });
        var btn = sectionEl.querySelector('.cms-save-btn'); btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...'; btn.disabled = true;
        db.collection('settings').doc('websiteContent').update(updateData).then(function() {
            Object.assign(cmsData[sectionKey], updateData);
            btn.innerHTML = '<i class="fas fa-check"></i> Saved!'; showNotification(sectionKey+' content saved.','success');
            setTimeout(function(){ btn.innerHTML = '<i class="fas fa-save"></i> Save'; btn.disabled = false; }, 2000);
        }).catch(function(err) { showNotification('Error saving: '+err.message,'error'); btn.innerHTML = '<i class="fas fa-save"></i> Save'; btn.disabled = false; });
    }
    
    function openCmsImageUpload(fieldPath) {
        if (typeof cloudinary==='undefined') { showNotification('Upload widget not loaded.','error'); return; }
        cloudinary.openUploadWidget({ cloudName:'qqwevfkz', uploadPreset:'mercysolutions', folder:'website-content', cropping:true, maxImageSize:5000000, sources:['local','url'], styles:{palette:{window:'#FFFFFF',sourceBg:'#F5F7FA',windowBorder:'#D4A33A',activeTabBackground:'#081B3A',activeTab:'#FFFFFF',inactiveTab:'#6B7280',inactiveTabBackground:'#E5E7EB'}} }, function(error,result) {
            if (error) return;
            if (result&&result.event==='success') { var url=result.info.secure_url; var fieldEl=document.querySelector('.cms-field[data-field="'+fieldPath+'"]'); if(fieldEl) fieldEl.value=url; showNotification('Image uploaded. Click Save to apply.','success'); }
        });
    }
    
    // --- HERO SLIDESHOW IMAGE MANAGER (Website Content > Hero Section) ---
    function loadCmsHeroImages() {
        var manager = document.getElementById('cmsHeroImagesManager');
        if (!manager) return;
        if (typeof FirebaseServices === 'undefined' || !FirebaseServices.heroImages) { manager.innerHTML = '<div class="cms-hero-loading">Hero images unavailable.</div>'; return; }
        FirebaseServices.heroImages.getAll().then(function(snap) {
            var images = [];
            snap.forEach(function(doc) {
                var d = doc.data();
                d._id = doc.id;
                images.push(d);
            });
            renderCmsHeroImages(images);
        }).catch(function() {
            manager.innerHTML = '<div class="cms-hero-loading">Could not load hero images.</div>';
        });
    }
    
    function renderCmsHeroImages(images) {
        var manager = document.getElementById('cmsHeroImagesManager');
        if (!manager) return;
        var html = '<div class="cms-hero-actions">';
        html += '<button class="btn btn-gold" onclick="cmsHeroUpload()" type="button"><i class="fas fa-cloud-arrow-up"></i> Upload New Hero Image</button>';
        html += '</div>';
        if (!images.length) {
            html += '<div class="cms-hero-loading">No hero images yet. Upload one above or paste an image URL below.</div>';
            html += '<div class="cms-hero-empty-card"><input type="text" id="cmsHeroUrlNew" placeholder="https://images.unsplash.com/..." onkeydown="if(event.key===\'Enter\')cmsHeroAddByUrl()"><button class="btn btn-gold" onclick="cmsHeroAddByUrl()" type="button"><i class="fas fa-plus"></i> Add Image</button></div>';
        } else {
            images.forEach(function(img) {
                html += '<div class="cms-hero-image-card">';
                html += '<div class="cms-hero-preview"><img src="' + escapeHtml(img.url || '') + '" alt="' + escapeHtml(img.caption || 'Hero image') + '" onerror="this.src=\'https://via.placeholder.com/640x360?text=No+image\'"></div>';
                html += '<div class="cms-hero-fields">';
                html += '<div class="form-group"><label>Image URL</label><input type="text" id="cmsHeroUrl_' + img._id + '" value="' + escapeHtml(img.url || '') + '" placeholder="https://images.unsplash.com/..."></div>';
                html += '<div class="admin-form-grid">';
                html += '<div class="form-group"><label>Caption</label><input type="text" id="cmsHeroCaption_' + img._id + '" value="' + escapeHtml(img.caption || '') + '" placeholder="e.g. Caregiver supporting a senior"></div>';
                html += '<div class="form-group"><label>Position (order)</label><input type="number" id="cmsHeroOrder_' + img._id + '" value="' + (img.order || 0) + '" min="0"></div>';
                html += '</div>';
                html += '<div class="form-group"><label class="admin-check" style="display:flex; align-items:center; gap:8px; margin:0;"><input type="checkbox" id="cmsHeroActive_' + img._id + '" ' + (img.active !== false ? 'checked' : '') + '> Show in slideshow</label></div>';
                html += '<div class="cms-hero-actions">';
                html += '<button class="btn btn-gold btn-sm" onclick="cmsHeroSaveImage(\'' + img._id + '\')" type="button"><i class="fas fa-save"></i> Update This Image</button>';
                html += '<button class="btn btn-outline btn-sm" onclick="cmsHeroDeleteImage(\'' + img._id + '\')" type="button"><i class="fas fa-trash"></i> Delete</button>';
                html += '</div>';
                html += '</div>';
                html += '</div>';
            });
        }
        manager.innerHTML = html;
    }
    
    window.cmsHeroSaveImage = function(id) {
        var urlEl = document.getElementById('cmsHeroUrl_' + id);
        if (!urlEl) return;
        var url = urlEl.value.trim();
        if (!url) { showNotification('Image URL is required.', 'error'); return; }
        var data = {
            url: url,
            caption: document.getElementById('cmsHeroCaption_' + id).value.trim() || 'Hero Image',
            order: parseInt(document.getElementById('cmsHeroOrder_' + id).value) || 0,
            active: document.getElementById('cmsHeroActive_' + id).checked
        };
        FirebaseServices.heroImages.update(id, data).then(function() {
            showNotification('Hero image updated.', 'success');
            loadCmsHeroImages();
        }).catch(function(err) {
            showNotification('Error updating image: ' + err.message, 'error');
        });
    };
    
    window.cmsHeroDeleteImage = function(id) {
        if (!confirm('Remove this image from the hero slideshow?')) return;
        FirebaseServices.heroImages.remove(id).then(function() {
            showNotification('Hero image removed.', 'success');
            loadCmsHeroImages();
        }).catch(function(err) {
            showNotification('Error removing image: ' + err.message, 'error');
        });
    };
    
    window.cmsHeroUpload = function() {
        openCloudinaryWidget('hero', function() { loadCmsHeroImages(); });
    };
    
    window.cmsHeroAddByUrl = function() {
        var urlEl = document.getElementById('cmsHeroUrlNew');
        var url = urlEl ? urlEl.value.trim() : '';
        if (!url) { showNotification('Enter an image URL first.', 'error'); return; }
        FirebaseServices.heroImages.getAll().then(function(snap) {
            return FirebaseServices.heroImages.add({ url: url, caption: 'Hero Image', order: snap.size, active: true });
        }).then(function() {
            showNotification('Hero image added.', 'success');
            loadCmsHeroImages();
        }).catch(function(err) {
            showNotification('Error adding image: ' + err.message, 'error');
        });
    };
    
    // --- WEBSITE CONTENT LOADER (Guest pages) ---
    function loadWebsiteContent() {
        var page = window.location.pathname.split('/').pop() || 'index.html';
        if (page==='login.html'||page==='register.html'||page==='admin.html'||page.indexOf('portal')>-1) return;
        return db.collection('settings').doc('websiteContent').get().then(function(doc) {
            if (!doc.exists) return;
            var c = doc.data();
            if (page==='index.html') applyHomepageContent(c);
            if (page==='about.html'&&c.about) applyAboutContent(c.about);
            applyGlobalContent(c);
        }).catch(function() {});
    }
    
    function applyHomepageContent(c) {
        if (c.hero) {
            var h1=document.querySelector('.hero-content h1'); if(h1) h1.innerHTML=c.hero.headline+'<br><span class="gold">'+(c.hero.subHeadline||'')+'</span>';
            var hp=document.querySelector('.hero-content > p'); if(hp) hp.textContent=c.hero.description||'';
        }
        if (c.stats) {
            var statEls=document.querySelectorAll('.stats-bar .stat-item'); (c.stats.items||[]).forEach(function(s,i){ if(statEls[i]){ var num=statEls[i].querySelector('.stat-number'); if(num){ var suf=s.suffix||'+'; num.setAttribute('data-target',s.number); num.setAttribute('data-suffix',suf); if(!num.classList.contains('animated-counter-done')) num.textContent='0'+suf; } var lbl=statEls[i].querySelector('.stat-label'); if(lbl) lbl.textContent=s.label||''; } }); }
        if (c.welcome) {
            var wh=document.querySelector('.welcome-section .split-left h2'); if(wh) wh.innerHTML=(c.welcome.heading||'')+'<br><span class="gold">'+(c.welcome.goldText||'')+'</span>';
            var wps=document.querySelectorAll('.welcome-section .split-left p'); if(wps[0]) wps[0].textContent=c.welcome.text||''; if(wps[1]) wps[1].textContent=c.welcome.text2||'';
            var wi=document.querySelector('.welcome-section .split-right img'); if(wi&&c.welcome.image) wi.src=c.welcome.image;
        }
        if (c.whyChooseUs) {
            var wch=document.querySelector('.why-choose-section .section-header h2'); if(wch) wch.textContent=c.whyChooseUs.heading||'';
            var whyItems=document.querySelectorAll('.why-choose-grid .why-choose-item span'); (c.whyChooseUs.reasons||[]).forEach(function(r,i){ if(whyItems[i]) whyItems[i].textContent=r; });
        }
        if (c.services) {
            var sh=document.querySelector('.services .section-header h2'); if(sh) sh.textContent=c.services.heading||'';
            var sp=document.querySelector('.services .section-header p'); if(sp) sp.textContent=c.services.subtitle||'';
            var cards=document.querySelectorAll('.services .service-card'); (c.services.cards||[]).forEach(function(crd,i){ if(cards[i]){var h3=cards[i].querySelector('h3');if(h3)h3.textContent=crd.title||'';var p=cards[i].querySelector('p');if(p)p.textContent=crd.description||'';} });
        }
        if (c.howItWorks) {
            var hh=document.querySelector('.how-it-works .section-header h2'); if(hh) hh.textContent=c.howItWorks.heading||'';
            var steps=document.querySelectorAll('.how-it-works .step'); (c.howItWorks.steps||[]).forEach(function(s,i){ if(steps[i]){var h4=steps[i].querySelector('h4');if(h4)h4.textContent=s.title||'';var p=steps[i].querySelector('p');if(p)p.textContent=s.description||'';} });
        }
        if (c.resources) {
            var rh=document.querySelector('.resources .section-header h2'); if(rh) rh.textContent=c.resources.heading||'';
            var rp=document.querySelector('.resources .section-header p'); if(rp) rp.textContent=c.resources.subtitle||'';
            var rc=document.querySelectorAll('.resources .resource-card'); (c.resources.cards||[]).forEach(function(crd,i){ if(rc[i]){var h3=rc[i].querySelector('h3');if(h3)h3.textContent=crd.title||'';var p=rc[i].querySelector('p');if(p)p.textContent=crd.description||'';var img=rc[i].querySelector('img');if(img&&crd.image)img.src=crd.image;var badge=rc[i].querySelector('.badge');if(badge){badge.textContent=crd.badge||'';badge.className='badge '+(crd.badgeClass||'');}} });
        }
        if (c.testimonials) {
            var th=document.querySelector('.testimonials-section .section-header h2'); if(th) th.textContent=c.testimonials.heading||'';
            var tp=document.querySelector('.testimonials-section .section-header p'); if(tp) tp.textContent=c.testimonials.subtitle||'';
            var rfh=document.querySelector('.review-form-section .section-header h2'); if(rfh) rfh.textContent=c.testimonials.reviewFormHeading||'';
            var rfp=document.querySelector('.review-form-section .section-header p'); if(rfp) rfp.textContent=c.testimonials.reviewFormSubtitle||'';
        }
        if (c.contact) { var ch=document.querySelector('.contact .section-header h2'); if(ch) ch.textContent=c.contact.heading||''; }
        if (c.caregivers&&c.caregivers.image) { var cgi=document.querySelector('.caregivers-section .split-left img'); if(cgi)cgi.src=c.caregivers.image; }
        if (c.careers&&c.careers.image) { var cri=document.querySelector('.careers-section .split-left img'); if(cri)cri.src=c.careers.image; }
        if (c.providers&&c.providers.image) { var pri=document.querySelector('.providers-section .split-right img'); if(pri)pri.src=c.providers.image; }
    }
    function applyAboutContent(a) { var h1=document.querySelector('.page-hero h1');if(h1&&a.heading)h1.textContent=a.heading;var sp=document.querySelector('.page-hero p');if(sp&&a.subheading)sp.textContent=a.subheading; }
    function applyGlobalContent(c) {
        if (c.chat) { var cw=document.querySelector('.chat-message.received p');if(cw)cw.textContent=c.chat.welcomeMessage||'';var ct=document.querySelector('.chat-header h4');if(ct)ct.textContent=c.chat.headerTitle||''; }
        if (c.footer) { var fp=document.querySelector('.footer-col p');if(fp&&c.footer.description)fp.textContent=c.footer.description;var cp=document.querySelector('.footer-bottom p');if(cp&&c.footer.copyright)cp.textContent=c.footer.copyright; }
    }
    
    // --- EMAIL TEMPLATES ---
    function loadAdminEmailTemplates() {
        var list = document.getElementById('emailTemplatesList');
        var typeSelect = document.getElementById('emailTestType');
        var fromNameEl = document.getElementById('emailTplFromName');
        var adminEmailEl = document.getElementById('emailTplAdminEmail');

        if (!list || typeof EmailNotifications === 'undefined') return;

        var types = EmailNotifications.getTypes();
        if (typeSelect) {
            typeSelect.innerHTML = '';
            Object.keys(types).forEach(function(key) {
                typeSelect.innerHTML += '<option value="' + key + '">' + types[key] + '</option>';
            });
        }

        EmailNotifications.load().then(function(config) {
            if (fromNameEl) fromNameEl.value = config.fromName || '';
            if (adminEmailEl) adminEmailEl.value = config.adminEmail || '';

            list.innerHTML = '';
            Object.keys(types).forEach(function(key) {
                var t = config.templates[key] || {};
                list.innerHTML += '<div class="admin-content-card">' +
                    '<h4><i class="fas fa-envelope-open-text" style="margin-right:8px; color:#D4A33A;"></i>' + types[key] + '</h4>' +
                    '<div class="admin-form-grid">' +
                    '<div class="form-group"><label>Subject (sent to the person who submitted)</label><input type="text" class="et-client-subject" data-type="' + key + '" value="' + escapeHtml(t.clientSubject || '') + '"></div>' +
                    '<div class="form-group"><label>Admin Subject (sent to you)</label><input type="text" class="et-admin-subject" data-type="' + key + '" value="' + escapeHtml(t.adminSubject || '') + '"></div>' +
                    '<div class="form-group" style="grid-column: 1 / -1;"><label>Message (sent to the person who submitted)</label><textarea class="et-client-body" data-type="' + key + '" rows="6">' + escapeHtml(t.clientBody || '') + '</textarea></div>' +
                    '<div class="form-group" style="grid-column: 1 / -1;"><label>Message (sent to you)</label><textarea class="et-admin-body" data-type="' + key + '" rows="6">' + escapeHtml(t.adminBody || '') + '</textarea></div>' +
                    '</div></div>';
            });
        });
    }

    function saveEmailTemplates() {
        if (typeof EmailNotifications === 'undefined') {
            showNotification('Email service not loaded.', 'error');
            return;
        }
        var types = EmailNotifications.getTypes();
        var templates = {};
        Object.keys(types).forEach(function(key) {
            var subjectEl = document.querySelector('.et-client-subject[data-type="' + key + '"]');
            var adminSubjectEl = document.querySelector('.et-admin-subject[data-type="' + key + '"]');
            var bodyEl = document.querySelector('.et-client-body[data-type="' + key + '"]');
            var adminBodyEl = document.querySelector('.et-admin-body[data-type="' + key + '"]');
            templates[key] = {
                clientSubject: subjectEl ? subjectEl.value : '',
                clientBody: bodyEl ? bodyEl.value : '',
                adminSubject: adminSubjectEl ? adminSubjectEl.value : '',
                adminBody: adminBodyEl ? adminBodyEl.value : ''
            };
        });
        var config = {
            fromName: document.getElementById('emailTplFromName').value,
            adminEmail: document.getElementById('emailTplAdminEmail').value,
            templates: templates
        };
        var btn = document.getElementById('saveEmailTemplatesBtn');
        var orig = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        EmailNotifications.save(config).then(function() {
            showNotification('Email templates saved.', 'success');
            btn.disabled = false;
            btn.innerHTML = orig;
        }).catch(function(err) {
            showNotification('Error saving templates: ' + err.message, 'error');
            btn.disabled = false;
            btn.innerHTML = orig;
        });
    }

    var saveEmailTemplatesBtn = document.getElementById('saveEmailTemplatesBtn');
    if (saveEmailTemplatesBtn) {
        saveEmailTemplatesBtn.addEventListener('click', saveEmailTemplates);
    }

    var sendEmailTestBtn = document.getElementById('sendEmailTestBtn');
    if (sendEmailTestBtn) {
        sendEmailTestBtn.addEventListener('click', function() {
            var type = document.getElementById('emailTestType').value;
            var email = document.getElementById('emailTestRecipient').value.trim();
            if (!type || !email) {
                showNotification('Choose a template and enter a recipient email.', 'error');
                return;
            }
            var btn = this;
            var orig = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
            EmailNotifications.sendTest(type, email).then(function(ok) {
                btn.disabled = false;
                btn.innerHTML = orig;
                if (ok) showNotification('Test email sent to ' + email + '.', 'success');
                else showNotification('Could not send test email. Check that RESEND_API_KEY is set on Render.', 'error');
            });
        });
    }

    // --- SETTINGS ---
    function loadAdminSettings() {
        auth.onAuthStateChanged(function(user) {
            if (!user) return;
            var nameEl = document.getElementById('adminProfileName');
            var emailEl = document.getElementById('adminProfileEmail');
            var phoneEl = document.getElementById('adminProfilePhone');
            
            FirebaseServices.users.getById(user.uid).then(function(doc) {
                if (!doc.exists) return;
                var data = doc.data();
                if (nameEl) nameEl.value = data.name || '';
                if (emailEl) emailEl.value = data.email || user.email || '';
                if (phoneEl) phoneEl.value = data.phone || '';
            });
        });
        
        var profileForm = document.getElementById('adminProfileForm');
        if (profileForm) {
            profileForm.onsubmit = function(e) {
                e.preventDefault();
                var user = auth.currentUser;
                if (!user) return;
                FirebaseServices.users.update(user.uid, {
                    name: document.getElementById('adminProfileName').value,
                    phone: document.getElementById('adminProfilePhone').value
                }).then(function() { showNotification('Profile saved.', 'success'); })
                .catch(function() { showNotification('Error saving profile.', 'error'); });
            };
        }
        
        var saveSettings = document.getElementById('savePlatformSettings');
        if (saveSettings) {
            saveSettings.onclick = function() {
                FirebaseServices.settings.update('platform', {
                    maintenance: document.getElementById('settingMaintenance').checked,
                    chatEnabled: document.getElementById('settingChatEnabled').checked,
                    registration: document.getElementById('settingRegistration').checked
                }).then(function() { showNotification('Platform settings saved.', 'success'); })
                .catch(function() { showNotification('Error saving settings.', 'error'); });
            };
        }
    }
    
    // --- ADMINS ---
    function loadAdminAdmins() {
        var tbody = document.getElementById('adminsTableBody');
        if (!tbody) return;
        
        FirebaseServices.users.getByRole('admin').then(function(snap) {
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No admin accounts found.</td></tr>';
                return;
            }
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var u = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(u.createdAt);
                var status = u.active !== false ? 'active' : 'pending';
                var statusLabel = u.active !== false ? 'Active' : 'Inactive';
                
                tbody.innerHTML += '<tr>\
                    <td><strong>' + escapeHtml(u.name || u.firstName + ' ' + (u.lastName || '')) + '</strong></td>\
                    <td>' + escapeHtml(u.email || '') + '</td>\
                    <td>' + escapeHtml(u.role || 'admin') + '</td>\
                    <td>' + dateStr + '</td>\
                    <td><span class="status-badge ' + status + '">' + statusLabel + '</span></td>\
                    <td><div class="admin-action-btns">\
                        <button class="admin-action-btn edit" onclick="adminEditAdminRole(\'' + doc.id + '\', \'' + (u.role || 'admin') + '\')"><i class="fas fa-edit"></i></button>\
                        <button class="admin-action-btn edit" onclick="adminToggleUserActive(\'' + doc.id + '\', ' + (u.active !== false) + ')"><i class="fas fa-power-off"></i></button>\
                        <button class="admin-action-btn delete" title="Delete" onclick="adminDeleteUser(\'admin\', \'' + doc.id + '\')"><i class="fas fa-trash"></i></button>\
                    </div></td>\
                </tr>';
            });
        }).catch(function(err) {
            tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading admins.</td></tr>';
        });
        
        var addBtn = document.getElementById('addAdminBtn');
        if (addBtn) {
            addBtn.onclick = function() {
                document.getElementById('adminModal').classList.add('active');
            };
        }
        
        var adminForm = document.getElementById('adminForm');
        if (adminForm) {
            adminForm.onsubmit = function(e) {
                e.preventDefault();
                var uid = document.getElementById('adminFormUid').value.trim();
                var role = this.querySelector('select[name="role"]').value;
                if (!uid) return;
                
                FirebaseServices.users.updateRole(uid, role).then(function() {
                    document.getElementById('adminModal').classList.remove('active');
                    showNotification('Admin role updated.', 'success');
                    loadAdminAdmins();
                }).catch(function(err) {
                    showNotification('Error: ' + err.message, 'error');
                });
            };
        }
        
        initModalClose('adminModal');
    }
    
    // ==========================================
    // ADMIN HELPER FUNCTIONS
    // ==========================================
    
    function initModalClose(modalId) {
        var modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.querySelectorAll('.admin-modal-close, .admin-modal-close-btn').forEach(function(btn) {
            btn.onclick = function() { modal.classList.remove('active'); };
        });
        
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.remove('active');
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                modal.classList.remove('active');
            }
        });
    }
    
    window.adminViewUser = function(uid) {
        FirebaseServices.users.getById(uid).then(function(doc) {
            if (!doc.exists) { showNotification('User not found.', 'error'); return; }
            var u = doc.data();
            alert('User Profile:\n\nName: ' + (u.name || u.firstName + ' ' + (u.lastName || '')) + '\nEmail: ' + u.email + '\nPhone: ' + (u.phone || '--') + '\nRole: ' + u.role + '\nJoined: ' + FirebaseServices.formatTimestamp(u.createdAt));
        });
    };
    
    window.adminToggleUserActive = function(uid, currentlyActive) {
        var action = currentlyActive ? 'deactivate' : 'activate';
        if (!confirm('Are you sure you want to ' + action + ' this user?')) return;
        
        var fn = currentlyActive ? FirebaseServices.users.deactivate : FirebaseServices.users.activate;
        fn(uid).then(function() {
            showNotification('User ' + action + 'd successfully.', 'success');
            adminTabsLoaded = {};
            loadAdminTab(document.querySelector('.sidebar-nav a.active').getAttribute('data-tab'));
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminUpdateReferralStatus = function(id, currentStatus) {
        var statuses = ['new', 'assigned', 'contacted', 'tour_scheduled', 'admitted'];
        var idx = statuses.indexOf(currentStatus);
        var next = prompt('Update status.\n\nCurrent: ' + currentStatus + '\nOptions: new, assigned, contacted, tour_scheduled, admitted', currentStatus);
        if (!next || next === currentStatus) return;
        
        FirebaseServices.referrals.updateStatus(id, next).then(function() {
            showNotification('Referral status updated to ' + next + '.', 'success');
            loadAdminReferrals();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };

    // ==========================================
    // REQUEST DETAIL / ALLOCATE-TO-PROVIDER MODAL
    // Guest submits a request -> lands here as a referral ("new") -> admin
    // opens the full-screen detail modal and allocates it to a provider.
    // ==========================================

    function populateReferralProviderSelect(selectedId) {
        var sel = document.getElementById('refDetailProviderSelect');
        if (!sel) return;
        sel.innerHTML = '<option value="">-- Choose a provider --</option>';
        FirebaseServices.users.getByRole('provider').then(function(snap) {
            snap.forEach(function(doc) {
                var u = doc.data();
                var name = escapeHtml(u.name || ((u.firstName || '') + ' ' + (u.lastName || '')).trim() || u.email || 'Provider');
                var facility = u.facilityName ? ' (' + escapeHtml(u.facilityName) + ')' : '';
                sel.innerHTML += '<option value="' + doc.id + '" data-name="' + name + '"' + (doc.id === selectedId ? ' selected' : '') + '>' + name + facility + '</option>';
            });
        }).catch(function() {});
    }

    function renderReferralTimeline(status) {
        var steps = [
            { key: 'new', label: 'Request Submitted' },
            { key: 'assigned', label: 'Allocated to Provider' },
            { key: 'contacted', label: 'Family Contacted' },
            { key: 'tour_scheduled', label: 'Tour Scheduled' },
            { key: 'admitted', label: 'Admitted' }
        ];
        var order = ['new', 'assigned', 'contacted', 'tour_scheduled', 'admitted'];
        var currentIdx = order.indexOf(status);
        var el = document.getElementById('refDetailTimelineSteps');
        if (!el) return;
        el.innerHTML = '';
        steps.forEach(function(step, i) {
            var cls = i < currentIdx ? 'done' : (i === currentIdx ? 'current' : '');
            var icon = i < currentIdx ? '<i class="fas fa-check"></i>' : (i + 1);
            el.innerHTML += '<div class="request-timeline-step ' + cls + '">' +
                '<div class="request-timeline-dot">' + icon + '</div>' +
                '<div class="request-timeline-label">' + step.label + '</div>' +
                '</div>';
        });
    }

    window.adminViewReferral = function(id) {
        var r = window._referralsCache[id];
        if (!r) return;
        var status = r.status || 'new';
        
        document.getElementById('refDetailStatusBadge').className = 'status-badge ' + status;
        document.getElementById('refDetailStatusBadge').textContent = status.replace('_', ' ').replace(/\b\w/g, function(l) { return l.toUpperCase(); });
        
        document.getElementById('refDetailFamilyName').textContent = r.familyName || r.name || '--';
        document.getElementById('refDetailContactMethod').textContent = r.contactMethod || '--';
        document.getElementById('refDetailPhone').textContent = r.phone || '--';
        document.getElementById('refDetailDate').textContent = FirebaseServices.formatTimestamp(r.createdAt);
        
        document.getElementById('refDetailPatientName').textContent = r.patientName || '--';
        document.getElementById('refDetailPatientAge').textContent = r.patientAge || '--';
        document.getElementById('refDetailRelationship').textContent = r.relationship || '--';
        document.getElementById('refDetailCareType').textContent = r.careType || '--';
        document.getElementById('refDetailBudget').textContent = r.budget ? FirebaseServices.formatCurrency(r.budget) : '--';
        document.getElementById('refDetailTimeline').textContent = r.timeline || '--';
        document.getElementById('refDetailLocation').textContent = r.location || '--';
        document.getElementById('refDetailConditions').textContent = r.conditions || '--';
        document.getElementById('refDetailNotes').textContent = r.notes || '--';
        
        var currentProviderEl = document.getElementById('refDetailCurrentProvider');
        currentProviderEl.innerHTML = r.providerId ?
            '<i class="fas fa-hospital"></i> Currently allocated to <strong>' + escapeHtml(r.providerName || 'Unknown provider') + '</strong>' :
            '<i class="fas fa-circle-info"></i> Not yet allocated';
        
        populateReferralProviderSelect(r.providerId || '');
        renderReferralTimeline(status);
        
        var modal = document.getElementById('referralDetailModal');
        modal.setAttribute('data-referral-id', id);
        modal.classList.add('active');
    };

    var refAllocateBtn = document.getElementById('refDetailAllocateBtn');
    if (refAllocateBtn) {
        refAllocateBtn.addEventListener('click', function() {
            var modal = document.getElementById('referralDetailModal');
            var id = modal.getAttribute('data-referral-id');
            var sel = document.getElementById('refDetailProviderSelect');
            var providerId = sel.value;
            var providerName = sel.selectedOptions && sel.selectedOptions[0] ? sel.selectedOptions[0].getAttribute('data-name') : '';
            
            if (!providerId) { showNotification('Please select a provider to allocate this request to.', 'error'); return; }
            
            var r = window._referralsCache[id] || {};
            var updateData = { providerId: providerId, providerName: providerName || '' };
            // A brand-new, unassigned request moves to "assigned" once allocated;
            // requests further along the pipeline keep their current status when reassigned.
            if (!r.status || r.status === 'new') updateData.status = 'assigned';
            
            refAllocateBtn.disabled = true;
            refAllocateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Allocating...';
            
            FirebaseServices.referrals.update(id, updateData).then(function() {
                showNotification('Request allocated to ' + providerName + '.', 'success');
                modal.classList.remove('active');
                loadAdminReferrals();
            }).catch(function(err) {
                showNotification('Error allocating request: ' + err.message, 'error');
            }).then(function() {
                refAllocateBtn.disabled = false;
                refAllocateBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Allocate Request';
            });
        });
    }

    initModalClose('referralDetailModal');
    
    window.adminUpdateTourStatus = function(id, currentStatus) {
        var next = prompt('Update tour status.\n\nCurrent: ' + currentStatus + '\nOptions: scheduled, completed, cancelled', currentStatus);
        if (!next || next === currentStatus) return;
        
        FirebaseServices.tours.updateStatus(id, next).then(function() {
            showNotification('Tour status updated.', 'success');
            loadAdminAppointments();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteTour = function(id) {
        if (!confirm('Delete this appointment?')) return;
        FirebaseServices.tours.remove(id).then(function() {
            showNotification('Appointment deleted.', 'success');
            loadAdminAppointments();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminEditResource = function(id) {
        FirebaseServices.blogPosts.getById(id).then(function(doc) {
            if (!doc.exists) return;
            var p = doc.data();
            document.getElementById('resourceModalTitle').textContent = 'Edit Resource';
            var form = document.getElementById('resourceForm');
            form.reset();
            form.querySelector('input[name="resourceId"]').value = id;
            form.querySelector('input[name="title"]').value = p.title || '';
            form.querySelector('select[name="category"]').value = p.category || '';
            form.querySelector('select[name="status"]').value = p.status || 'draft';
            form.querySelector('input[name="image"]').value = p.image || '';
            form.querySelector('textarea[name="excerpt"]').value = p.excerpt || '';
            form.querySelector('textarea[name="content"]').value = p.content || '';
            document.getElementById('resourceModal').classList.add('active');
        });
    };
    
    window.adminDeleteResource = function(id) {
        if (!confirm('Delete this resource?')) return;
        FirebaseServices.blogPosts.remove(id).then(function() {
            showNotification('Resource deleted.', 'success');
            loadAdminResources();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminUpdateTestimonialStatus = function(id, status) {
        if (typeof db === 'undefined') return;
        db.collection('testimonials').doc(id).update({ status: status }).then(function() {
            showNotification('Review marked as ' + status + '.', 'success');
            loadAdminTestimonials();
        }).catch(function(err) { showNotification('Error: ' + err.message, 'error'); });
    };
    
    window.adminDeleteTestimonial = function(id) {
        if (!confirm('Delete this review permanently?')) return;
        if (typeof db === 'undefined') return;
        db.collection('testimonials').doc(id).delete().then(function() {
            showNotification('Review deleted.', 'success');
            loadAdminTestimonials();
        }).catch(function(err) { showNotification('Error: ' + err.message, 'error'); });
    };
    
    window.adminUpdateApplicationStatus = function(id, status) {
        FirebaseServices.applications.updateStatus(id, status).then(function() {
            showNotification('Application ' + status + '.', 'success');
            loadAdminApplications();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };

    window.adminViewApplication = function(id) {
        FirebaseServices.applications.getById(id).then(function(doc) {
            if (!doc.exists) { showNotification('Application not found.', 'error'); return; }
            var a = doc.data();
            var status = a.status || 'pending';
            var isProvider = a.type === 'provider';

            document.getElementById('appDetailStatusBadge').className = 'status-badge ' + status;
            document.getElementById('appDetailStatusBadge').textContent = status.charAt(0).toUpperCase() + status.slice(1);
            document.getElementById('appDetailStatusInfo').innerHTML = '<i class="fas fa-circle-info"></i> Current status: <strong>' + status.charAt(0).toUpperCase() + status.slice(1) + '</strong>';
            document.getElementById('appDetailStatusSelect').value = status;

            document.getElementById('appDetailTitle').textContent = isProvider ? 'Provider Application' : 'Career Application';
            document.getElementById('appDetailTypeHeading').innerHTML = isProvider ? '<i class="fas fa-hospital"></i> Facility Info' : '<i class="fas fa-user"></i> Applicant Info';

            function field(label, value, full) {
                return '<div class="request-detail-field' + (full ? ' full-width' : '') + '"><label>' + label + '</label><span>' + escapeHtml(value == null || value === '' ? '--' : String(value)) + '</span></div>';
            }

            var html = '';
            if (isProvider) {
                html += field('Facility Name', a.facilityName);
                html += field('License Number', a.licenseNumber);
                html += field('Admissions Director', a.admissionsDirector);
                html += field('Phone', a.phone);
                html += field('Email', a.email);
                html += field('Type of Care', a.careType);
                html += field('Payment Options', (a.paymentOptions && a.paymentOptions.length ? a.paymentOptions.join(', ') : '--'));
                html += field('Availability', a.availability);
            } else {
                html += field('Full Name', a.name);
                html += field('Phone', a.phone);
                html += field('Email', a.email);
                html += field('Address', a.address);
                html += field('Experience', a.experience);
                html += field('Availability', a.availability);
                html += field('Certifications', (a.certifications && a.certifications.length ? a.certifications.join(', ') : '--'));
                html += field('References', a.references, true);
            }
            html += field('Submitted', FirebaseServices.formatTimestamp(a.createdAt), true);
            document.getElementById('appDetailFields').innerHTML = html;

            var sel = document.getElementById('appDetailStatusSelect');
            var updateBtn = document.getElementById('appDetailUpdateStatusBtn');
            updateBtn.onclick = function() {
                if (sel.value === status) { showNotification('Status is already ' + status + '.', 'success'); return; }
                if (!confirm('Change this application status to ' + sel.value + '?')) return;
                FirebaseServices.applications.updateStatus(id, sel.value).then(function() {
                    showNotification('Application status updated to ' + sel.value + '.', 'success');
                    document.getElementById('appDetailModal').classList.remove('active');
                    loadAdminApplications();
                }).catch(function(err) {
                    showNotification('Error: ' + err.message, 'error');
                });
            };

            document.getElementById('appDetailModal').classList.add('active');
        }).catch(function(err) {
            showNotification('Error loading application details.', 'error');
        });
    };

    window.adminChangeApplicationStatus = function(id, currentStatus) {
        var next = prompt('Change application status.\n\nCurrent: ' + currentStatus + '\nOptions: pending, approved, rejected', currentStatus);
        if (!next || next === currentStatus) return;
        FirebaseServices.applications.updateStatus(id, next).then(function() {
            showNotification('Application status updated to ' + next + '.', 'success');
            loadAdminApplications();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };

    window.adminDeleteApplication = function(id) {
        if (!confirm('Delete this application permanently?')) return;
        FirebaseServices.applications.remove(id).then(function() {
            showNotification('Application deleted.', 'success');
            loadAdminApplications();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteUser = function(role, uid) {
        if (!confirm('Delete this ' + role + ' account permanently? This cannot be undone.')) return;
        FirebaseServices.users.remove(uid).then(function() {
            showNotification(role.charAt(0).toUpperCase() + role.slice(1) + ' account deleted.', 'success');
            if (role === 'admin') loadAdminAdmins();
            else if (role === 'caregiver') loadAdminCaregivers();
            else loadAdminFamilies();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteFacilityRequest = function(id) {
        if (!confirm('Delete this facility request permanently?')) return;
        db.collection('facilitiesRequest').doc(id).delete().then(function() {
            showNotification('Facility request deleted.', 'success');
            loadAdminCareRequests();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteCareRequest = function(id) {
        if (!confirm('Delete this care request permanently?')) return;
        FirebaseServices.careRequests.remove(id).then(function() {
            showNotification('Care request deleted.', 'success');
            loadAdminActualCareRequests();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteContactMessage = function(id) {
        if (!confirm('Delete this contact message permanently?')) return;
        db.collection('contactMessages').doc(id).delete().then(function() {
            showNotification('Contact message deleted.', 'success');
            loadAdminContactMessages();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteReferral = function(id) {
        if (!confirm('Delete this referral permanently?')) return;
        db.collection('referrals').doc(id).delete().then(function() {
            showNotification('Referral deleted.', 'success');
            loadAdminReferrals();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeletePayment = function(id) {
        if (!confirm('Delete this payment record permanently?')) return;
        db.collection('payments').doc(id).delete().then(function() {
            showNotification('Payment record deleted.', 'success');
            loadAdminPayments();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminUpdateShiftStatus = function(id, status) {
        if (status === 'completed' && !confirm('Mark this shift as completed?')) return;
        FirebaseServices.shifts.update(id, { status: status }).then(function() {
            showNotification('Shift updated.', 'success');
            loadAdminShifts();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminDeleteShift = function(id) {
        if (!confirm('Delete this shift?')) return;
        FirebaseServices.shifts.remove(id).then(function() {
            showNotification('Shift deleted.', 'success');
            loadAdminShifts();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminEditAdminRole = function(uid, currentRole) {
        var newRole = prompt('Update admin role.\n\nCurrent: ' + currentRole + '\nOptions: admin, super-admin', currentRole);
        if (!newRole || newRole === currentRole) return;
        
        FirebaseServices.users.updateRole(uid, newRole).then(function() {
            showNotification('Admin role updated.', 'success');
            loadAdminAdmins();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    window.adminChangeUserRole = function(uid, currentRole) {
        var overlay = document.createElement('div');
        overlay.className = 'admin-modal active';
        overlay.style.display = 'flex';
        overlay.innerHTML = '<div class="admin-modal-content" style="max-width:400px;">\
            <div class="admin-modal-header"><h3>Change User Role</h3><button class="admin-modal-close close-role-modal">&times;</button></div>\
            <div class="admin-form-grid">\
                <div class="form-group"><label>Current Role</label><input type="text" value="' + escapeHtml(currentRole) + '" disabled style="background:#F3F4F6;"></div>\
                <div class="form-group"><label>New Role</label><select id="newRoleSelect">\
                    <option value="family"' + (currentRole === 'family' ? ' selected' : '') + '>Family</option>\
                    <option value="provider"' + (currentRole === 'provider' ? ' selected' : '') + '>Provider</option>\
                    <option value="caregiver"' + (currentRole === 'caregiver' ? ' selected' : '') + '>Caregiver</option>\
                    <option value="admin"' + (currentRole === 'admin' ? ' selected' : '') + '>Admin</option>\
                </select></div>\
            </div>\
            <div class="admin-modal-actions">\
                <button type="button" class="btn btn-outline close-role-modal">Cancel</button>\
                <button type="button" class="btn btn-gold" id="confirmRoleChange"><i class="fas fa-check"></i> Update Role</button>\
            </div>\
        </div>';
        document.body.appendChild(overlay);
        
        overlay.querySelectorAll('.close-role-modal').forEach(function(el) {
            el.addEventListener('click', function() { overlay.remove(); });
        });
        overlay.querySelector('#confirmRoleChange').addEventListener('click', function() {
            var newRole = document.getElementById('newRoleSelect').value;
            if (newRole === currentRole) { overlay.remove(); return; }
            if (!confirm('Change this user\'s role from \'' + currentRole + '\' to \'' + newRole + '\'? This will affect their portal access.')) return;
            
            FirebaseServices.users.updateRole(uid, newRole).then(function() {
                showNotification('Role updated from ' + currentRole + ' to ' + newRole + '.', 'success');
                overlay.remove();
                // Reload all admin tables since roles may have shifted
                if (typeof loadAdminFamilies === 'function') loadAdminFamilies();
                if (typeof loadAdminAdmins === 'function') loadAdminAdmins();
            }).catch(function(err) {
                showNotification('Error: ' + err.message, 'error');
            });
        });
    };
    
    window.adminDeleteMedia = function(id) {
        if (!confirm('Delete this media item?')) return;
        FirebaseServices.heroImages.remove(id).then(function() {
            showNotification('Media deleted.', 'success');
            loadAdminMedia();
        }).catch(function(err) {
            showNotification('Error: ' + err.message, 'error');
        });
    };
    
    // ==========================================
    // CLOUDINARY UPLOAD WIDGET
    // ==========================================
    
    function openCloudinaryWidget(type, onSuccess) {
        if (typeof CloudinaryConfig === 'undefined') {
            showNotification('Cloudinary not configured.', 'error');
            return;
        }
        
        var config = type === 'hero' ? CloudinaryConfig.hero : CloudinaryConfig.media;
        
        var widget = cloudinary.createUploadWidget({
            cloudName: CloudinaryConfig.cloudName,
            uploadPreset: CloudinaryConfig.uploadPreset,
            folder: config.folder,
            maxFiles: config.maxFiles,
            maxFileSize: config.maxFileSize,
            allowedFormats: config.allowedFormats,
            sources: ['local', 'url'],
            styles: {
                palette: {
                    window: '#FFFFFF',
                    sourceBg: '#F5F7FA',
                    windowBorder: '#D4A33A',
                    activeTabBackground: '#081B3A',
                    activeTab: '#FFFFFF',
                    inactiveTab: '#6B7280',
                    inactiveTabBackground: '#E5E7EB'
                }
            }
        }, function(error, result) {
            if (error) {
                console.error('Cloudinary error:', error);
                return;
            }
            if (result && result.event === 'success') {
                var imageData = {
                    url: result.info.secure_url,
                    caption: result.info.original_filename || 'Hero Image',
                    order: 0,
                    active: true
                };
                
                FirebaseServices.heroImages.add(imageData).then(function() {
                    showNotification('Image uploaded successfully!', 'success');
                    if (typeof onSuccess === 'function') onSuccess();
                    else loadAdminMedia();
                }).catch(function(err) {
                    showNotification('Error saving image: ' + err.message, 'error');
                });
            }
        });
        
        widget.open();
    }
    
    // ==========================================
    // FAMILY PORTAL LOADER
    // ==========================================
    function loadFamilyDashboard(userId) {
        var familyId = userId;
        
        var nameEl = document.getElementById('familyUserName');
        
        // Load referrals count
        FirebaseServices.referrals.getByFamily(familyId).then(function(snap) {
            var count = 0;
            var tourCount = 0;
            var activityItems = [];
            
            snap.forEach(function(doc) {
                var r = doc.data();
                count++;
                if (r.status === 'tour_scheduled') tourCount++;
                
                activityItems.push({
                    type: r.status,
                    description: 'Referral for <strong>' + escapeHtml(r.careType || 'Care') + '</strong> - Status: ' + r.status.replace('_', ' '),
                    icon: r.status === 'new' ? 'fas fa-link' : r.status === 'tour_scheduled' ? 'fas fa-calendar' : 'fas fa-check-circle',
                    color: r.status === 'new' ? 'blue' : r.status === 'tour_scheduled' ? 'gold' : 'green'
                });
            });
            
            var refEl = document.getElementById('familyActiveReferrals');
            if (refEl) refEl.textContent = count;
            
            var tourEl = document.getElementById('familyUpcomingTours');
            if (tourEl) tourEl.textContent = tourCount;
            
            // Load activity
            loadFamilyActivity(familyId);
        }).catch(function() { setFallback('familyActiveReferrals'); });
        
        // Load saved communities
        FirebaseServices.savedCommunities.getByFamily(familyId).then(function(snap) {
            var el = document.getElementById('familySavedCommunities');
            if (el) el.textContent = snap.size;
            
            var tbody = document.getElementById('familySavedTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No saved communities yet. Browse our services to find the right fit.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var c = doc.data();
                var statusClass = c.status === 'active' ? 'active' : c.status === 'tour_scheduled' ? 'pending' : 'review';
                var statusLabel = c.status === 'active' ? 'Active' : c.status === 'tour_scheduled' ? 'Tour Scheduled' : 'Under Review';
                
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(c.communityName) + '</strong></td>\
                        <td>' + escapeHtml(c.location) + '</td>\
                        <td>' + escapeHtml(c.careType) + '</td>\
                        <td>' + FirebaseServices.formatCurrency(c.monthlyCost) + '/mo</td>\
                        <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>\
                    </tr>\
                ';
            });
        }).catch(function() { setFallback('familySavedCommunities'); });
        
        // Messages count
        var msgEl = document.getElementById('familyUnreadMsgs');
        if (msgEl) msgEl.textContent = '0';
        
        // Load assigned caregiver (advisor)
        var cgEl = document.getElementById('familyAssignedCaregiver');
        if (cgEl) {
            db.collection('users').doc(familyId).get().then(function(doc) {
                if (doc.exists) {
                    var userData = doc.data();
                    var cgId = userData.assignedCaregiverId;
                    if (cgId) {
                        db.collection('users').doc(cgId).get().then(function(cgDoc) {
                            if (cgDoc.exists) {
                                var cg = cgDoc.data();
                                var name = cg.name || cg.firstName + ' ' + (cg.lastName || '');
                                cgEl.textContent = escapeHtml(name);
                            } else {
                                cgEl.textContent = 'Unassigned';
                            }
                        }).catch(function() { cgEl.textContent = 'Unassigned'; });
                    } else {
                        cgEl.textContent = 'Unassigned';
                    }
                } else {
                    cgEl.textContent = 'Unassigned';
                }
            }).catch(function() { cgEl.textContent = 'Unassigned'; });
        }
        
        // Load referrals list
        loadFamilyReferrals(userId);
        
        // Load settings
        loadFamilySettings(userId);
    }
    
    function loadFamilyActivity(familyId) {
        var container = document.getElementById('familyActivityList');
        if (!container) return;
        
        FirebaseServices.activity.getAll(5).then(function(snap) {
            if (snap.empty) {
                container.innerHTML = '<div class="activity-item" style="text-align:center; padding:40px; color:#6B7280;"><p>No activity yet. Your referral updates will appear here.</p></div>';
                return;
            }
            
            container.innerHTML = '';
            snap.forEach(function(doc) {
                var a = doc.data();
                var timeStr = FirebaseServices.formatTimestamp(a.timestamp);
                var iconColor = a.color || 'blue';
                
                container.innerHTML += '\
                    <div class="activity-item">\
                        <div class="activity-icon ' + iconColor + '"><i class="' + (a.icon || 'fas fa-info-circle') + '"></i></div>\
                        <div class="activity-info">\
                            <p>' + escapeHtml(a.description) + '</p>\
                            <span>' + timeStr + '</span>\
                        </div>\
                    </div>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading family activity:', err);
        });
    }
    
    function loadFamilySettings(userId) {
        db.collection('users').doc(userId).get().then(function(doc) {
            if (!doc.exists) return;
            var u = doc.data();
            
            var firstEl = document.getElementById('settingsFirstName');
            var lastEl = document.getElementById('settingsLastName');
            var emailEl = document.getElementById('settingsEmail');
            var phoneEl = document.getElementById('settingsPhone');
            
            if (firstEl) firstEl.value = u.firstName || '';
            if (lastEl) lastEl.value = u.lastName || '';
            if (emailEl) emailEl.value = u.email || '';
            if (phoneEl) phoneEl.value = u.phone || '';
        });
    }
    
    // ==========================================
    // FAMILY PORTAL FORM HANDLERS
    // ==========================================
    
    // Referral Form
    var referralForm = document.getElementById('referralForm');
    if (referralForm) {
        referralForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var errEl = document.getElementById('referralError');
            var successEl = document.getElementById('referralSuccess');
            var submitBtn = document.getElementById('referralSubmitBtn');
            
            errEl.style.display = 'none';
            successEl.style.display = 'none';
            
            var referralData = {
                familyId: auth.currentUser ? auth.currentUser.uid : '',
                familyName: auth.currentUser ? auth.currentUser.email : '',
                patientName: document.getElementById('refPatientName').value.trim(),
                patientAge: document.getElementById('refPatientAge').value,
                relationship: document.getElementById('refRelationship').value,
                phone: document.getElementById('refPhone').value.trim(),
                careType: document.getElementById('refCareType').value,
                budget: document.getElementById('refBudget').value,
                location: document.getElementById('refLocation').value.trim(),
                timeline: document.getElementById('refTimeline').value,
                conditions: document.getElementById('refConditions').value.trim(),
                notes: document.getElementById('refNotes').value.trim(),
                contactMethod: document.querySelector('input[name="refContactMethod"]:checked').value
            };
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';
            submitBtn.disabled = true;
            
            FirebaseServices.referrals.create(referralData).then(function() {
                return FirebaseServices.activity.log({
                    type: 'referral',
                    description: 'New referral submitted for ' + referralData.patientName + ' (' + referralData.careType + ')',
                    icon: 'fas fa-link',
                    color: 'blue'
                });
            }).then(function() {
                successEl.textContent = 'Referral submitted successfully! A senior care advisor will contact you within 24 hours to discuss options for ' + referralData.patientName + '.';
                successEl.style.display = 'block';
                referralForm.reset();
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Referral';
                submitBtn.disabled = false;
                
                // Refresh referrals table
                loadFamilyReferrals(auth.currentUser.uid);
            }).catch(function(err) {
                errEl.textContent = 'Error submitting referral: ' + err.message;
                errEl.style.display = 'block';
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Referral';
                submitBtn.disabled = false;
                console.error(err);
            });
        });
    }
    
    // Tour Request Form
    var tourForm = document.getElementById('tourForm');
    if (tourForm) {
        tourForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var successEl = document.getElementById('tourSuccess');
            
            var tourData = {
                familyId: auth.currentUser ? auth.currentUser.uid : '',
                community: document.getElementById('tourCommunity').value.trim(),
                date: document.getElementById('tourDate').value,
                time: document.getElementById('tourTime').value,
                notes: document.getElementById('tourNotes').value.trim()
            };
            
            FirebaseServices.activity.log({
                type: 'tour',
                description: 'Tour requested at ' + tourData.community + ' on ' + FirebaseServices.formatDate(tourData.date),
                icon: 'fas fa-calendar-check',
                color: 'green'
            }).then(function() {
                successEl.textContent = 'Tour request submitted for ' + tourData.community + ' on ' + FirebaseServices.formatDate(tourData.date) + ' at ' + tourData.time + '. We will confirm shortly.';
                successEl.style.display = 'block';
                tourForm.reset();
            }).catch(function(err) {
                successEl.textContent = 'Error: ' + err.message;
                successEl.style.display = 'block';
                successEl.style.background = '#FEF2F2';
                successEl.style.borderColor = '#FECACA';
                successEl.style.color = '#DC2626';
            });
        });
    }
    
    // Settings Form
    var settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            var successEl = document.getElementById('settingsSuccess');
            
            if (!auth.currentUser) return;
            
            db.collection('users').doc(auth.currentUser.uid).update({
                firstName: document.getElementById('settingsFirstName').value.trim(),
                lastName: document.getElementById('settingsLastName').value.trim(),
                name: document.getElementById('settingsFirstName').value.trim() + ' ' + document.getElementById('settingsLastName').value.trim(),
                phone: document.getElementById('settingsPhone').value.trim()
            }).then(function() {
                successEl.textContent = 'Profile updated successfully!';
                successEl.style.display = 'block';
                setTimeout(function() { successEl.style.display = 'none'; }, 3000);
                
                var nameEl = document.getElementById('familyUserName');
                if (nameEl) nameEl.textContent = 'Welcome, ' + document.getElementById('settingsFirstName').value.trim();
            }).catch(function(err) {
                successEl.textContent = 'Error: ' + err.message;
                successEl.style.display = 'block';
                successEl.style.background = '#FEF2F2';
                successEl.style.color = '#DC2626';
            });
        });
    }
    
    // Document Upload
    var docUploadArea = document.getElementById('docUploadArea');
    var docFileInput = document.getElementById('docFileInput');
    var docFileName = document.getElementById('docFileName');
    var docUploadBtn = document.getElementById('docUploadBtn');
    
    if (docUploadArea && docFileInput) {
        docUploadArea.addEventListener('click', function() {
            docFileInput.click();
        });
        
        docFileInput.addEventListener('change', function() {
            if (this.files[0]) {
                docFileName.textContent = this.files[0].name;
                docFileName.style.display = 'block';
                docUploadBtn.style.display = 'inline-block';
            }
        });
        
        if (docUploadBtn) {
            docUploadBtn.addEventListener('click', function() {
                if (!docFileInput.files[0] || !auth.currentUser) return;
                
                var file = docFileInput.files[0];
                var storageRef = storage.ref('documents/' + auth.currentUser.uid + '/' + Date.now() + '_' + file.name);
                
                docUploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
                docUploadBtn.disabled = true;
                
                storageRef.put(file).then(function() {
                    return storageRef.getDownloadURL();
                }).then(function(url) {
                    return db.collection('documents').add({
                        userId: auth.currentUser.uid,
                        fileName: file.name,
                        fileUrl: url,
                        fileType: document.getElementById('docType').value,
                        fileSize: file.size,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                }).then(function() {
                    docFileName.textContent = 'Upload successful!';
                    docUploadBtn.innerHTML = '<i class="fas fa-check"></i> Uploaded';
                    docUploadBtn.style.background = '#2F7D4A';
                    docFileInput.value = '';
                    setTimeout(function() {
                        docUploadBtn.style.display = 'none';
                        docFileName.style.display = 'none';
                        docUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
                        docUploadBtn.style.background = '';
                        docUploadBtn.disabled = false;
                    }, 2000);
                }).catch(function(err) {
                    docFileName.textContent = 'Upload failed: ' + err.message;
                    docFileName.style.color = '#DC2626';
                    docUploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload';
                    docUploadBtn.disabled = false;
                });
            });
        }
    }
    
    // Load referrals list for family portal
    function loadFamilyReferrals(userId) {
        var tbody = document.getElementById('familyReferralsTable');
        if (!tbody) return;
        
        FirebaseServices.referrals.getByFamily(userId).then(function(snap) {
            var el = document.getElementById('familyActiveReferrals');
            if (el) el.textContent = snap.size;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:40px; color:#6B7280;">No referrals yet. Submit your first referral to get started.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var r = doc.data();
                var dateStr = FirebaseServices.formatTimestamp(r.createdAt);
                var statusClass = 'active';
                var statusLabel = r.status.charAt(0).toUpperCase() + r.status.slice(1).replace('_', ' ');
                
                if (r.status === 'new') { statusClass = 'active'; }
                else if (r.status === 'contacted') { statusClass = 'pending'; }
                else if (r.status === 'tour_scheduled') { statusClass = 'review'; }
                else if (r.status === 'admitted') { statusClass = 'green'; }
                
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(r.careType) + '</strong></td>\
                        <td>' + escapeHtml(r.providerName || 'Pending') + '</td>\
                        <td>' + escapeHtml(r.budget) + '</td>\
                        <td>' + dateStr + '</td>\
                        <td><span class="status-badge ' + statusClass + '">' + statusLabel + '</span></td>\
                        <td>' + escapeHtml(r.notes || '--') + '</td>\
                    </tr>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading referrals:', err);
        });
    }
// ==========================================
    // CAREGIVER PORTAL LOADER
    // ==========================================
    function loadCaregiverDashboard(userId) {
        var caregiverId = userId;
        
        var nameEl = document.getElementById('caregiverUserName');
        
        // Upcoming shifts
        FirebaseServices.shifts.getUpcoming(caregiverId).then(function(snap) {
            var el = document.getElementById('cgUpcomingShifts');
            if (el) el.textContent = snap.size;
            
            var tbody = document.getElementById('cgUpcomingTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No upcoming shifts.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var s = doc.data();
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(s.clientName) + '</strong></td>\
                        <td>' + FirebaseServices.formatDate(s.date) + '</td>\
                        <td>' + escapeHtml(s.startTime) + ' - ' + escapeHtml(s.endTime) + '</td>\
                        <td>' + escapeHtml(s.type) + '</td>\
                        <td>' + escapeHtml(s.rate) + '</td>\
                    </tr>\
                ';
            });
        }).catch(function() { setFallback('cgUpcomingShifts'); });
        
        // Available shifts
        FirebaseServices.shifts.getAvailable().then(function(snap) {
            var el = document.getElementById('cgAvailableShifts');
            if (el) el.textContent = snap.size;
            
            var tbody = document.getElementById('cgAvailableTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; padding:30px; color:#6B7280;">No available shifts at this time.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var s = doc.data();
                tbody.innerHTML += '\
                    <tr>\
                        <td><strong>' + escapeHtml(s.clientName) + '</strong></td>\
                        <td>' + FirebaseServices.formatDate(s.date) + '</td>\
                        <td>' + escapeHtml(s.startTime) + ' - ' + escapeHtml(s.endTime) + '</td>\
                        <td>' + escapeHtml(s.type) + '</td>\
                        <td><button class="btn btn-gold accept-shift-btn" data-shift-id="' + doc.id + '" style="padding: 8px 16px; font-size: 13px;">Accept</button></td>\
                    </tr>\
                ';
            });
            
            // Attach accept handlers
            document.querySelectorAll('.accept-shift-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var shiftId = this.getAttribute('data-shift-id');
                    FirebaseServices.shifts.accept(shiftId, caregiverId).then(function() {
                        showNotification('Shift accepted successfully!', 'success');
                        loadCaregiverDashboard(caregiverId);
                    }).catch(function(err) {
                        showNotification('Error accepting shift.', 'error');
                        console.error(err);
                    });
                });
            });
        }).catch(function() { setFallback('cgAvailableShifts'); });
        
        // Credentials
        FirebaseServices.credentials.getByCaregiver(caregiverId).then(function(snap) {
            var tbody = document.getElementById('cgCredentialsTable');
            if (!tbody) return;
            
            if (snap.empty) {
                tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; padding:30px; color:#6B7280;">No credentials on file.</td></tr>';
                return;
            }
            
            tbody.innerHTML = '';
            snap.forEach(function(doc) {
                var c = doc.data();
                var statusClass = c.status === 'active' || c.status === 'cleared' ? 'active' : 'pending';
                
                tbody.innerHTML += '\
                    <tr>\
                        <td>' + escapeHtml(c.type) + '</td>\
                        <td><span class="status-badge ' + statusClass + '">' + (c.status.charAt(0).toUpperCase() + c.status.slice(1)) + '</span></td>\
                        <td>' + escapeHtml(c.expiry || '--') + '</td>\
                        <td><a href="' + (c.documentUrl || '#') + '" style="color: #081B3A; font-weight: 700;">View</a></td>\
                    </tr>\
                ';
            });
        }).catch(function(err) {
            console.error('Error loading credentials:', err);
        });
        
        // Hours calculation
        var hoursEl = document.getElementById('cgHoursMonth');
        if (hoursEl) hoursEl.textContent = '0';
        
        // Messages
        var msgEl = document.getElementById('cgUnreadMsgs');
        if (msgEl) msgEl.textContent = '0';
        
        // ---- Wire caregiver portal tabs ----
        wireCaregiverTabs(caregiverId);
    }
    
    function wireCaregiverTabs(caregiverId) {
        // Availability tab: load saved availability
        var availChecks = document.querySelectorAll('.avail-check');
        if (availChecks.length > 0) {
            FirebaseServices.settings.get('availability_' + caregiverId).then(function(doc) {
                if (doc.exists) {
                    var saved = doc.data().days || [];
                    availChecks.forEach(function(cb) {
                        cb.checked = saved.indexOf(cb.value) > -1;
                    });
                }
            }).catch(function() {});
            
            var saveAvailBtn = document.getElementById('saveAvailabilityBtn');
            if (saveAvailBtn) {
                saveAvailBtn.addEventListener('click', function() {
                    var days = [];
                    availChecks.forEach(function(cb) { if (cb.checked) days.push(cb.value); });
                    FirebaseServices.settings.update('availability_' + caregiverId, { days: days, caregiverId: caregiverId }).then(function() {
                        document.getElementById('availStatusMsg').textContent = 'Availability saved!';
                    }).catch(function() {
                        document.getElementById('availStatusMsg').textContent = 'Error saving availability.';
                    });
                });
            }
        }
        
        // Credentials tab: load credentials into cgCredentialsTabTable
        var credTabBody = document.getElementById('cgCredentialsTabTable');
        if (credTabBody) {
            FirebaseServices.credentials.getByCaregiver(caregiverId).then(function(snap) {
                if (snap.empty) {
                    credTabBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:#6B7280;">No credentials on file.</td></tr>';
                    return;
                }
                credTabBody.innerHTML = '';
                snap.forEach(function(doc) {
                    var c = doc.data();
                    var sc = c.status === 'active' || c.status === 'cleared' ? 'active' : 'pending';
                    credTabBody.innerHTML += '<tr><td>' + escapeHtml(c.type) + '</td><td><span class="status-badge ' + sc + '">' + (c.status.charAt(0).toUpperCase() + c.status.slice(1)) + '</span></td><td>' + escapeHtml(c.expiry || '--') + '</td><td>' + (c.documentUrl ? '<a href="' + c.documentUrl + '" target="_blank" style="color:#081B3A;font-weight:700;">View</a>' : '--') + '</td></tr>';
                });
            }).catch(function() {});
            
            // Credential upload
            var credDocUrl = '';
            var uploadBtn = document.getElementById('credentialUploadBtn');
            if (uploadBtn && typeof cloudinary !== 'undefined') {
                uploadBtn.addEventListener('click', function() {
                    cloudinary.openUploadWidget({ cloudName: 'dci6hrfxn', uploadPreset: 'senior_care_default', sources: ['local', 'url'], multiple: false, cropping: false, maxFileSize: 5000000 }, function(err, result) {
                        if (!err && result && result.info) {
                            credDocUrl = result.info.secure_url;
                            document.getElementById('credentialFileName').textContent = result.info.original_filename;
                        }
                    });
                });
            }
            var saveCredBtn = document.getElementById('saveCredentialBtn');
            if (saveCredBtn) {
                saveCredBtn.addEventListener('click', function() {
                    var type = document.getElementById('credentialType');
                    var expiry = document.getElementById('credentialExpiry');
                    if (!type || !type.value) { document.getElementById('credStatusMsg').textContent = 'Please select a credential type.'; return; }
                    db.collection('credentials').add({
                        caregiverId: caregiverId,
                        type: type.value,
                        expiry: expiry ? expiry.value : '',
                        documentUrl: credDocUrl || '',
                        status: 'pending',
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    }).then(function() {
                        document.getElementById('credStatusMsg').textContent = 'Credential submitted for review!';
                        credDocUrl = '';
                        if (document.getElementById('credentialFileName')) document.getElementById('credentialFileName').textContent = '';
                        if (expiry) expiry.value = '';
                        // Reload table
                        FirebaseServices.credentials.getByCaregiver(caregiverId).then(function(snap) {
                            if (credTabBody) {
                                if (snap.empty) { credTabBody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:#6B7280;">No credentials on file.</td></tr>'; return; }
                                credTabBody.innerHTML = '';
                                snap.forEach(function(doc) {
                                    var c = doc.data();
                                    var sc = c.status === 'active' || c.status === 'cleared' ? 'active' : 'pending';
                                    credTabBody.innerHTML += '<tr><td>' + escapeHtml(c.type) + '</td><td><span class="status-badge ' + sc + '">' + (c.status.charAt(0).toUpperCase() + c.status.slice(1)) + '</span></td><td>' + escapeHtml(c.expiry || '--') + '</td><td>' + (c.documentUrl ? '<a href="' + c.documentUrl + '" target="_blank" style="color:#081B3A;font-weight:700;">View</a>' : '--') + '</td></tr>';
                                });
                            }
                        });
                        // Also refresh dashboard table
                        FirebaseServices.credentials.getByCaregiver(caregiverId).then(function(snap) {
                            var dt = document.getElementById('cgCredentialsTable');
                            if (dt) {
                                if (snap.empty) { dt.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:30px;color:#6B7280;">No credentials on file.</td></tr>'; return; }
                                dt.innerHTML = '';
                                snap.forEach(function(doc) {
                                    var c = doc.data();
                                    var sc = c.status === 'active' || c.status === 'cleared' ? 'active' : 'pending';
                                    dt.innerHTML += '<tr><td>' + escapeHtml(c.type) + '</td><td><span class="status-badge ' + sc + '">' + (c.status.charAt(0).toUpperCase() + c.status.slice(1)) + '</span></td><td>' + escapeHtml(c.expiry || '--') + '</td><td><a href="' + (c.documentUrl || '#') + '" style="color:#081B3A;font-weight:700;">View</a></td></tr>';
                                });
                            }
                        });
                    }).catch(function() {
                        document.getElementById('credStatusMsg').textContent = 'Error saving credential.';
                    });
                });
            }
        }
        
        // Messages tab: load messages
        var msgList = document.getElementById('cgMessagesList');
        if (msgList) {
            db.collection('messages').where('toUserId', '==', caregiverId).orderBy('createdAt', 'desc').onSnapshot(function(snap) {
                if (snap.empty) {
                    msgList.innerHTML = '<div style="text-align:center; padding:40px; color:#6B7280;"><i class="fas fa-inbox" style="font-size:36px;color:#D4A33A;margin-bottom:12px;display:block;"></i><p>No messages yet.</p></div>';
                    return;
                }
                var html = '<div class="messages-list">';
                snap.forEach(function(doc) {
                    var m = doc.data();
                    var cls = m.read ? 'cg-message-item read' : 'cg-message-item unread';
                    html += '<div class="' + cls + '" data-msg-id="' + doc.id + '">\
                        <div class="cg-msg-header"><strong>' + escapeHtml(m.fromName || m.from || 'System') + '</strong> <span class="cg-msg-date">' + FirebaseServices.formatDate(m.createdAt) + '</span></div>\
                        <div class="cg-msg-subject">' + escapeHtml(m.subject || '(no subject)') + '</div>\
                        <div class="cg-msg-body">' + escapeHtml(m.message || '') + '</div>\
                    </div>';
                });
                html += '</div>';
                msgList.innerHTML = html;
                
                // Mark as read on click
                msgList.querySelectorAll('.cg-message-item.unread').forEach(function(el) {
                    el.addEventListener('click', function() {
                        var id = this.getAttribute('data-msg-id');
                        if (id) db.collection('messages').doc(id).update({ read: true });
                        this.classList.remove('unread');
                        this.classList.add('read');
                    });
                });
            }, function(err) {
                msgList.innerHTML = '<div style="text-align:center; padding:40px; color:#DC2626;"><p>Unable to load messages.</p></div>';
            });
        }
        
        // Shifts tab: load available shifts into cgShiftsTabTable
        var shiftsTabBody = document.getElementById('cgShiftsTabTable');
        if (shiftsTabBody) {
            FirebaseServices.shifts.getAvailable().then(function(snap) {
                if (snap.empty) {
                    shiftsTabBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#6B7280;">No available shifts at this time.</td></tr>';
                    return;
                }
                shiftsTabBody.innerHTML = '';
                snap.forEach(function(doc) {
                    var s = doc.data();
                    shiftsTabBody.innerHTML += '<tr>\
                        <td><strong>' + escapeHtml(s.clientName) + '</strong></td>\
                        <td>' + FirebaseServices.formatDate(s.date) + '</td>\
                        <td>' + escapeHtml(s.startTime) + ' - ' + escapeHtml(s.endTime) + '</td>\
                        <td>' + escapeHtml(s.type) + '</td>\
                        <td>' + escapeHtml(s.rate) + '</td>\
                        <td><button class="btn btn-gold accept-shift-tab-btn" data-shift-id="' + doc.id + '" style="padding:8px 16px;font-size:13px;">Accept</button></td>\
                    </tr>';
                });
                shiftsTabBody.querySelectorAll('.accept-shift-tab-btn').forEach(function(btn) {
                    btn.addEventListener('click', function() {
                        var shiftId = this.getAttribute('data-shift-id');
                        FirebaseServices.shifts.accept(shiftId, caregiverId).then(function() {
                            showNotification('Shift accepted!', 'success');
                            // Re-run both the dashboard and shifts tab load
                            loadCaregiverDashboard(caregiverId);
                        }).catch(function(err) {
                            showNotification('Error accepting shift.', 'error');
                        });
                    });
                });
            }).catch(function() {
                shiftsTabBody.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:30px; color:#DC2626;">Error loading shifts.</td></tr>';
            });
        }
        
        // Unread count badge update
        var unreadEl = document.getElementById('cgUnreadMsgs');
        if (unreadEl) {
            FirebaseServices.messages.getUnreadCount(caregiverId).then(function(count) {
                unreadEl.textContent = count;
            }).catch(function() { unreadEl.textContent = '0'; });
        }
    }
    
    // ==========================================
    // UTILITY
    // ==========================================
    function setFallback(id, value) {
        var el = document.getElementById(id);
        if (el) el.textContent = value || '0';
    }
    

    // ==========================================
    // LOAD WEBSITE CONTENT FROM FIRESTORE
    // ==========================================
    loadWebsiteContent();
    loadHomepageTestimonials();
    
});
