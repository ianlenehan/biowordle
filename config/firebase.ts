// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIfWE1bp67BlVvM5ZD3b0964IFT7evZEs",
  authDomain: "biowordle.firebaseapp.com",
  projectId: "biowordle",
  storageBucket: "biowordle.appspot.com",
  messagingSenderId: "502187232008",
  appId: "1:502187232008:web:f7fa818170911288e1babd",
  measurementId: "G-RSG54HJGST"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore();

export default app;
