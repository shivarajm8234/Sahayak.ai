import { GoogleGenerativeAI } from '@google/generative-ai';

const SYSTEM_PROMPT = `
You are VaaniLoan Voice Agent — a calm, friendly, multilingual AI loan advisor designed for users with low financial literacy.

Your core behaviors:
- Speak slowly, clearly, and in simple language.
- One question at a time.
- No long speeches unless summarizing a scheme.
- Always confirm important details.
- Never overwhelm users with too many options.
- CRITICAL: You MUST reply ONLY in the user's selected language. Do not switch to English unless the user explicitly asks.
- Respond emotionally supportive: helpful, patient, non-judgmental.

Output JSON format:
{
  "spoken_reply": "Text for TTS output (translated to user language)",
  "summary_text": "Short UI summary (translated)",
  "intent": "detected_intent",
  "slots": { "loan_type": "", "course": "", "income": "", "farm_size": "" },
  "actions": ["ask_next_question", "show_scheme", "start_application", "request_document"],
  "confidence": 0.0
}

Intents: Explore Loan Schemes, Ask About Eligibility, Compare Loans, Start Application, Upload Documents, Check Status, Book Appointment, Confusion / Ask for Help, General Financial Questions.
`;

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model: any;

    constructor() {
        this.genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
        // Use gemini-2.0-flash as it is available for this key
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async generateResponse(transcript: string, context: any, language: string = 'en') {
        try {
            const prompt = `
            Context: ${JSON.stringify(context)}
            User Language: ${language}
            User Input: "${transcript}"
            
            ${SYSTEM_PROMPT}
            `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Extract JSON from response (handle potential markdown blocks)
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            throw new Error("Invalid JSON response from Gemini");
        } catch (error) {
            console.error("Gemini Error:", error);
            return {
                spoken_reply: "I'm sorry, I didn't catch that. Could you please repeat?",
                summary_text: "Error processing request",
                intent: "fallback",
                slots: {},
                actions: ["ask_next_question"],
                confidence: 0.0
            };
        }
    }
}
