import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

export const agentOrchestrator = functions.https.onRequest(async (req, res) => {
    const { agentOrchestrator } = await import('./agentOrchestrator');
    await agentOrchestrator(req, res);
});

export const eligibilityEngine = functions.https.onCall(async (data, context) => {
    const { eligibilityEngine } = await import('./eligibilityEngine');
    return eligibilityEngine(data, context);
});

export const docVerifier = functions.storage.object().onFinalize(async (object) => {
    const { docVerifier } = await import('./docVerifier');
    return docVerifier(object);
});
