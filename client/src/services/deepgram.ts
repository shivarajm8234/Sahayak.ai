import { createClient, LiveClient, LiveTranscriptionEvents } from '@deepgram/sdk';

export class DeepgramService {
    private client: LiveClient | null = null;
    private mediaRecorder: MediaRecorder | null = null;
    private apiKey: string;
    private isConnected = false;

    constructor() {
        // Hardcoded for debugging
        this.apiKey = '00a9e1c657f6a9a4c5ea2b57f6c65bcb7918bc60';
        console.log('DeepgramService initialized with key:', this.apiKey.substring(0, 5) + '...');
    }

    async connect(onTranscript: (text: string, isFinal: boolean) => void) {
        if (this.isConnected) return;

        try {
            const deepgram = createClient(this.apiKey);
            this.client = deepgram.listen.live({
                model: 'nova-2',
                language: 'en-IN',
                smart_format: true,
                interim_results: true,
            });

            this.client.on(LiveTranscriptionEvents.Open, () => {
                this.isConnected = true;
                console.log('Deepgram connected');

                this.client?.on(LiveTranscriptionEvents.Transcript, (data) => {
                    const transcript = data.channel.alternatives[0].transcript;
                    if (transcript) {
                        onTranscript(transcript, data.is_final);
                    }
                });
            });

            this.client.on(LiveTranscriptionEvents.Close, () => {
                this.isConnected = false;
                console.log('Deepgram disconnected');
            });

            this.client.on(LiveTranscriptionEvents.Error, (error) => {
                console.error('Deepgram error:', error);
            });

            await this.startMicrophone();

        } catch (error) {
            console.error('Failed to connect to Deepgram:', error);
            throw error;
        }
    }

    private async startMicrophone() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            this.mediaRecorder.addEventListener('dataavailable', (event) => {
                if (event.data.size > 0 && this.client && this.client.getReadyState() === 1) {
                    this.client.send(event.data);
                }
            });

            this.mediaRecorder.start(250); // Send chunks every 250ms
        } catch (error) {
            console.error('Error accessing microphone:', error);
            throw error;
        }
    }

    stop() {
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }

        if (this.client) {
            this.client.finish();
            this.client = null;
        }
        this.isConnected = false;
    }
}
