import { useState, useEffect, useRef, useCallback } from 'react';
import { DeepgramService } from '../services/deepgram';
import { GeminiService } from '../services/gemini';
import { MurfService } from '../services/murf';
import { useAppStore } from '../store/useAppStore';

const deepgram = new DeepgramService();
const gemini = new GeminiService();
const murf = new MurfService();

export const useVoiceAgent = () => {
    const { isVoiceActive, setVoiceActive, language, user } = useAppStore();
    const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const [transcript, setTranscript] = useState('');
    const [agentReply, setAgentReply] = useState('');
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const startListening = useCallback(async () => {
        if (state === 'listening' || state === 'processing' || state === 'speaking') return;

        try {
            setState('listening');
            await deepgram.connect(async (text, isFinal) => {
                setTranscript(text);
                if (isFinal && text.trim().length > 0) {
                    await processInput(text);
                }
            });
        } catch (error) {
            console.error('Failed to start listening:', error);
            setState('idle');
            setAgentReply("Sorry, I'm having trouble listening. Please try again.");
        }
    }, [state]);

    const stopListening = useCallback(() => {
        try {
            deepgram.stop();
        } catch (e) {
            console.error("Error stopping Deepgram:", e);
        }
        if (state === 'listening') {
            setState('idle');
        }
    }, [state]);

    const processInput = async (text: string) => {
        stopListening();
        setState('processing');

        try {
            const context = {
                userProfile: user,
                currentLanguage: language,
                // Add more context here (e.g., current page, loan details)
            };

            const response = await gemini.generateResponse(text, context, language);

            if (!response || !response.spoken_reply) {
                throw new Error("Invalid response from Gemini");
            }

            setAgentReply(response.spoken_reply);

            // Generate Audio
            // Map language code to Murf Voice ID (This is a simplified mapping, needs real IDs)
            const voiceIdMap: Record<string, string> = {
                'en': 'en-US-1', // Replace with actual Murf Voice IDs
                'hi': 'hi-IN-1',
                'kn': 'kn-IN-1',
                'ta': 'ta-IN-1',
                'te': 'te-IN-1',
                'bn': 'bn-IN-1',
            };
            const voiceId = voiceIdMap[language] || 'en-US-1';

            const audio = await murf.speak(response.spoken_reply, voiceId);
            setAudioUrl(audio);
            setState('speaking');

        } catch (error) {
            console.error('Error processing input:', error);
            setState('idle');
            setAgentReply("I'm having trouble connecting. Please check your internet.");
        }
    };

    useEffect(() => {
        if (isVoiceActive) {
            startListening();
        } else {
            stopListening();
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
        return () => stopListening();
    }, [isVoiceActive, startListening, stopListening]);

    useEffect(() => {
        if (state === 'speaking' && audioUrl) {
            if (!audioRef.current) {
                audioRef.current = new Audio(audioUrl);
                audioRef.current.onended = () => {
                    setState('idle');
                    startListening(); // Auto-listen after speaking
                };
            } else {
                audioRef.current.src = audioUrl;
            }
            audioRef.current.play().catch(e => console.error("Audio play failed", e));
        }
    }, [state, audioUrl, startListening]);

    return {
        state,
        transcript,
        agentReply,
        stop: () => setVoiceActive(false)
    };
};
