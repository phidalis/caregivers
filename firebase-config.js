// ==========================================
// FIREBASE CONFIGURATION - Mercy Senior Solutions
// Uses Firebase compat SDK (no build step needed)
// ==========================================

const firebaseConfig = {
  apiKey: "AIzaSyAJokepO6XMuekfmiulWW1-kq13jxX5AQI",
  authDomain: "caregivers-6fd93.firebaseapp.com",
  projectId: "caregivers-6fd93",
  storageBucket: "caregivers-6fd93.firebasestorage.app",
  messagingSenderId: "341618979293",
  appId: "1:341618979293:web:d078675abd7412aaf10634",
  measurementId: "G-BTSSHKGG25"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const auth = firebase.auth();
const storage = firebase.storage();
