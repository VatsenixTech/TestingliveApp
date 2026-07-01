const admin = require("firebase-admin");

try {
  if (!admin.apps.length) {
    const firebaseJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

    if (!firebaseJson) {
      console.warn("⚠️ Firebase Admin skipped: FIREBASE_SERVICE_ACCOUNT_JSON not found.");
    } else {
      const serviceAccount = JSON.parse(firebaseJson);

      // Fix newline characters in Render
      if (serviceAccount.private_key) {
        serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");
      }

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });

      console.log("✅ Firebase Admin initialized successfully");
    }
  }
} catch (error) {
  console.error("❌ Firebase Admin Error:", error.message);
}

module.exports = admin;