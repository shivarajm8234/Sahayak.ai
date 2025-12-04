import { Mic, GraduationCap, Tractor } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const Home = () => {
    const { setVoiceActive } = useAppStore();

    return (
        <div className="p-6 h-screen bg-gray-50 flex flex-col">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Namaste,</h1>
                <p className="text-gray-600">How can I help you today?</p>
            </header>

            <div className="grid grid-cols-1 gap-6 mb-auto">
                <button className="p-6 bg-blue-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-blue-200 transition-colors">
                    <GraduationCap size={48} className="text-blue-600" />
                    <span className="text-xl font-semibold text-blue-900">Education Loan</span>
                </button>

                <button className="p-6 bg-green-100 rounded-2xl flex flex-col items-center justify-center gap-4 hover:bg-green-200 transition-colors">
                    <Tractor size={48} className="text-green-600" />
                    <span className="text-xl font-semibold text-green-900">Agriculture Loan</span>
                </button>
            </div>

            <button
                onClick={() => setVoiceActive(true)}
                className="w-full py-6 bg-primary rounded-full text-white text-xl font-bold shadow-lg flex items-center justify-center gap-3 animate-bounce-slow"
            >
                <Mic size={32} />
                Tap to Speak
            </button>
        </div>
    );
};
