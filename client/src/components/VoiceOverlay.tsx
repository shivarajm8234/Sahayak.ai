import { useVoiceAgent } from '../hooks/useVoiceAgent';
import { Mic, X, Loader2, Volume2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';

export const VoiceOverlay = () => {
    const { isVoiceActive } = useAppStore();
    const { state, transcript, agentReply, stop } = useVoiceAgent();

    if (!isVoiceActive) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-6 transition-all duration-300">
            <button
                onClick={stop}
                className="absolute top-6 right-6 p-2 text-white/70 hover:text-white transition-colors"
            >
                <X size={32} />
            </button>

            <div className="flex-1 flex flex-col items-center justify-center w-full max-w-lg text-center space-y-8">
                {/* Visualizer */}
                <div className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 ${state === 'listening' ? 'bg-primary/20 scale-110' :
                    state === 'speaking' ? 'bg-green-500/20 scale-105' : 'bg-gray-800'
                    }`}>
                    <div className={`absolute inset-0 rounded-full border-4 border-primary/30 ${state === 'listening' ? 'animate-ping' : ''}`}></div>

                    {state === 'listening' && <Mic size={48} className="text-primary animate-pulse" />}
                    {state === 'processing' && <Loader2 size={48} className="text-yellow-400 animate-spin" />}
                    {state === 'speaking' && <Volume2 size={48} className="text-green-400 animate-bounce" />}
                    {state === 'idle' && <Mic size={48} className="text-gray-400" />}
                </div>

                {/* Status Text */}
                <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-white">
                        {state === 'listening' && "Listening..."}
                        {state === 'processing' && "Thinking..."}
                        {state === 'speaking' && "Speaking..."}
                        {state === 'idle' && "Tap to Speak"}
                    </h3>
                    <p className="text-white/60 text-sm">
                        {state === 'listening' && "Go ahead, I'm listening"}
                        {state === 'processing' && "Processing your request"}
                        {state === 'speaking' && "Tap to interrupt"}
                    </p>
                </div>

                {/* Transcript / Reply */}
                <div className="w-full bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/10 min-h-[150px] flex items-center justify-center">
                    <p className="text-lg text-white font-medium leading-relaxed">
                        {state === 'listening' ? (transcript || "...") : (agentReply || "How can I help you today?")}
                    </p>
                </div>
            </div>

            <div className="mt-8">
                <button
                    onClick={stop}
                    className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-colors border border-white/10"
                >
                    Close Assistant
                </button>
            </div>
        </div>
    );
};
