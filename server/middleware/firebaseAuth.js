// server/middleware/firebaseAuth.js
const admin = require("firebase-admin");

const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });

    console.log("✅ Firebase Admin Initialized");
  }
};

const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token || !token.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization token not provided or malformed." });
  }

  const idToken = token.split("Bearer ")[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);

    req.user = {
      uid: decodedToken.uid,
    };

    next();
  } catch (error) {
    console.error("❌ Token verification error:", error);
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = {
  initializeFirebase,
  verifyToken,
};
