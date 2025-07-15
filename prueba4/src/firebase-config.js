import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD2rHtX1jIOYk0Vq5sdsuTI_kvpUBmV7FY",
  authDomain: "eva4-comunidad.firebaseapp.com",
  projectId: "eva4-comunidad",
  storageBucket: "eva4-comunidad.appspot.com",
  messagingSenderId: "681065576780",
  appId: "1:681065576780:web:8d61cae8396c3ed03737e9",
  measurementId: "G-ZZV0XMCMES"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

console.log("Firebase App initialized:", app.name);

export { app, analytics, db };
