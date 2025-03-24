import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB01TGN61cH45ywxl46xLxuQgFXS8du148",
  authDomain: "event-planner-40091.firebaseapp.com",
  projectId: "event-planner-40091",
  storageBucket: "event-planner-40091.firebasestorage.app",
  messagingSenderId: "956379056954",
  appId: "1:956379056954:android:02fa749b50d334d62c1e03",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
