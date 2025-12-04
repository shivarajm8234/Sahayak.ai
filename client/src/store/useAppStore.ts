import { create } from 'zustand';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { UserProfile } from '../../../shared/types';

interface AppState {
    language: string;
    setLanguage: (lang: string) => void;
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    isVoiceActive: boolean;
    setVoiceActive: (active: boolean) => void;
    syncUserProfile: (uid: string, email: string | null, displayName: string | null, photoURL: string | null) => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    language: 'en',
    setLanguage: async (lang) => {
        set({ language: lang });
        const { user } = get();
        if (user) {
            try {
                const userRef = doc(db, 'users', user.uid);
                await setDoc(userRef, { preferredLanguage: lang }, { merge: true });
            } catch (error) {
                console.error("Failed to update language in Firestore", error);
            }
        }
    },
    user: null,
    setUser: (user) => set({ user }),
    isVoiceActive: false,
    setVoiceActive: (active) => set({ isVoiceActive: active }),
    syncUserProfile: async (uid, email, displayName, photoURL) => {
        try {
            const userRef = doc(db, 'users', uid);
            const userSnap = await getDoc(userRef);

            if (userSnap.exists()) {
                const data = userSnap.data() as UserProfile;
                set({ user: data, language: data.preferredLanguage || 'en' });
            } else {
                const newProfile: UserProfile = {
                    uid,
                    email,
                    displayName,
                    photoURL,
                    // preferredLanguage not set initially
                    createdAt: Date.now(),
                };
                await setDoc(userRef, newProfile);
                set({ user: newProfile });
            }
        } catch (error) {
            console.error("Error syncing user profile:", error);
        }
    }
}));
