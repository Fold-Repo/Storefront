import { initializeApp, type FirebaseApp } from "firebase/app";
import { getFirestore, enableNetwork, disableNetwork, onSnapshotsInSync, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "storefront-64d56.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "storefront-64d56",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "storefront-64d56.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "695330621735",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:695330621735:web:6dbc73154a74c7ae1c8102",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-Z851FP9YGC"
};

// Validate that required config is present
if (!firebaseConfig.apiKey) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Firebase API key is missing. Please set NEXT_PUBLIC_FIREBASE_API_KEY in your .env.local file");
  }
}

// Initialize Firebase only if API key is present, otherwise use a placeholder config for build
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    auth = getAuth(app);
  } else {
    // Use placeholder config for build time when API key is missing
    const placeholderConfig = {
      apiKey: "placeholder-key-for-build",
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId
    };
    app = initializeApp(placeholderConfig, 'placeholder');
    db = getFirestore(app);
    auth = getAuth(app);
  }
} catch (error) {
  // During build, if Firebase initialization fails, try with placeholder
  // This allows the build to complete even without valid Firebase config
  if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
    console.warn("Firebase initialization failed during build. Using placeholder config.");
    const placeholderConfig = {
      apiKey: "placeholder-key-for-build",
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
      measurementId: firebaseConfig.measurementId
    };
    try {
      app = initializeApp(placeholderConfig, 'placeholder');
      db = getFirestore(app);
      auth = getAuth(app);
    } catch (placeholderError) {
      // If even placeholder fails, we need to provide defaults
      // This should rarely happen, but ensures build doesn't fail
      throw new Error("Firebase initialization failed. Please check your Firebase configuration.");
    }
  } else {
    throw error;
  }
}

export { db, auth };

// Helper function to ensure Firebase is online
export const ensureFirebaseOnline = async () => {
  try {
    await enableNetwork(db);
    return true;
  } catch (error) {
    // Silently fail - network might already be enabled or unavailable
    return false;
  }
};

// Helper to check Firebase connectivity
export const checkFirebaseConnection = async (): Promise<boolean> => {
  try {
    // Try a simple read operation to check connectivity
    const { doc, getDoc } = await import("firebase/firestore");
    const testRef = doc(db, "_test", "connection");
    await Promise.race([
      getDoc(testRef),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
    ]);
    return true;
  } catch (error: any) {
    // If it's a timeout or unavailable error, Firebase is likely offline
    if (error.message === 'timeout' || error.code === 'unavailable') {
      return false;
    }
    // Other errors (like permission-denied) mean Firebase is online but we don't have access
    return true;
  }
};

export { app };
