// const admin = require("firebase-admin");

// let firebaseAdminConfigured = false;

// try {
//   const projectId = process.env.FIREBASE_PROJECT_ID;
//   const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
//   const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

//   if (!projectId || !clientEmail || !privateKey) {
//     console.warn("⚠️ Firebase Admin environment variables are missing");
//   } else {
//     if (!admin.apps.length) {
//       admin.initializeApp({
//         credential: admin.credential.cert({
//           projectId,
//           clientEmail,
//           privateKey,
//         }),
//       });
//     }

//     firebaseAdminConfigured = true;

//     console.log("✅ Firebase Admin configured successfully");
//   }
// } catch (error) {
//   console.error("❌ Firebase Admin initialization failed:", error.message);
// }

// module.exports = {
//   admin,
//   firebaseAdminConfigured,
// };