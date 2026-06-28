const express = require("express");
const CareerRoadmap = require("../models/CareerRoadmap");
const Candidate = require("../models/Candidate");

const router = express.Router();

function buildRoadmapFromProfile({
  candidateId,
  candidate,
  targetRole,
  currentLevel,
  durationMonths,
}) {
  const role = targetRole || candidate?.role || candidate?.currentRole || "Data Engineer";
  const level = currentLevel || "Beginner";
  const months = Number(durationMonths || 12);

  const candidateSkills =
    candidate?.skills ||
    candidate?.technicalSkills ||
    candidate?.profileSkills ||
    [];

  const normalizedSkills = candidateSkills.map((s) =>
    String(s).toLowerCase().trim()
  );

  const roleSkillMap = {
    "Data Engineer": [
      "Python",
      "SQL",
      "Data Structures",
      "Linux",
      "Advanced Python",
      "Database Design",
      "ETL Concepts",
      "Git & GitHub",
      "Apache Spark",
      "Airflow",
      "AWS",
      "Data Lake",
      "Data Warehouse",
      "Kafka",
      "Real-time Processing",
    ],
    "Frontend Developer": [
      "HTML",
      "CSS",
      "JavaScript",
      "React",
      "TypeScript",
      "Redux",
      "API Integration",
      "Testing",
      "Performance Optimization",
      "Next.js",
    ],
    "Backend Developer": [
      "Node.js",
      "Express",
      "MongoDB",
      "SQL",
      "REST API",
      "Authentication",
      "System Design",
      "Docker",
      "Redis",
      "Cloud Deployment",
    ],
    "DevOps Engineer": [
      "Linux",
      "Git",
      "Docker",
      "Kubernetes",
      "CI/CD",
      "AWS",
      "Terraform",
      "Monitoring",
      "Security",
      "Helm",
    ],
    "Data Scientist": [
      "Python",
      "Statistics",
      "Pandas",
      "NumPy",
      "Machine Learning",
      "Feature Engineering",
      "Model Evaluation",
      "Deep Learning",
      "MLOps",
    ],
    "Cybersecurity Analyst": [
      "Networking",
      "Linux",
      "SOC",
      "SIEM",
      "Threat Analysis",
      "Vulnerability Assessment",
      "Incident Response",
      "Cloud Security",
    ],
    "SAP Consultant": [
      "SAP Basics",
      "SAP FICO",
      "SAP MM",
      "SAP SD",
      "Configuration",
      "Support Tickets",
      "Business Process",
      "Documentation",
    ],
  };

  const requiredSkills = roleSkillMap[role] || roleSkillMap["Data Engineer"];

  const skillObjects = requiredSkills.map((skill) => {
    const hasSkill = normalizedSkills.some(
      (s) =>
        s.includes(skill.toLowerCase()) ||
        skill.toLowerCase().includes(s)
    );

    return {
      name: skill,
      progress: 0,
    };
  });

 const overallProgress = 0;

  const chunkSize = Math.ceil(skillObjects.length / 4);

  const stages = [0, 1, 2, 3].map((index) => {
    const skills = skillObjects.slice(index * chunkSize, (index + 1) * chunkSize);

    const stageProgress =
      skills.length > 0
        ? Math.round(
            skills.reduce((sum, s) => sum + s.progress, 0) / skills.length
          )
        : 0;

    return {
      stageNo: index + 1,
      title:
        index === 0
          ? "Fundamentals"
          : index === 1
          ? `Core ${role}`
          : index === 2
          ? "Advanced Tools & Cloud"
          : "Real-world Projects",
      subtitle:
        index === 0
          ? "Build strong foundation for your target role"
          : index === 1
          ? "Learn core technologies and role-specific tools"
          : index === 2
          ? "Master advanced tools used in production"
          : "Build portfolio projects and interview readiness",
      timeline:
        index === 0
          ? `Months 1 - ${Math.ceil(months / 4)}`
          : index === 1
          ? `Months ${Math.ceil(months / 4) + 1} - ${Math.ceil(months / 2)}`
          : index === 2
          ? `Months ${Math.ceil(months / 2) + 1} - ${Math.ceil((months * 3) / 4)}`
          : `Months ${Math.ceil((months * 3) / 4) + 1} - ${months}`,
      status:
        stageProgress === 100
          ? "Completed"
          : stageProgress > 0
          ? "In Progress"
          : "Pending",
      progress: stageProgress,
      skills,
    };
  });

  const nextSkill = skillObjects.find((s) => s.progress < 100);

  return {
    candidateId,
    targetRole: role,
    currentLevel: level,
    durationMonths: months,
    overallProgress,
    nextMilestone: {
      title: nextSkill?.name || "Interview Readiness",
      dueInDays: nextSkill ? 7 : 3,
    },
    stages,
    projects: [
      {
        title: `${role} Portfolio Project`,
        description: `Build one production-ready ${role} project based on your skill gaps.`,
        status: "Pending",
      },
      {
        title: "Resume Proof Project",
        description:
          "Create measurable project proof with architecture, screenshots, metrics and GitHub link.",
        status: "Pending",
      },
      {
        title: "Mock Interview Project Explanation",
        description:
          "Practice explaining your project clearly using business impact and technical decisions.",
        status: "Pending",
      },
    ],
    resources: [
      {
        title: `${role} Official Documentation`,
        provider: "Official Docs",
        rating: 4.8,
        url: "",
      },
      {
        title: `${role} Interview Questions`,
        provider: "NoPromptJobs Question Bank",
        rating: 4.9,
        url: "/ai-interview-prep?tab=Question%20Bank",
      },
      {
        title: `${role} Practice Interview`,
        provider: "Takshvi AI Interviewer",
        rating: 4.9,
        url: "/ai-interview-prep",
      },
    ],
    milestones: [
      {
        title: nextSkill?.name || "Mock Interview",
        dueInDays: 7,
        status: nextSkill ? "In Progress" : "Pending",
      },
      {
        title: "Portfolio Project",
        dueInDays: 21,
        status: "Pending",
      },
      {
        title: "Resume Update",
        dueInDays: 30,
        status: "Pending",
      },
    ],
  };
}

router.get("/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    const roadmap = await CareerRoadmap.findOne({ candidateId });

    if (!roadmap) {
      return res.json({
        success: true,
        roadmap: null,
        message:
          "No career roadmap found. Generate roadmap to create one from candidate profile.",
      });
    }

    res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error("CAREER ROADMAP GET ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.post("/generate", async (req, res) => {
  try {
    const { candidateId, targetRole, currentLevel, durationMonths } = req.body;

    if (!candidateId) {
      return res.status(400).json({ message: "Candidate ID is required" });
    }

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({ message: "Candidate not found" });
    }

    const roadmapData = buildRoadmapFromProfile({
      candidateId,
      candidate,
      targetRole,
      currentLevel,
      durationMonths,
    });

    const roadmap = await CareerRoadmap.findOneAndUpdate(
      { candidateId },
      roadmapData,
      { new: true, upsert: true }
    );

    res.json({
      success: true,
      roadmap,
      message: "Career roadmap generated from candidate profile.",
    });
  } catch (error) {
    console.error("CAREER ROADMAP GENERATE ERROR:", error);
    res.status(500).json({ message: error.message });
  }
});

router.patch("/progress/:roadmapId", async (req, res) => {
  try {
    const { overallProgress } = req.body;

    const roadmap = await CareerRoadmap.findByIdAndUpdate(
      req.params.roadmapId,
      { overallProgress },
      { new: true }
    );

    if (!roadmap) {
      return res.status(404).json({ message: "Roadmap not found" });
    }

    res.json({
      success: true,
      roadmap,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;