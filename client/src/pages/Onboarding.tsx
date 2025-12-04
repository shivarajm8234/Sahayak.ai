import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Volume2, Check } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇺🇸', greeting: 'Hello' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳', greeting: 'नमस्ते' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳', greeting: 'ನಮಸ್ಕಾರ' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳', greeting: 'வணக்கம்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳', greeting: 'నమస్కారం' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳', greeting: 'নমস্কার' },
];

export const Onboarding = () => {
    console.log("Onboarding: Rendering");
    const navigate = useNavigate();
    const setLanguage = useAppStore(state => state.setLanguage);
    const [playing, setPlaying] = useState<string | null>(null);
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = async (code: string) => {
        setSelected(code);
        // Small delay for visual feedback
        setTimeout(async () => {
            await setLanguage(code);
            navigate('/home');
        }, 500);
    };

    const playGreeting = (e: React.MouseEvent, lang: typeof languages[0]) => {
        e.stopPropagation();
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(lang.greeting);
            utterance.lang = lang.code === 'en' ? 'en-US' : `${lang.code}-IN`;
            utterance.onstart = () => setPlaying(lang.code);
            utterance.onend = () => setPlaying(null);
            window.speechSynthesis.speak(utterance);
        }
    };

    return (
        <div className="min-h-screen bg-surface p-6 flex flex-col relative">

            <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full pt-12">
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-onSurface mb-3 tracking-tight">Select Language</h2>
                    <p className="text-onSurfaceVariant text-lg">Choose your preferred language / भाषा चुनें</p>
                </div>

                <div className="grid grid-cols-1 gap-4 pb-8">
                    {languages.map(lang => (
                        <div
                            key={lang.code}
                            onClick={() => handleSelect(lang.code)}
                            className={`group relative p-5 rounded-2xl border-2 cursor-pointer transition-all duration-300 flex items-center justify-between
                                ${selected === lang.code
                                    ? 'bg-primaryContainer border-primary shadow-lg scale-[1.02]'
                                    : 'bg-surface border-outline/10 hover:border-primary/50 hover:shadow-md'
                                }`}
                        >
                            <div className="flex items-center gap-5">
                                <span className="text-4xl filter drop-shadow-sm">{lang.flag}</span>
                                <div>
                                    <h3 className={`font-bold text-lg ${selected === lang.code ? 'text-onPrimaryContainer' : 'text-onSurface'}`}>
                                        {lang.name}
                                    </h3>
                                    <p className={`${selected === lang.code ? 'text-onPrimaryContainer/80' : 'text-onSurfaceVariant'}`}>
                                        {lang.native}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={(e) => playGreeting(e, lang)}
                                    className={`p-3 rounded-full transition-colors ${playing === lang.code
                                        ? 'bg-primary text-onPrimary'
                                        : 'bg-surfaceVariant text-onSurfaceVariant hover:bg-primary/10'
                                        }`}
                                >
                                    <Volume2 size={20} className={playing === lang.code ? 'animate-pulse' : ''} />
                                </button>
                                {selected === lang.code && (
                                    <div className="bg-primary text-onPrimary p-2 rounded-full animate-in zoom-in">
                                        <Check size={20} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
