import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { useAppStore } from '../store/useAppStore';
import { LogOut } from 'lucide-react';

const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা' },
];

export const Onboarding = () => {
    const navigate = useNavigate();
    const setLanguage = useAppStore(state => state.setLanguage);

    const handleSelect = (code: string) => {
        setLanguage(code);
        navigate('/home');
    };

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/auth');
    };

    return (
        <div className="p-6 h-screen flex flex-col justify-center bg-gray-50 relative">
            <button
                onClick={handleLogout}
                className="absolute top-6 right-6 p-2 text-gray-500 hover:text-red-500 transition-colors"
            >
                <LogOut size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Select Language / भाषा चुनें</h2>
            <div className="grid gap-4">
                {languages.map(lang => (
                    <button
                        key={lang.code}
                        onClick={() => handleSelect(lang.code)}
                        className="p-4 bg-white rounded-xl shadow-sm border border-gray-200 text-lg font-medium hover:border-primary hover:text-primary transition-colors flex justify-between items-center"
                    >
                        <span>{lang.name}</span>
                        <span className="text-gray-500">{lang.native}</span>
                    </button>
                ))}
            </div>
        </div>
    );
};
