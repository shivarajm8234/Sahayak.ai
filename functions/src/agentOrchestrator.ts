import * as functions from 'firebase-functions';

export const agentOrchestrator = async (req: functions.https.Request, res: functions.Response) => {
    // TODO: Initialize LiveKit Agent
    // TODO: Connect to Room
    // TODO: Listen for Audio
    res.status(200).send({ status: 'Agent started', roomId: req.body.roomId });
};
