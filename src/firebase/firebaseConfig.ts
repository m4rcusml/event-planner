// firebaseConfig.ts - Fixed Configuration for Permissions & Persistence
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore,
  doc, 
  setDoc, 
  deleteDoc,
  enableIndexedDbPersistence
} from "firebase/firestore";
import { Platform } from "react-native";

const firebaseConfig = {
  apiKey: "AIzaSyB01TGN61cH45ywxl46xLxuQgFXS8du148",
  authDomain: "event-planner-40091.firebaseapp.com",
  projectId: "event-planner-40091",
  storageBucket: "event-planner-40091.firebasestorage.app",
  messagingSenderId: "956379056954",
  appId: "1:956379056954:android:02fa749b50d334d62c1e03",
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Auth configuration
export const auth = getAuth(app);

// Firestore configuration - using getFirestore for better compatibility with Expo
export const db = getFirestore(app);

// Initialize persistence but handle errors gracefully
export const initPersistence = async () => {
  // Only try to enable persistence on platforms that support it well
  if (Platform.OS === 'web') {
    console.log("Skipping IndexedDB persistence on web platform");
    return false;
  }
  
  try {
    await enableIndexedDbPersistence(db);
    console.log("Firestore offline persistence enabled");
    return true;
  } catch (error) {
    const errorAny = error as any;
    if (errorAny.code === 'failed-precondition') {
      console.warn("Multiple tabs open, persistence can only be enabled in one tab");
    } else if (errorAny.code === 'unimplemented') {
      console.warn("IndexedDB is not available on this platform");
    } else {
      console.error("Error enabling persistence:", error);
    }
    return false;
  }
};

// Firestore connection check function with auth error handling
export const checkFirestoreConnection = async () => {
  try {
    const timestamp = Date.now().toString();
    const docRef = doc(db, "_connection_test", timestamp);
    
    // Try to write to a test document
    await setDoc(docRef, { timestamp });
    
    // If successful, clean up
    await deleteDoc(docRef);
    console.log("✅ Firestore connection successful");
    return true;
  } catch (error) {
    const errorAny = error as any;
    if (errorAny.code === 'permission-denied') {
      console.error("❌ Firestore permission denied. Please check your security rules.");
      return false;
    }
    console.error("❌ Firestore connection error:", error);
    return false;
  }
};