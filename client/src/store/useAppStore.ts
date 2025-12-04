import { create } from 'zustand';
import type { UserProfile } from '../../../shared/types';

interface AppState {
    language: string;
    setLanguage: (lang: string) => void;
    user: UserProfile | null;
    setUser: (user: UserProfile | null) => void;
    isVoiceActive: boolean;
    setVoiceActive: (active: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
    language: 'en',
    setLanguage: (lang) => set({ language: lang }),
    user: null,
    setUser: (user) => set({ user }),
    isVoiceActive: false,
    setVoiceActive: (active) => set({ isVoiceActive: active }),
}));
