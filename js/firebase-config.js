// js/firebase-config.js - النسخة المعدلة للعمل بدون import
console.log("تحميل إعدادات Firebase...");

// إعدادات Firebase الخاصة بمشروعك
const firebaseConfig = {
    apiKey: "AIzaSyC6h-oOG7xteSiJt2jDpSyGitiPp0aDimI",
    authDomain: "wacelmarkt.firebaseapp.com",
    projectId: "wacelmarkt",
    storageBucket: "wacelmarkt.firebasestorage.app",
    messagingSenderId: "662446208797",
    appId: "1:662446208797:web:a3cc83551d42761e4753f4"
};

// التحقق من تحميل Firebase SDK
if (typeof firebase === 'undefined') {
    console.error("Firebase SDK لم يتم تحميله بشكل صحيح");
} else {
    console.log("Firebase SDK محمل بنجاح");
}

// تهيئة Firebase
let app, db, auth;

try {
    app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("تم تهيئة Firebase بنجاح");
} catch (error) {
    console.error("خطأ في تهيئة Firebase:", error);
    // استخدام قيم افتراضية للاختبار
    app = { name: "[DEFAULT]" };
    db = {
        collection: () => ({ 
            get: () => Promise.resolve({ empty: true, forEach: () => {} }),
            add: () => Promise.resolve({ id: 'test-id' })
        }),
        doc: () => ({ 
            delete: () => Promise.resolve(),
            update: () => Promise.resolve()
        })
    };
    auth = {
        signInWithEmailAndPassword: () => Promise.reject({ code: 'auth/not-supported' }),
        signOut: () => Promise.resolve(),
        onAuthStateChanged: () => () => {}
    };
}

// جعل المتغيرات متاحة عالمياً
window.firebaseApp = app;
window.firebaseDb = db;
window.firebaseAuth = auth;

console.log("تم تحميل إعدادات Firebase بنجاح");
