const express = require("express");

const {
  createInterviewSession,
  getInterviewPrepStats,
  getInterviewSession,
} = require(
  "../controllers/interviewPrepController"
);

const router = express.Router();

const authModule = require(
  "../middleware/authMiddleware"
);

const authMiddleware =
  typeof authModule === "function"
    ? authModule
    : authModule.authMiddleware ||
      authModule.protect ||
      authModule.verifyToken ||
      authModule.authenticateToken ||
      authModule.default;

if (typeof authMiddleware !== "function") {
  throw new TypeError(
    "No valid authentication middleware was exported from middleware/authMiddleware.js"
  );
}

router.get(
  "/stats",
  authMiddleware,
  getInterviewPrepStats
);

router.post(
  "/sessions",
  authMiddleware,
  createInterviewSession
);

router.get(
  "/sessions/:sessionId",
  authMiddleware,
  getInterviewSession
);

module.exports = router;