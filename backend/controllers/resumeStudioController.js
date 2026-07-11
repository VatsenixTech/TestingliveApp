const mammoth = require("mammoth");

const ResumeAnalysis = require("../models/ResumeAnalysis");

/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value = "") {
  return String(value)
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function hasAny(text, words = []) {
  const lowerText = text.toLowerCase();

  return words.some((word) =>
    lowerText.includes(String(word).toLowerCase())
  );
}

function getCandidateId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.candidate?._id ||
    req.candidate?.id
  );
}

/* =========================================================
   EXTRACT PDF TEXT

   pdf-parse versions can export differently.
========================================================= */

async function extractPdfText(buffer) {
  const pdfModule = require("pdf-parse");

  if (typeof pdfModule === "function") {
    const result = await pdfModule(buffer);

    return result.text || "";
  }

  if (typeof pdfModule.default === "function") {
    const result = await pdfModule.default(buffer);

    return result.text || "";
  }

  throw new Error(
    "Unsupported pdf-parse package export. Check installed pdf-parse version."
  );
}

/* =========================================================
   EXTRACT RESUME TEXT
========================================================= */

async function extractResumeText(file) {
  if (!file) {
    return "";
  }

  const extension =
    file.originalname
      ?.split(".")
      .pop()
      ?.toLowerCase() || "";

  if (extension === "pdf") {
    return extractPdfText(file.buffer);
  }

  if (extension === "docx") {
    const result = await mammoth.extractRawText({
      buffer: file.buffer,
    });

    return result.value || "";
  }

  if (extension === "txt") {
    return file.buffer.toString("utf8");
  }

  throw new Error(
    "Unsupported resume format. Upload PDF, DOCX, or TXT."
  );
}

/* =========================================================
   REAL ATS ANALYSIS

   IMPORTANT:

   This is deterministic resume-content analysis.

   It is NOT a dummy random score.

   Production ATS ranking should later add:
   - Job description matching
   - Semantic skill matching
   - Resume parsing
   - AI rewrite service
========================================================= */

function analyzeResume(resumeText) {
  const text = normalizeText(resumeText);

  const lower = text.toLowerCase();

  const words = text
    .split(/\s+/)
    .filter(Boolean);

  const wordCount = words.length;

  const emailFound =
    /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(text);

  const phoneFound =
    /(?:\+?\d[\d\s().-]{7,}\d)/.test(text);

  const linkedinFound =
    /linkedin\.com\/in\//i.test(text);

  const githubFound =
    /github\.com\//i.test(text);

  const summaryFound = hasAny(lower, [
    "professional summary",
    "career summary",
    "profile summary",
    "summary",
    "objective",
  ]);

  const experienceFound = hasAny(lower, [
    "work experience",
    "professional experience",
    "employment history",
    "experience",
  ]);

  const educationFound = hasAny(lower, [
    "education",
    "academic qualification",
    "academic background",
    "qualification",
  ]);

  const skillsFound = hasAny(lower, [
    "technical skills",
    "core skills",
    "skills",
    "technologies",
    "tech stack",
  ]);

  const projectFound = hasAny(lower, [
    "projects",
    "project experience",
    "professional projects",
  ]);

  const certificationFound = hasAny(lower, [
    "certifications",
    "certification",
    "certified",
  ]);

  const actionVerbMatches =
    text.match(
      /\b(developed|built|designed|implemented|created|optimized|improved|reduced|increased|automated|managed|led|delivered|migrated|integrated|engineered|analyzed|deployed)\b/gi
    ) || [];

  const measurableAchievementMatches =
    text.match(
      /\b\d+(?:\.\d+)?\s?(?:%|percent|hours?|days?|weeks?|months?|years?|million|thousand|users?|customers?|records?|jobs?|pipelines?|applications?)\b/gi
    ) || [];

  const bulletMatches =
    text.match(/(?:^|\n)\s*(?:[-•▪◦*]|(?:\d+\.))\s+/g) || [];

  /* ---------------------------------------------------------
     CONTACT INFORMATION: 15
  --------------------------------------------------------- */

  let contactScore = 0;

  if (emailFound) contactScore += 6;

  if (phoneFound) contactScore += 5;

  if (linkedinFound || githubFound) {
    contactScore += 4;
  }

  /* ---------------------------------------------------------
     SUMMARY: 10
  --------------------------------------------------------- */

  let summaryScore = 0;

  if (summaryFound) {
    summaryScore += 6;
  }

  if (wordCount >= 150) {
    summaryScore += 4;
  }

  /* ---------------------------------------------------------
     EXPERIENCE: 20
  --------------------------------------------------------- */

  let experienceScore = 0;

  if (experienceFound) {
    experienceScore += 10;
  }

  if (actionVerbMatches.length >= 3) {
    experienceScore += 5;
  }

  if (actionVerbMatches.length >= 8) {
    experienceScore += 5;
  }

  /* ---------------------------------------------------------
     EDUCATION: 10
  --------------------------------------------------------- */

  let educationScore = 0;

  if (educationFound) {
    educationScore += 10;
  }

  /* ---------------------------------------------------------
     SKILLS: 15
  --------------------------------------------------------- */

  let skillsScore = 0;

  if (skillsFound) {
    skillsScore += 10;
  }

  if (projectFound || certificationFound) {
    skillsScore += 5;
  }

  /* ---------------------------------------------------------
     FORMATTING / STRUCTURE: 15
  --------------------------------------------------------- */

  let formattingScore = 0;

  const sectionCount = [
    summaryFound,
    experienceFound,
    educationFound,
    skillsFound,
    projectFound,
    certificationFound,
  ].filter(Boolean).length;

  if (sectionCount >= 3) {
    formattingScore += 5;
  }

  if (sectionCount >= 5) {
    formattingScore += 5;
  }

  if (bulletMatches.length >= 3) {
    formattingScore += 5;
  }

  /* ---------------------------------------------------------
     MEASURABLE ACHIEVEMENTS: 15
  --------------------------------------------------------- */

  let achievementScore = 0;

  if (measurableAchievementMatches.length >= 1) {
    achievementScore += 5;
  }

  if (measurableAchievementMatches.length >= 3) {
    achievementScore += 5;
  }

  if (measurableAchievementMatches.length >= 6) {
    achievementScore += 5;
  }

  const atsScore = Math.min(
    100,
    contactScore +
      summaryScore +
      experienceScore +
      educationScore +
      skillsScore +
      formattingScore +
      achievementScore
  );

  const strengths = [];

  const improvements = [];

  if (emailFound && phoneFound) {
    strengths.push(
      "Resume contains essential recruiter contact information."
    );
  } else {
    improvements.push(
      "Add a professional email address and phone number."
    );
  }

  if (summaryFound) {
    strengths.push(
      "Resume contains a professional summary or career profile."
    );
  } else {
    improvements.push(
      "Add a concise professional summary aligned with your target role."
    );
  }

  if (experienceFound) {
    strengths.push(
      "Work experience section was detected."
    );
  } else {
    improvements.push(
      "Add a clearly labeled professional experience section."
    );
  }

  if (actionVerbMatches.length >= 5) {
    strengths.push(
      "Experience uses multiple action-oriented achievement statements."
    );
  } else {
    improvements.push(
      "Start more experience bullet points with strong action verbs."
    );
  }

  if (measurableAchievementMatches.length >= 3) {
    strengths.push(
      "Resume contains measurable achievements and impact."
    );
  } else {
    improvements.push(
      "Add numbers, percentages, scale, time saved, cost reduction, or business impact."
    );
  }

  if (!skillsFound) {
    improvements.push(
      "Add a dedicated technical or professional skills section."
    );
  }

  if (!educationFound) {
    improvements.push(
      "Add a clearly labeled education section."
    );
  }

  if (!linkedinFound && !githubFound) {
    improvements.push(
      "Add a relevant LinkedIn or GitHub profile when appropriate."
    );
  }

  return {
    atsScore,

    wordCount,

    analysis: {
      contactInformation: {
        score: contactScore,
        maxScore: 15,
        status:
          contactScore >= 11
            ? "strong"
            : "needs-improvement",
      },

      professionalSummary: {
        score: summaryScore,
        maxScore: 10,
        status:
          summaryScore >= 6
            ? "detected"
            : "missing",
      },

      workExperience: {
        score: experienceScore,
        maxScore: 20,
        status:
          experienceScore >= 15
            ? "strong"
            : experienceFound
            ? "detected"
            : "missing",
      },

      education: {
        score: educationScore,
        maxScore: 10,
        status:
          educationFound
            ? "detected"
            : "missing",
      },

      skills: {
        score: skillsScore,
        maxScore: 15,
        status:
          skillsFound
            ? "detected"
            : "missing",
      },

      formatting: {
        score: formattingScore,
        maxScore: 15,
        status:
          formattingScore >= 10
            ? "good"
            : "needs-improvement",
      },

      measurableAchievements: {
        score: achievementScore,
        maxScore: 15,
        status:
          achievementScore >= 10
            ? "strong"
            : "needs-improvement",
      },
    },

    strengths,

    improvements,
  };
}

/* =========================================================
   SAFE RESUME OPTIMIZATION

   This does not invent companies, skills, experience,
   certifications, projects, or qualifications.

   For now it returns the original resume text and improvement
   guidance.

   Later you can connect an LLM API for professional rewriting.
========================================================= */

function createOptimizedResume(resumeText) {
  return normalizeText(resumeText);
}

/* =========================================================
   POST /api/resume-studio/analyze
========================================================= */

async function analyzeMyResume(req, res) {
  try {
    const candidateId = getCandidateId(req);

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const pastedText = normalizeText(
      req.body?.resumeText || ""
    );

    let extractedText = "";

    if (req.file) {
      extractedText = normalizeText(
        await extractResumeText(req.file)
      );
    }

    const resumeText =
      extractedText || pastedText;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message:
          "Upload a resume or paste resume content.",
      });
    }

    if (resumeText.length < 100) {
      return res.status(400).json({
        success: false,
        message:
          "Resume content is too short for meaningful analysis.",
      });
    }

    const result = analyzeResume(resumeText);

    const optimizedResume =
      createOptimizedResume(resumeText);

    const savedAnalysis =
      await ResumeAnalysis.create({
        candidateId,

        originalFileName:
          req.file?.originalname || "",

        sourceType:
          req.file ? "file" : "text",

        resumeText,

        atsScore: result.atsScore,

        analysis: result.analysis,

        strengths: result.strengths,

        improvements: result.improvements,

        optimizedResume,

        status: "analyzed",
      });

    return res.status(200).json({
      success: true,

      message:
        "Resume analyzed successfully.",

      data: {
        id: savedAnalysis._id,

        atsScore:
          savedAnalysis.atsScore,

        wordCount:
          result.wordCount,

        analysis:
          savedAnalysis.analysis,

        strengths:
          savedAnalysis.strengths,

        improvements:
          savedAnalysis.improvements,

        optimizedResume:
          savedAnalysis.optimizedResume,

        originalFileName:
          savedAnalysis.originalFileName,

        createdAt:
          savedAnalysis.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Resume Studio analyze error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to analyze resume.",
    });
  }
}

/* =========================================================
   GET /api/resume-studio/recent
========================================================= */

async function getMyRecentResumes(req, res) {
  try {
    const candidateId = getCandidateId(req);

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const resumes =
      await ResumeAnalysis.find({
        candidateId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(10)
        .select(
          "_id originalFileName sourceType atsScore strengths improvements createdAt"
        )
        .lean();

    return res.status(200).json({
      success: true,

      data: resumes,
    });
  } catch (error) {
    console.error(
      "Get recent resumes error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load recent resumes.",
    });
  }
}

module.exports = {
  analyzeMyResume,
  getMyRecentResumes,
};