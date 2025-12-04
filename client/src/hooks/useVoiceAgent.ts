import { useState, useEffect, useRef, useCallback } from 'react';
import { GeminiService } from '../services/gemini';
import { useAppStore } from '../store/useAppStore';

const gemini = new GeminiService();

export const useVoiceAgent = () => {
    const { isVoiceActive, setVoiceActive, language, user } = useAppStore();

    useEffect(() => {
        const key = import.meta.env.VITE_GEMINI_API_KEY;
        console.log("Gemini API Key present:", !!key, key ? key.substring(0, 5) + '...' : 'Missing');
    }, []);

    const [state, setState] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
    const stateRef = useRef(state);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const [transcript, setTranscript] = useState('');
    const [agentReply, setAgentReply] = useState('');

    // Refs for Web Speech API
    const recognitionRef = useRef<any>(null);
    const synthesisRef = useRef<SpeechSynthesis>(window.speechSynthesis);
    const isVoiceActiveRef = useRef(isVoiceActive);

    // Update ref when state changes
    useEffect(() => {
        isVoiceActiveRef.current = isVoiceActive;
    }, [isVoiceActive]);

    const speak = useCallback((text: string) => {
        if (!synthesisRef.current) return;

        // Cancel any ongoing speech
        synthesisRef.current.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Set language for TTS
        const langMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'kn': 'kn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'bn': 'bn-IN'
        };
        utterance.lang = langMap[language] || 'en-US';

        utterance.onstart = () => {
            setState('speaking');
            stateRef.current = 'speaking';
        };
        utterance.onend = () => {
            console.log("TTS Ended. Restarting listening...");
            setState('idle');
            stateRef.current = 'idle'; // Manually update ref to avoid race condition

            // Auto-listen after speaking if voice is still active
            if (isVoiceActiveRef.current) {
                startListening();
            }
        };
        utterance.onerror = (e) => {
            console.error("TTS Error:", e);
            setState('idle');
            stateRef.current = 'idle';
        };

        synthesisRef.current.speak(utterance);
    }, [language]); // Keep language dependency

    const processInput = async (text: string) => {
        setState('processing');

        try {
            const context = {
                userProfile: user,
                currentLanguage: language,
            };

            const response = await gemini.generateResponse(text, context, language);

            if (!response || !response.spoken_reply) {
                throw new Error("Invalid response from Gemini");
            }

            setAgentReply(response.spoken_reply);
            speak(response.spoken_reply);

        } catch (error) {
            console.error('Error processing input:', error);
            setState('idle');
            speak("I'm having trouble connecting. Please check your internet.");
        }
    };

    const startListening = useCallback(() => {
        // Use ref to check state to avoid dependency cycle
        if (stateRef.current === 'listening' || stateRef.current === 'processing' || stateRef.current === 'speaking') {
            console.log("Skipping startListening, state is:", stateRef.current);
            return;
        }

        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.error("Speech recognition NOT supported in this browser/webview.");
            setAgentReply("Voice not supported on this device.");
            return;
        }

        console.log("Starting Speech Recognition...");

        // Stop any existing recognition
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        }

        const recognition = new SpeechRecognition();
        recognitionRef.current = recognition;

        recognition.continuous = false;
        recognition.interimResults = true;

        // Set language for STT
        const langMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'kn': 'kn-IN',
            'ta': 'ta-IN',
            'te': 'te-IN',
            'bn': 'bn-IN'
        };
        recognition.lang = langMap[language] || 'en-US';

        recognition.onstart = () => {
            console.log("Speech Recognition Started");
            setState('listening');
        };

        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            console.log("Transcript:", finalTranscript || interimTranscript);
            setTranscript(finalTranscript || interimTranscript);

            if (finalTranscript) {
                recognition.stop();
                processInput(finalTranscript);
            }
        };

        recognition.onerror = (event: any) => {
            console.error("STT Error:", event.error);
            if (event.error === 'no-speech') {
                // Just restart if no speech detected and still active
                if (isVoiceActiveRef.current) {
                    // Small delay to avoid rapid loops
                    setTimeout(() => {
                        if (isVoiceActiveRef.current && stateRef.current === 'listening') {
                            // Only restart if we are still conceptually "listening" (or idle after error)
                            // Actually, if error is no-speech, state is likely idle now.
                            // We should call startListening again.
                            startListening();
                        }
                    }, 1000);
                    return;
                }
            }
            if (event.error === 'not-allowed') {
                setAgentReply("Microphone permission denied.");
            }
            // For aborted, we don't want to reset to idle if we are just restarting
            if (event.error !== 'aborted') {
                setState('idle');
            }
        };

        recognition.onend = () => {
            // If we stopped but didn't process input (e.g. silence), and voice is still active, restart
            // But we handle the loop in onresult/processInput mostly.
            console.log("Speech Recognition Ended");
            if (stateRef.current === 'listening') {
                setState('idle');
            }
        };

        try {
            recognition.start();
        } catch (e) {
            console.error("Failed to start recognition:", e);
        }

    }, [language]); // Removed state dependency

    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch (e) {
                // ignore
            }
        }
        if (synthesisRef.current) {
            synthesisRef.current.cancel();
        }
        setState('idle');
    }, []);

    useEffect(() => {
        if (isVoiceActive) {
            startListening();
        } else {
            stopListening();
        }
        // Cleanup function
        return () => {
            // We only want to stop if the component unmounts or isVoiceActive changes to false.
            // But this cleanup runs on every dependency change.
            // If startListening changes (due to language change), we DO want to restart.
            // But we don't want the loop we saw before.
            // Since startListening no longer depends on state, it won't change when state changes.
            // It only changes when language changes.
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {
                    // ignore
                }
            }
        };
    }, [isVoiceActive, startListening, stopListening]);

    return {
        state,
        transcript,
        agentReply,
        stop: () => setVoiceActive(false)
    };
};
