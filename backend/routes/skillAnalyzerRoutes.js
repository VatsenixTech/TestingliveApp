const express = require("express");

const router = express.Router();

const {
  testSkillAnalyzer,

  listRoles,

  getRoleSuggestions,

  getMyAnalysis,

  analyzeSkills,

  createRoadmap,

  exportReport,
} = require(
  "../controllers/skillAnalyzerController"
);

/* =========================================================
   TEST

   GET /api/skill-analyzer/test
========================================================= */

router.get(
  "/test",
  testSkillAnalyzer
);

/* =========================================================
   ROLE DISCOVERY

   IMPORTANT:
   Keep these routes BEFORE /candidate/:candidateId
   and other dynamic parameter routes.
========================================================= */

/*
GET /api/skill-analyzer/roles

Examples:

/roles

/roles?search=finance

/roles?department=Human Resources

/roles?search=data&page=1&limit=20
*/

router.get(
  "/roles",
  listRoles
);

/*
GET /api/skill-analyzer/roles/suggestions?search=data
*/

router.get(
  "/roles/suggestions",
  getRoleSuggestions
);

/* =========================================================
   CURRENT CANDIDATE ANALYSIS

   Works with:

   req.user

   OR

   ?candidateId=...
========================================================= */

router.get(
  "/me",
  getMyAnalysis
);

/* =========================================================
   CANDIDATE ANALYSIS BY ID

   GET:

   /api/skill-analyzer/candidate/:candidateId
========================================================= */

router.get(
  "/candidate/:candidateId",
  getMyAnalysis
);

/* =========================================================
   RUN SKILL ANALYSIS

   POST /api/skill-analyzer/analyze

   BODY:

   {
     "candidateId": "...",

     "targetRole": "Data Engineer",

     "skills": [
       "Python",
       "PySpark",
       "SQL",
       "AWS"
     ]
   }
========================================================= */

router.post(
  "/analyze",
  analyzeSkills
);

/* =========================================================
   CREATE CAREER ROADMAP

   POST /api/skill-analyzer/roadmap

   BODY:

   {
     "candidateId": "...",

     "analysisId": "..."
   }
========================================================= */

router.post(
  "/roadmap",
  createRoadmap
);

/* =========================================================
   EXPORT LATEST REPORT

   GET:

   /api/skill-analyzer/report?candidateId=...
========================================================= */

router.get(
  "/report",
  exportReport
);

/* =========================================================
   EXPORT SPECIFIC ANALYSIS

   GET:

   /api/skill-analyzer/export/:analysisId?candidateId=...
========================================================= */

router.get(
  "/export/:analysisId",
  exportReport
);

module.exports = router;