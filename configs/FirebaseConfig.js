import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "FIREBASE_API_KEY",
  authDomain: "lebron-4b25d.firebaseapp.com",
  projectId: "lebron-4b25d",
  storageBucket: "lebron-4b25d.firebasestorage.app",
  messagingSenderId: "878299687911",
  appId: "1:878299687911:web:a2c16205693175344c2b42"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app)