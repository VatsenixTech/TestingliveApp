const express = require("express");

const multer = require("multer");

const {
  analyzeMyResume,
  getMyRecentResumes,
} = require("../controllers/resumeStudioController");

const router = express.Router();

/* =========================================================
   AUTH MIDDLEWARE
========================================================= */

const authModule =
  require("../middleware/authMiddleware");

const authMiddleware =
  typeof authModule === "function"
    ? authModule
    : authModule.authMiddleware ||
      authModule.protect ||
      authModule.verifyToken ||
      authModule.authenticateToken;

if (typeof authMiddleware !== "function") {
  throw new TypeError(
    "No valid authentication middleware was exported from middleware/authMiddleware.js"
  );
}

/* =========================================================
   MULTER
========================================================= */

const storage = multer.memoryStorage();

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },

  fileFilter: (req, file, callback) => {
    const allowedExtensions = [
      "pdf",
      "docx",
      "txt",
    ];

    const extension =
      file.originalname
        ?.split(".")
        .pop()
        ?.toLowerCase();

    if (!allowedExtensions.includes(extension)) {
      return callback(
        new Error(
          "Only PDF, DOCX, and TXT resumes are supported."
        )
      );
    }

    callback(null, true);
  },
});

/* =========================================================
   ROUTES
========================================================= */

router.post(
  "/analyze",
  authMiddleware,
  upload.single("resume"),
  analyzeMyResume
);

router.get(
  "/recent",
  authMiddleware,
  getMyRecentResumes
);

/* =========================================================
   MULTER ERROR HANDLER
========================================================= */

router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,

      message:
        error.code === "LIMIT_FILE_SIZE"
          ? "Resume must be smaller than 10 MB."
          : error.message,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,

      message:
        error.message ||
        "Resume upload failed.",
    });
  }

  next();
});

module.exports = router;