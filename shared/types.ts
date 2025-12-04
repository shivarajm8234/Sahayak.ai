export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    preferredLanguage: string; // 'en', 'hi', 'kn', 'ta', 'te', 'bn'
    location?: {
        lat: number;
        lng: number;
    };
    deviceMeta?: {
        platform: string;
        userAgent: string;
    };
    createdAt: number;
}

export interface LoanScheme {
    id: string;
    title: string;
    provider: string; // Bank or Govt Body
    type: 'educational' | 'agriculture' | 'personal' | 'home' | 'vehicle';
    description: string;
    interestRate: {
        min: number;
        max: number;
        type: 'fixed' | 'floating';
    };
    loanAmount: {
        min: number;
        max: number;
    };
    eligibilityCriteria: string[];
    documentsRequired: string[];
    applicationUrl?: string;
    scrapedFrom: string;
    lastScrapedAt: number;
    relevanceScore?: number; // Calculated for the user
}

export interface LoanApplication {
    id: string;
    uid: string;
    schemeId: string;
    schemeTitle: string;
    status: 'draft' | 'submitted' | 'verified' | 'approved' | 'rejected';
    applicantDetails: Record<string, any>; // Flexible fields based on scheme
    documents: {
        type: string; // 'aadhaar', 'pan', 'income_proof'
        url: string;
        verified: boolean;
        verificationNote?: string;
    }[];
    eligibilityScore?: number;
    createdAt: number;
    updatedAt: number;
}

export interface Appointment {
    id: string;
    applicationId: string;
    uid: string;
    branchName: string;
    branchAddress: string;
    timestamp: number;
    status: 'scheduled' | 'completed' | 'cancelled';
}

export interface AgentResponse {
    intent: 'apply' | 'learn' | 'compare' | 'status' | 'unknown';
    slots: Record<string, any>;
    spokenReply: string;
    visualSummary?: {
        title: string;
        bullets: string[];
    };
    actions: ('ask_slot' | 'show_scheme' | 'submit_application' | 'book_slot')[];
    confidence: number;
}
