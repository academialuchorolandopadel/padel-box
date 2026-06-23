import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuración del proyecto Firebase del club.
// Estas claves son de identificación (no son secretas): lo que protege los
// datos son las reglas de Firestore y el login. Por eso pueden ir en el código.
const firebaseConfig = {
  apiKey: "AIzaSyDMRyN-xamuEdUBT6Itz0Pfs-GfZH3jxio",
  authDomain: "padel-box-sistema.firebaseapp.com",
  projectId: "padel-box-sistema",
  storageBucket: "padel-box-sistema.firebasestorage.app",
  messagingSenderId: "488225830232",
  appId: "1:488225830232:web:9c9074f6f31c0da00ba12d",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
