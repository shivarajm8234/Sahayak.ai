import { X, MicOff } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const VoiceOverlay = () => {
    const { isVoiceActive, setVoiceActive } = useAppStore();

    if (!isVoiceActive) return null;

    return (
        <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-between p-6 animate-in fade-in duration-200">
            <div className="w-full flex justify-end">
                <button
                    onClick={() => setVoiceActive(false)}
                    className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
                >
                    <X size={24} />
                </button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md">
                <div className="text-2xl text-white font-medium text-center mb-8">
                    "I want a loan for my farm..."
                </div>

                {/* Waveform Placeholder */}
                <div className="flex items-center gap-1 h-16 mb-12">
                    {[...Array(5)].map((_, i) => (
                        <div
                            key={i}
                            className="w-2 bg-primary rounded-full animate-pulse"
                            style={{ height: `${Math.random() * 100}%`, animationDelay: `${i * 0.1}s` }}
                        />
                    ))}
                </div>

                <div className="text-gray-400 text-sm uppercase tracking-wider mb-4">
                    Listening...
                </div>
            </div>

            <div className="w-full max-w-md">
                <button className="w-full py-6 bg-red-500 rounded-full text-white font-bold flex items-center justify-center gap-2">
                    <MicOff size={24} />
                    Stop Speaking
                </button>
            </div>
        </div>
    );
};
