import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// TODO: Replace with actual config provided by user
const firebaseConfig = {
    apiKey: "AIzaSyCGEKMReYFb2V9jdLSP6UJE7wlgLxsiZEU",
    authDomain: "sahayak-ai-95c19.firebaseapp.com",
    projectId: "sahayak-ai-95c19",
    storageBucket: "sahayak-ai-95c19.firebasestorage.app",
    messagingSenderId: "789657630274",
    appId: "1:789657630274:android:c1c1894cba2946f3d71fdb" // Note: This is the Android App ID. For best results, register a Web App in Firebase.
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
