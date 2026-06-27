const express = require("express");
const SkillAnalysis = require("../models/SkillAnalysis");

const router = express.Router();

function normalizeSkills(text = "") {
  return text
    .split(/,|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function analyzeSkills(skills, targetRole) {
  const roleMap = {
    "Data Engineer": [
      "Python",
      "SQL",
      "PySpark",
      "Spark",
      "Airflow",
      "Kafka",
      "AWS",
      "Azure",
      "Databricks",
      "Snowflake",
      "ETL",
      "Data Modeling",
      "Docker",
    ],
    "Frontend Developer": [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "Redux",
      "TypeScript",
      "Tailwind",
      "API Integration",
      "Git",
    ],
    "Backend Developer": [
      "Node.js",
      "Express",
      "MongoDB",
      "SQL",
      "REST API",
      "Authentication",
      "Docker",
      "AWS",
    ],
    DevOps: [
      "Linux",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "AWS",
      "Terraform",
      "Monitoring",
      "GitHub Actions",
    ],
    "Data Scientist": [
      "Python",
      "Pandas",
      "NumPy",
      "Machine Learning",
      "Model Evaluation",
      "Feature Engineering",
      "SQL",
    ],
  };

  const required = roleMap[targetRole] || roleMap["Data Engineer"];

  const lowerSkills = skills.map((s) => s.toLowerCase());

  const strongSkills = required.filter((skill) =>
    lowerSkills.some((s) => s.includes(skill.toLowerCase()))
  );

  const missingSkills = required.filter(
    (skill) =>
      !lowerSkills.some((s) => s.includes(skill.toLowerCase()))
  );

  const overallScore = Math.round(
    (strongSkills.length / required.length) * 100
  );

  const improvementSkills = missingSkills.slice(0, 5);

  const roadmap = improvementSkills.map((skill, index) => ({
    title: skill,
    level: index < 2 ? "High Priority" : "Medium Priority",
    duration: index < 2 ? "2 weeks" : "1 week",
    priority: index < 2 ? "High" : "Medium",
  }));

  const careerMatches = [
    {
      role: targetRole,
      match: overallScore,
    },
    {
      role: `Junior ${targetRole}`,
      match: Math.min(overallScore + 12, 98),
    },
    {
      role: `Associate ${targetRole}`,
      match: Math.min(overallScore + 7, 95),
    },
    {
      role: `Senior ${targetRole}`,
      match: Math.max(overallScore - 18, 35),
    },
  ];

  return {
    overallScore,
    strongSkills,
    missingSkills,
    improvementSkills,
    roadmap,
    careerMatches,
    aiInsights:
      overallScore >= 80
        ? `You are strongly aligned for ${targetRole}. Focus on advanced project depth and production-level experience.`
        : overallScore >= 55
        ? `You have a good base for ${targetRole}. Improve the missing skills and build 2 real projects.`
        : `You need a structured roadmap for ${targetRole}. Start with fundamentals, then build practical projects.`,
  };
}

router.post("/analyze", async (req, res) => {
  try {
    const { candidateId, candidateName, targetRole, currentSkills } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    if (!currentSkills) {
      return res.status(400).json({ message: "Current skills are required" });
    }

    const skills = Array.isArray(currentSkills)
      ? currentSkills
      : normalizeSkills(currentSkills);

    const result = analyzeSkills(skills, targetRole || "Data Engineer");

    const saved = await SkillAnalysis.create({
      candidateId,
      candidateName,
      targetRole,
      currentSkills: skills,
      ...result,
    });

    res.status(200).json({
      success: true,
      analysisId: saved._id,
      ...result,
      saved,
    });
  } catch (error) {
    console.error("SKILL ANALYZER ERROR:", error);
    res.status(500).json({
      message: "Skill analysis failed",
      error: error.message,
    });
  }
});

router.get("/latest/:candidateId", async (req, res) => {
  try {
    const latest = await SkillAnalysis.findOne({
      candidateId: req.params.candidateId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, latest });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/history/:candidateId", async (req, res) => {
  try {
    const history = await SkillAnalysis.find({
      candidateId: req.params.candidateId,
    }).sort({ createdAt: -1 });

    res.json({ success: true, history });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/:analysisId", async (req, res) => {
  try {
    await SkillAnalysis.findByIdAndDelete(req.params.analysisId);
    res.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;