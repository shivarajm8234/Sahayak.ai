import React from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { Mic, GraduationCap, Tractor, LogOut, LogIn } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Home = () => {
    const navigate = useNavigate();
    const setVoiceActive = useAppStore(state => state.setVoiceActive);
    const user = useAppStore(state => state.user);

    const handleLogout = async () => {
        await signOut(auth);
        navigate('/auth');
    };

    const handleLogin = () => {
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-24 relative">
            {user ? (
                <button
                    onClick={handleLogout}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm text-gray-500 hover:text-red-500 transition-colors z-10"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            ) : (
                <button
                    onClick={handleLogin}
                    className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-sm text-primary hover:text-indigo-700 transition-colors z-10"
                    title="Login"
                >
                    <LogIn size={20} />
                </button>
            )}

            {/* Header */}
            <header className="bg-white shadow-sm p-4 sticky top-0 z-0 mb-6">
                <h1 className="text-xl font-bold text-primary">Sahayak.ai</h1>
                <p className="text-xs text-gray-500">Your Voice Loan Assistant</p>
            </header>

            <div className="p-6 flex flex-col gap-6">
                <header className="mb-2">
                    <h1 className="text-3xl font-bold text-gray-900">Namaste,</h1>
                    <p className="text-gray-600">How can I help you today?</p>
                </header>

                <div className="grid grid-cols-1 gap-6">
                    <button className="p-6 bg-blue-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-blue-200 transition-colors">
                        <GraduationCap size={48} className="text-blue-600" />
                        <span className="text-xl font-semibold text-blue-900">Education Loan</span>
                    </button>

                    <button className="p-6 bg-green-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-green-200 transition-colors">
                        <Tractor size={48} className="text-green-600" />
                        <span className="text-xl font-semibold text-green-900">Agriculture Loan</span>
                    </button>
                </div>
            </div>

            <div className="fixed bottom-6 left-0 right-0 px-6">
                <button
                    onClick={() => setVoiceActive(true)}
                    className="w-full py-6 bg-primary rounded-full text-white text-xl font-bold shadow-lg flex items-center justify-center gap-3 animate-bounce-slow"
                >
                    <Mic size={32} />
                    Tap to Speak
                </button>
            </div>
        </div>
    );
};
