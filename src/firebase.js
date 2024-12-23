import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, onSnapshot, collection, doc, getDocs, getDoc, updateDoc, increment, query, where, addDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBNgMwL6dwFtf3b4yt5YfaenTrDiR2tSAs",
  authDomain: "stocxfolio.firebaseapp.com",
  projectId: "stocxfolio",
  storageBucket: "stocxfolio.firebasestorage.app",
  messagingSenderId: "754927499676",
  appId: "1:754927499676:web:bfc800ce5348243009f059",
  measurementId: "G-WYNB7Y5VB0"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export { getDocs, getDoc, onSnapshot, collection, doc, updateDoc, increment, query, where, addDoc, deleteDoc };
