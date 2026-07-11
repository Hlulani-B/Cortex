// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBGlaana9eOF6LGBdQ5a_fws5qS9WazdCU",
  authDomain: "cortex-c4023.firebaseapp.com",
  projectId: "cortex-c4023",
  storageBucket: "cortex-c4023.firebasestorage.app",
  messagingSenderId: "72997481377",
  appId: "1:72997481377:web:4702f62e319d9f0728f9e0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);