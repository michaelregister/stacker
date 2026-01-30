
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyBNsjH9yeXLdLXu0PtiauHTQ9CYD4yFnqg",
  authDomain: "slstacker-be1ef.firebaseapp.com",
  projectId: "slstacker-be1ef",
  storageBucket: "slstacker-be1ef.firebasestorage.app",
  messagingSenderId: "163174574318",
  appId: "1:163174574318:web:de0ca30a2a20e3221babff",
  measurementId: "G-3BRHEPWTQ1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const googleProvider = new GoogleAuthProvider();

export { db, auth, analytics, googleProvider };
