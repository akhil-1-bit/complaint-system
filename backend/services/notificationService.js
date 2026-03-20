const admin = require('firebase-admin');
require('dotenv').config();

const isFirebaseConfigured = process.env.FIREBASE_PROJECT_ID && 
                             !process.env.FIREBASE_PROJECT_ID.includes('your_') &&
                             process.env.FIREBASE_PRIVATE_KEY && 
                             !process.env.FIREBASE_PRIVATE_KEY.includes('your_');

if (isFirebaseConfigured) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });
    console.log("Firebase Admin Initialized successfully.");
  } catch (error) {
    console.error("Firebase Initialization Error:", error.message);
  }
} else {
  console.warn("Firebase not configured (using placeholders). Notifications will be logged to console.");
}

class NotificationService {
  static async sendAlert(topic, payload) {
    console.log(`[ALERT] Sending to ${topic}:`, payload);
    
    if (!isFirebaseConfigured) return;

    const message = {
      notification: {
        title: payload.title,
        body: payload.body,
      },
      topic: topic,
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Successfully sent message:', response);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }
}

module.exports = NotificationService;
