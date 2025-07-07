import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAdZmlMYkzSi7Q4ksVMh8IzwcEray7GSDA",
  authDomain: "cardsafe-keeper.firebaseapp.com",
  projectId: "cardsafe-keeper",
  storageBucket: "cardsafe-keeper.firebasestorage.app",
  messagingSenderId: "914427408287",
  appId: "1:914427408287:web:ff27bedc8fdcaafe5b57aa"
};

let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
}

const auth = getAuth(app);

export { auth };
