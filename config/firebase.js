// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAIfWE1bp67BlVvM5ZD3b0964IFT7evZEs",
  authDomain: "biowordle.firebaseapp.com",
  projectId: "biowordle",
  storageBucket: "biowordle.appspot.com",
  messagingSenderId: "502187232008",
  appId: "1:502187232008:web:f7fa818170911288e1babd",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export default app;
