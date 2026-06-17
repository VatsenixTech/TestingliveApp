const express = require("express");
const axios = require("axios");

const router = express.Router();

router.post("/resume-analyze", async (req, res) => {
  try {
    const { resumeText, template } = req.body;

    if (!resumeText || !resumeText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Resume text is required",
      });
    }

    const prompt = `
You are an expert ATS resume writer.

Analyze the candidate resume and create an ATS-friendly resume using the SAME candidate content.
Do not create fake experience. Do not add fake company names.
Improve wording, structure, keywords and ATS readability.

Return:
1. ATS score out of 100
2. Missing keywords
3. Resume problems
4. Improved ATS-friendly resume

Template: ${template || "Modern ATS"}

Candidate Resume:
${resumeText}
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.1",
      prompt,
      stream: false,
    });

    return res.json({
      success: true,
      atsScore: 85,
      optimizedResume: response.data.response,
    });
  } catch (error) {
    console.log("OLLAMA RESUME AI ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Local AI resume analysis failed",
      error: error.message,
    });
  }
});

router.post("/skill-analyze", async (req, res) => {
  try {
    const { currentSkills, targetRole } = req.body;

    if (!currentSkills || !currentSkills.trim()) {
      return res.status(400).json({
        success: false,
        message: "Current skills are required",
      });
    }

    const prompt = `
You are an expert career coach and skill gap analyst.

Target Role: ${targetRole || "Software Engineer"}

Candidate Current Skills:
${currentSkills}

Create:
1. Current skill strength
2. Missing skills
3. Priority learning roadmap
4. Projects to build
5. Certifications suggested
6. 30-day learning plan
7. 90-day career roadmap

Make it practical and job-focused.
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.1",
      prompt,
      stream: false,
    });

    return res.json({
      success: true,
      analysis: response.data.response,
    });
  } catch (error) {
    console.log("SKILL AI ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Skill analysis failed",
      error: error.message,
    });
  }
});router.post("/trust-passport", async (req, res) => {
  try {
    const { candidate, localScore } = req.body;

    if (!candidate) {
      return res.status(400).json({
        success: false,
        message: "Candidate data is required",
      });
    }

    const prompt = `
You are an AI recruiter trust analyst.

Analyze candidate credibility based on:
- Resume availability
- Profile image
- Self intro video
- Project proof video
- Skills
- Profile summary
- Experience
- Recruiter confidence

Candidate Data:
${JSON.stringify(candidate, null, 2)}

Local calculated score: ${localScore}

Return:
1. Final trust score out of 100
2. Recruiter confidence rating
3. Strong verification signals
4. Missing trust signals
5. Suggestions to improve profile credibility
6. Whether recruiter should shortlist this candidate

Do not invent fake verification.
`;

    const response = await axios.post("http://localhost:11434/api/generate", {
      model: "llama3.1",
      prompt,
      stream: false,
    });

    return res.json({
      success: true,
      trustScore: localScore,
      analysis: response.data.response,
    });
  } catch (error) {
    console.log("TRUST PASSPORT AI ERROR:", error.message);

    return res.status(500).json({
      success: false,
      message: "Trust passport analysis failed",
      error: error.message,
    });
  }
});
router.post("/salary-predict", async (req, res) => {

  try {

    const {
      role,
      skills,
      experience
    } = req.body;

    const prompt = `
You are a salary prediction expert.

Role:
${role}

Skills:
${skills}

Experience:
${experience} years

Provide:

1. Expected salary in India
2. Average salary
3. Top companies hiring
4. Skills increasing salary
5. Career roadmap
6. High-paying alternatives

`;

    const response = await axios.post(
      "http://localhost:11434/api/generate",
      {
        model: "llama3.1",
        prompt,
        stream: false
      }
    );

    res.json({
      success:true,
      analysis:response.data.response
    });

  } catch (error) {

    console.log(error);

    res.status(500).json({
      success:false
    });

  }

});
module.exports = router;