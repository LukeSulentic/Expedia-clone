// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4_L37c040wo_PYZ_kEYpvb1O6HUEZwrA",
  authDomain: "proj-demo-30f85.firebaseapp.com",
  projectId: "proj-demo-30f85",
  storageBucket: "proj-demo-30f85.firebasestorage.app",
  messagingSenderId: "905262627099",
  appId: "1:905262627099:web:e7826ca83294c9bdfdbbbe"
};

// Initialize Firebase
const firebase_app = initializeApp(firebaseConfig);

export default firebase_app