// js/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyC6h-oOG7xteSiJt2jDpSyGitiPp0aDimI",
    authDomain: "wacelmarkt.firebaseapp.com",
    projectId: "wacelmarkt",
    storageBucket: "wacelmarkt.firebasestorage.app",
    messagingSenderId: "662446208797",
    appId: "1:662446208797:web:a3cc83551d42761e4753f4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { 
    app,
    db, 
    auth, 
    storage, 
    collection, 
    addDoc, 
    getDocs, 
    deleteDoc, 
    doc, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    signOut,
    onAuthStateChanged,
    ref, 
    uploadBytes, 
    getDownloadURL 
};
