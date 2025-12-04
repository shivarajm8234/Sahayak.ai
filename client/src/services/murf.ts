export class MurfService {
    private apiKey: string;
    private baseUrl = 'https://api.murf.ai/v1/speech/generate';

    constructor() {
        this.apiKey = import.meta.env.VITE_MURF_API_KEY;
    }

    async speak(text: string, voiceId: string = 'en-US-1'): Promise<string> {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'api-key': this.apiKey,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    voiceId: voiceId,
                    text: text,
                    style: 'Conversational',
                    rate: 0,
                    pitch: 0,
                    sampleRate: 24000,
                    format: 'MP3',
                    channel: 'MONO',
                    encodeAsBase64: false
                })
            });

            if (!response.ok) {
                throw new Error(`Murf API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.audioFile; // URL to the generated audio
        } catch (error) {
            console.error('Murf TTS Error:', error);
            throw error;
        }
    }
}
