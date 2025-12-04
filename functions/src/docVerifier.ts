import * as functions from 'firebase-functions';

export const docVerifier = async (object: functions.storage.ObjectMetadata) => {
    // TODO: Download file
    // TODO: Run OCR
    // TODO: Verify document
    console.log('Processing file:', object.name);
    return null;
};
