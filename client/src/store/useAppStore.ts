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
    initializeGuest: () => Promise<void>;
}

export const useAppStore = create<AppState>((set, get) => ({
    language: 'en',
    setLanguage: async (lang) => {
        set({ language: lang });
        const { user } = get();
        if (user && !user.isGuest) {
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
        if (uid.startsWith('guest_')) return;
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
    },
    initializeGuest: async () => {
        const { user } = get();
        if (user) return;

        // Check local storage for existing guest ID
        let guestId = localStorage.getItem('guest_uid');
        if (!guestId) {
            guestId = 'guest_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('guest_uid', guestId);
        }

        const guestProfile: UserProfile = {
            uid: guestId,
            email: null,
            displayName: 'Guest User',
            photoURL: null,
            createdAt: Date.now(),
            isGuest: true
        };

        // We don't necessarily need to save guest to Firestore immediately, 
        // but we can if we want persistence across devices (though that requires auth).
        // For now, just set in state.
        set({ user: guestProfile });
    }
}));
