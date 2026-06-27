const express = require("express");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const ResumeStudio = require("../models/ResumeStudio");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

async function extractResumeText(file) {
  if (!file) return "";

  if (file.mimetype === "application/pdf") {
    const data = await pdfParse(file.buffer);
    return data.text || "";
  }

  if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    const data = await mammoth.extractRawText({ buffer: file.buffer });
    return data.value || "";
  }

  if (file.mimetype === "text/plain") {
    return file.buffer.toString("utf-8");
  }

  throw new Error("Only PDF, DOCX, and TXT files are supported");
}

function calculateAtsScore(text) {
  const lower = text.toLowerCase();

  let score = 40;
  const improvements = [];
  const warnings = [];

  const hasEmail = /\S+@\S+\.\S+/.test(text);
  const hasPhone = /(\+?\d[\d\s-]{8,})/.test(text);
  const hasSkills = lower.includes("skills");
  const hasExperience = lower.includes("experience");
  const hasEducation = lower.includes("education");
  const hasProjects = lower.includes("project");
  const hasCertifications = lower.includes("certification");

  if (hasEmail) score += 8;
  else warnings.push("Email address is missing.");

  if (hasPhone) score += 8;
  else warnings.push("Phone number is missing.");

  if (hasSkills) score += 10;
  else improvements.push("Add a clear Skills section.");

  if (hasExperience) score += 12;
  else improvements.push("Add professional experience details.");

  if (hasEducation) score += 8;
  else improvements.push("Add education details.");

  if (hasProjects) score += 6;
  else improvements.push("Add relevant project details.");

  if (hasCertifications) score += 4;
  else improvements.push("Add certifications if you genuinely have them.");

  if (text.length > 1200) score += 4;
  else improvements.push("Add more role-specific details and achievements.");

  score = Math.min(score, 98);

  return {
    atsScore: score,
    breakdown: {
      atsCompatibility: Math.min(score + 1, 100),
      contentQuality: Math.min(score - 1, 100),
      keywordMatch: Math.min(score - 3, 100),
      formatting: Math.min(score + 2, 100),
      readability: Math.min(score, 100),
    },
    improvements,
    warnings,
  };
}

function optimizeResumeText(text) {
  const cleaned = text
    .replace(/[•●▪]/g, "-")
    .replace(/\t/g, " ")
    .replace(/\s{3,}/g, "\n\n")
    .trim();

  return `
ATS OPTIMIZED RESUME

${cleaned}

AI RESUME OPTIMIZATION NOTICE:
This resume has been formatted for ATS compatibility while preserving the candidate's original information. No fake company, fake experience, false certification, or unsupported skill has been added.
`.trim();
}

router.post("/analyze-optimize", upload.single("resume"), async (req, res) => {
  try {
    const {
      candidateId,
      candidateName,
      email,
      resumeText,
      consent,
    } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    if (consent !== "true" && consent !== true) {
      return res.status(400).json({
        message: "Consent is required before resume optimization",
      });
    }

    let finalText = resumeText || "";

    if (req.file) {
      finalText = await extractResumeText(req.file);
    }

    if (!finalText.trim()) {
      return res.status(400).json({
        message: "Resume file or resume text is required",
      });
    }

    const analysis = calculateAtsScore(finalText);
    const optimizedText = optimizeResumeText(finalText);

    const saved = await ResumeStudio.create({
      candidateId,
      candidateName,
      email,
      originalFileName: req.file?.originalname || "pasted-resume.txt",
      originalText: finalText,
      optimizedText,
      atsScore: analysis.atsScore,
      breakdown: analysis.breakdown,
      improvements: analysis.improvements,
      warnings: analysis.warnings,
      consent: true,
      status: "optimized",
    });

    res.json({
      success: true,
      resumeId: saved._id,
      atsScore: saved.atsScore,
      breakdown: saved.breakdown,
      improvements: saved.improvements,
      warnings: saved.warnings,
      optimizedText: saved.optimizedText,
      fileName: saved.originalFileName,
      createdAt: saved.createdAt,
    });
  } catch (error) {
    console.error("RESUME STUDIO ERROR:", error);
    res.status(500).json({
      message: "Resume optimization failed",
      error: error.message,
    });
  }
});

router.get("/recent/:candidateId", async (req, res) => {
  try {
    const resumes = await ResumeStudio.find({
      candidateId: req.params.candidateId,
    })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({ success: true, resumes });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/download/:resumeId", async (req, res) => {
  try {
    const resume = await ResumeStudio.findById(req.params.resumeId);

    if (!resume) {
      return res.status(404).json({ message: "Resume not found" });
    }

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="ATS_Optimized_Resume.txt"`
    );
    res.setHeader("Content-Type", "text/plain");

    res.send(resume.optimizedText);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:resumeId", async (req, res) => {
  try {
    await ResumeStudio.findByIdAndDelete(req.params.resumeId);
    res.json({ success: true, message: "Resume deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;