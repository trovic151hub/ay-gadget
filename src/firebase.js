import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyALavEworgb8ks3iMPaCgkXCcDBJiC_1mM",
  authDomain: "ay-s-gadget.firebaseapp.com",
  projectId: "ay-s-gadget",
  storageBucket: "ay-s-gadget.firebasestorage.app",
  messagingSenderId: "34300968590",
  appId: "1:34300968590:web:6fc04bbf948601afe593df"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export default app;
