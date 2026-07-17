const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");

const SkillAnalysis = require("../models/SkillAnalysis");
const RoleSkillProfile = require("../models/RoleSkillProfile");
const CareerRoadmap = require("../models/CareerRoadmap");

/* =========================================================
   OPTIONAL AI SERVICE

   IMPORTANT:
   Your application will still start even if aiService.js
   does not exist.

   If aiService exists and exports:
   generateStructuredJSON() OR generateJSON()

   then missing occupations can be generated automatically.
========================================================= */

let generateStructuredJSON = null;

try {
  const aiService = require("../services/aiService");

  generateStructuredJSON =
    aiService.generateStructuredJSON ||
    aiService.generateJSON ||
    null;

  if (generateStructuredJSON) {
    console.log(
      "✅ Skill Analyzer AI role generation enabled"
    );
  } else {
    console.log(
      "⚠️ aiService loaded but no generateStructuredJSON/generateJSON export found"
    );
  }
} catch (error) {
  console.log(
    "⚠️ Skill Analyzer AI role generation disabled:",
    error.message
  );
}

/* =========================================================
   NORMALIZATION HELPERS
========================================================= */

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, "")
    .replace(/\s+/g, " ");
}

function normalizeSkill(value) {
  return normalizeText(value);
}

function uniqueSkills(skills) {
  const map = new Map();

  for (const skill of skills || []) {
    const original = String(skill || "").trim();

    if (!original) {
      continue;
    }

    const normalized = normalizeSkill(original);

    if (normalized && !map.has(normalized)) {
      map.set(normalized, original);
    }
  }

  return [...map.values()];
}

function escapeRegex(value) {
  return String(value || "").replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}

function normalizeStringArray(values) {
  return [
    ...new Set(
      (Array.isArray(values) ? values : [])
        .map(normalizeText)
        .filter(Boolean)
    ),
  ];
}

/* =========================================================
   CANDIDATE HELPERS
========================================================= */

function getCandidateId(req) {
  return (
    req.user?.candidateId ||
    req.user?._id ||
    req.user?.id ||
    req.params?.candidateId ||
    req.query?.candidateId ||
    req.body?.candidateId ||
    null
  );
}

function validateCandidateId(candidateId) {
  if (!candidateId) {
    return "Candidate ID is required";
  }

  if (!mongoose.Types.ObjectId.isValid(candidateId)) {
    return "Invalid candidate ID";
  }

  return null;
}

/* =========================================================
   SCORE HELPERS
========================================================= */

function getStatus(score) {
  if (score >= 80) {
    return "Excellent";
  }

  if (score >= 60) {
    return "Good";
  }

  if (score >= 40) {
    return "Developing";
  }

  return "Needs Work";
}

/* =========================================================
   SAFE SKILL MATCHING

   IMPORTANT:
   Avoid broad includes() matching.

   Example:
   "C" should not match "C++"
   "Java" should not match "JavaScript"
========================================================= */

function skillMatches(candidateSkill, requirement) {
  const candidate = normalizeSkill(candidateSkill);

  if (!candidate) {
    return false;
  }

  const acceptedNames = [
    requirement.name,
    requirement.normalizedName,
    ...(requirement.aliases || []),
  ]
    .map(normalizeSkill)
    .filter(Boolean);

  return acceptedNames.some(
    (acceptedName) => candidate === acceptedName
  );
}

/* =========================================================
   SKILL PROFILE HELPERS
========================================================= */

function validateGeneratedSkill(skill) {
  if (!skill || typeof skill !== "object") {
    return false;
  }

  if (!String(skill.name || "").trim()) {
    return false;
  }

  if (!String(skill.category || "").trim()) {
    return false;
  }

  const weight = Number(skill.weight);

  return (
    Number.isFinite(weight) &&
    weight >= 1 &&
    weight <= 10
  );
}

function sanitizeGeneratedSkill(skill) {
  const priorityValues = [
    "Critical",
    "High",
    "Medium",
    "Low",
  ];

  const name = String(skill.name || "").trim();

  return {
    name,

    normalizedName: normalizeSkill(name),

    category: String(
      skill.category || "Other"
    ).trim(),

    weight: Math.min(
      Math.max(Number(skill.weight || 1), 1),
      10
    ),

    priority: priorityValues.includes(skill.priority)
      ? skill.priority
      : "Medium",

    aliases: normalizeStringArray(skill.aliases),

    description: String(
      skill.description || ""
    ).trim(),
  };
}

/* =========================================================
   FIND ROLE PROFILE

   Resolution order:

   1. Exact normalized role
   2. Alias
   3. Legacy case-insensitive role

   IMPORTANT:
   We do not automatically use partial role matches because:

   Data Analyst != Business Analyst
   Java Developer != JavaScript Developer
========================================================= */

async function findRoleProfile(targetRole) {
  const normalizedRole =
    normalizeText(targetRole);

  if (!normalizedRole) {
    return null;
  }

  /*
   * Exact normalized role.
   */
  let profile =
    await RoleSkillProfile.findOne({
      normalizedRole,
      isActive: true,
    }).lean();

  if (profile) {
    return {
      profile,
      matchType: "EXACT",
    };
  }

  /*
   * Alias match.
   */
  profile =
    await RoleSkillProfile.findOne({
      aliases: normalizedRole,
      isActive: true,
    }).lean();

  if (profile) {
    return {
      profile,
      matchType: "ALIAS",
    };
  }

  /*
   * Support older records that only have role.
   */
  profile =
    await RoleSkillProfile.findOne({
      role: {
        $regex:
          `^${escapeRegex(
            String(
              targetRole
            ).trim()
          )}$`,

        $options: "i",
      },

      isActive: true,
    }).lean();

  if (profile) {
    /*
     * Repair the legacy record automatically.
     */
    await RoleSkillProfile.updateOne(
      {
        _id: profile._id,
      },

      {
        $set: {
          normalizedRole:
            normalizeText(
              profile.role
            ),

          aliases:
            Array.isArray(
              profile.aliases
            )
              ? profile.aliases
              : [],

          department:
            profile.department ||
            "General",

          industry:
            profile.industry ||
            "General",

          jobFamily:
            profile.jobFamily ||
            profile.role,

          sourceType:
            profile.sourceType ||
            "CURATED",

          verificationStatus:
            profile.verificationStatus ||
            "VERIFIED",

          confidenceScore:
            Number.isFinite(
              Number(
                profile.confidenceScore
              )
            )
              ? Number(
                  profile.confidenceScore
                )
              : 90,
        },
      }
    );

    const repairedProfile =
      await RoleSkillProfile.findById(
        profile._id
      ).lean();

    return {
      profile:
        repairedProfile ||
        profile,

      matchType:
        "LEGACY_REPAIRED",
    };
  }

  return null;
}
/* =========================================================
   ROLE SUGGESTIONS
========================================================= */

async function findRoleSuggestions(search, limit = 10) {
  const normalizedSearch = normalizeText(search);

  if (!normalizedSearch) {
    return [];
  }

  const regex = new RegExp(
    escapeRegex(normalizedSearch),
    "i"
  );

  return RoleSkillProfile.find({
    isActive: true,

    $or: [
      {
        role: regex,
      },
      {
        normalizedRole: regex,
      },
      {
        aliases: regex,
      },
      {
        department: regex,
      },
      {
        industry: regex,
      },
      {
        jobFamily: regex,
      },
    ],
  })
    .select(
      "role normalizedRole aliases department industry jobFamily sourceType verificationStatus confidenceScore"
    )
    .sort({
      verificationStatus: 1,
      confidenceScore: -1,
      role: 1,
    })
    .limit(Math.min(Math.max(Number(limit) || 10, 1), 50))
    .lean();
}

/* =========================================================
   DYNAMIC ROLE GENERATION

   If the occupation does not exist:

   AI creates role benchmark
   ↓
   Validate JSON
   ↓
   Store PENDING_REVIEW profile
   ↓
   Use profile for analysis

   IMPORTANT:
   PENDING_REVIEW must never be displayed as VERIFIED.
========================================================= */

/* =========================================================
   DETERMINISTIC FALLBACK ROLE BENCHMARK ENGINE

   PURPOSE

   When:
   - role does not exist in MongoDB
   - AI generation is unavailable
   - AI generation fails

   create a provisional benchmark so analysis can continue.

   IMPORTANT

   These benchmarks are NOT VERIFIED.

   sourceType = FALLBACK_GENERATED
   verificationStatus = PENDING_REVIEW
========================================================= */


/* =========================================================
   CREATE SKILL OBJECT
========================================================= */

function createFallbackSkill(
  name,
  category,
  weight = 5,
  priority = "Medium",
  aliases = [],
  description = ""
) {
  return {
    name: String(name || "").trim(),

    normalizedName:
      normalizeSkill(name),

    category:
      String(category || "Other").trim(),

    weight:
      Math.min(
        Math.max(
          Number(weight || 1),
          1
        ),
        10
      ),

    priority: [
      "Critical",
      "High",
      "Medium",
      "Low",
    ].includes(priority)
      ? priority
      : "Medium",

    aliases:
      normalizeStringArray(aliases),

    description:
      String(description || "").trim(),
  };
}


/* =========================================================
   FALLBACK ROLE LIBRARY

   You can continuously expand this library.

   Exact aliases are resolved before generic department
   fallback is used.
========================================================= */

const FALLBACK_ROLE_LIBRARY = [
  /* =====================================================
     DATA ENGINEERING
  ===================================================== */

  {
    role: "Data Engineer",

    aliases: [
      "data engineer",
      "big data engineer",
      "etl developer",
      "etl engineer",
      "data pipeline engineer",
      "spark developer",
      "pyspark developer",
      "azure data engineer",
      "aws data engineer",
      "gcp data engineer",
    ],

    department:
      "Information Technology",

    industry:
      "General",

    jobFamily:
      "Data Engineering",

    description:
      "Designs, develops, operates, and improves reliable data platforms, pipelines, and processing systems.",

    requiredSkills: [
      createFallbackSkill(
        "SQL",
        "Data Engineering",
        10,
        "Critical",
        [
          "structured query language",
        ]
      ),

      createFallbackSkill(
        "Python",
        "Programming",
        9,
        "Critical",
        [
          "python programming",
        ]
      ),

      createFallbackSkill(
        "Data Modeling",
        "Data Engineering",
        9,
        "Critical",
        [
          "dimensional modeling",
          "database modeling",
        ]
      ),

      createFallbackSkill(
        "ETL",
        "Data Engineering",
        9,
        "Critical",
        [
          "etl pipelines",
          "extract transform load",
        ]
      ),

      createFallbackSkill(
        "Apache Spark",
        "Big Data",
        8,
        "High",
        [
          "spark",
          "pyspark",
        ]
      ),

      createFallbackSkill(
        "Data Warehousing",
        "Data Engineering",
        8,
        "High",
        [
          "data warehouse",
          "dwh",
        ]
      ),

      createFallbackSkill(
        "Cloud Computing",
        "Cloud",
        7,
        "High",
        [
          "aws",
          "azure",
          "gcp",
        ]
      ),

      createFallbackSkill(
        "Apache Airflow",
        "Orchestration",
        7,
        "High",
        [
          "airflow",
          "workflow orchestration",
        ]
      ),

      createFallbackSkill(
        "Git",
        "Engineering Practices",
        5,
        "Medium",
        [
          "github",
          "gitlab",
          "version control",
        ]
      ),

      createFallbackSkill(
        "Data Quality",
        "Data Engineering",
        6,
        "High",
        [
          "data validation",
          "data testing",
        ]
      ),
    ],
  },


  /* =====================================================
     BACKEND DEVELOPMENT
  ===================================================== */

  {
    role: "Backend Developer",

    aliases: [
      "backend developer",
      "back end developer",
      "backend engineer",
      "server side developer",
      "api developer",
      "node js developer",
      "node developer",
      "java backend developer",
      "python backend developer",
    ],

    department:
      "Information Technology",

    industry:
      "General",

    jobFamily:
      "Software Engineering",

    description:
      "Develops server-side applications, APIs, databases, integrations, and production backend systems.",

    requiredSkills: [
      createFallbackSkill(
        "Backend Programming Language",
        "Programming",
        10,
        "Critical",
        [
          "java",
          "python",
          "javascript",
          "typescript",
          "c#",
          "go",
          "golang",
          "php",
          "ruby",
        ]
      ),

      createFallbackSkill(
        "REST APIs",
        "Backend Engineering",
        10,
        "Critical",
        [
          "rest",
          "rest api",
          "restful api",
          "api development",
        ]
      ),

      createFallbackSkill(
        "SQL",
        "Database",
        9,
        "Critical",
        [
          "mysql",
          "postgresql",
          "sql server",
          "oracle sql",
        ]
      ),

      createFallbackSkill(
        "Database Design",
        "Database",
        8,
        "High",
        [
          "database modeling",
          "schema design",
        ]
      ),

      createFallbackSkill(
        "Authentication",
        "Security",
        7,
        "High",
        [
          "jwt",
          "oauth",
          "oauth2",
          "authentication authorization",
        ]
      ),

      createFallbackSkill(
        "Git",
        "Engineering Practices",
        7,
        "High",
        [
          "github",
          "gitlab",
          "version control",
        ]
      ),

      createFallbackSkill(
        "Testing",
        "Software Quality",
        7,
        "High",
        [
          "unit testing",
          "integration testing",
          "api testing",
        ]
      ),

      createFallbackSkill(
        "Docker",
        "DevOps",
        6,
        "Medium",
        [
          "containerization",
          "containers",
        ]
      ),

      createFallbackSkill(
        "Cloud Computing",
        "Cloud",
        6,
        "Medium",
        [
          "aws",
          "azure",
          "gcp",
        ]
      ),

      createFallbackSkill(
        "System Design",
        "Architecture",
        8,
        "High",
        [
          "software architecture",
          "backend architecture",
        ]
      ),
    ],
  },


  /* =====================================================
     FRONTEND DEVELOPMENT
  ===================================================== */

  {
    role: "Frontend Developer",

    aliases: [
      "frontend developer",
      "front end developer",
      "frontend engineer",
      "react developer",
      "angular developer",
      "vue developer",
      "ui developer",
      "web developer",
    ],

    department:
      "Information Technology",

    industry:
      "General",

    jobFamily:
      "Software Engineering",

    description:
      "Develops responsive, accessible, maintainable, and production-ready web interfaces.",

    requiredSkills: [
      createFallbackSkill(
        "HTML",
        "Frontend Engineering",
        9,
        "Critical",
        [
          "html5",
        ]
      ),

      createFallbackSkill(
        "CSS",
        "Frontend Engineering",
        9,
        "Critical",
        [
          "css3",
          "responsive css",
        ]
      ),

      createFallbackSkill(
        "JavaScript",
        "Programming",
        10,
        "Critical",
        [
          "javascript es6",
          "ecmascript",
        ]
      ),

      createFallbackSkill(
        "Frontend Framework",
        "Frontend Engineering",
        9,
        "Critical",
        [
          "react",
          "reactjs",
          "angular",
          "vue",
          "vuejs",
        ]
      ),

      createFallbackSkill(
        "Responsive Design",
        "User Interface",
        8,
        "High",
        [
          "responsive web design",
          "mobile responsive design",
        ]
      ),

      createFallbackSkill(
        "REST APIs",
        "Integration",
        7,
        "High",
        [
          "rest api",
          "api integration",
        ]
      ),

      createFallbackSkill(
        "Git",
        "Engineering Practices",
        7,
        "High",
        [
          "github",
          "gitlab",
          "version control",
        ]
      ),

      createFallbackSkill(
        "Web Accessibility",
        "User Interface",
        6,
        "Medium",
        [
          "accessibility",
          "wcag",
        ]
      ),

      createFallbackSkill(
        "Frontend Testing",
        "Software Quality",
        6,
        "Medium",
        [
          "jest",
          "vitest",
          "cypress",
          "playwright",
        ]
      ),

      createFallbackSkill(
        "Web Performance",
        "Frontend Engineering",
        6,
        "Medium",
        [
          "frontend performance",
          "performance optimization",
        ]
      ),
    ],
  },


  /* =====================================================
     HUMAN RESOURCES
  ===================================================== */

  {
    role: "Human Resources Professional",

    aliases: [
      "human resources",
      "hr",
      "hr executive",
      "hr manager",
      "hr generalist",
      "human resources executive",
      "human resources manager",
      "human resources professional",
    ],

    department:
      "Human Resources",

    industry:
      "General",

    jobFamily:
      "Human Resources",

    description:
      "Supports employee lifecycle management, HR operations, compliance, performance, engagement, and organizational processes.",

    requiredSkills: [
      createFallbackSkill(
        "Recruitment",
        "Talent Acquisition",
        9,
        "Critical",
        [
          "hiring",
          "talent acquisition",
        ]
      ),

      createFallbackSkill(
        "Employee Relations",
        "Human Resources",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "HR Operations",
        "Human Resources",
        8,
        "High",
        [
          "hr administration",
        ]
      ),

      createFallbackSkill(
        "Performance Management",
        "Human Resources",
        8,
        "High",
        [
          "performance appraisal",
        ]
      ),

      createFallbackSkill(
        "HR Policies",
        "Human Resources",
        8,
        "High",
        [
          "hr policy",
          "company policies",
        ]
      ),

      createFallbackSkill(
        "Labor Law",
        "Compliance",
        7,
        "High",
        [
          "employment law",
          "labour law",
        ]
      ),

      createFallbackSkill(
        "HRIS",
        "HR Technology",
        6,
        "Medium",
        [
          "human resources information system",
        ]
      ),

      createFallbackSkill(
        "Communication",
        "Professional Skills",
        8,
        "High"
      ),

      createFallbackSkill(
        "Conflict Resolution",
        "Professional Skills",
        7,
        "High"
      ),

      createFallbackSkill(
        "HR Analytics",
        "Human Resources",
        6,
        "Medium",
        [
          "people analytics",
          "workforce analytics",
        ]
      ),
    ],
  },


  /* =====================================================
     FINANCE
  ===================================================== */

  {
    role: "Finance Professional",

    aliases: [
      "finance",
      "finance executive",
      "finance analyst",
      "financial analyst",
      "finance manager",
      "financial manager",
      "finance professional",
    ],

    department:
      "Finance",

    industry:
      "General",

    jobFamily:
      "Finance",

    description:
      "Supports financial analysis, reporting, budgeting, forecasting, controls, and business decision-making.",

    requiredSkills: [
      createFallbackSkill(
        "Financial Analysis",
        "Finance",
        10,
        "Critical"
      ),

      createFallbackSkill(
        "Financial Reporting",
        "Finance",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Budgeting",
        "Planning",
        8,
        "High"
      ),

      createFallbackSkill(
        "Forecasting",
        "Planning",
        8,
        "High"
      ),

      createFallbackSkill(
        "Microsoft Excel",
        "Finance Tools",
        9,
        "Critical",
        [
          "excel",
          "advanced excel",
        ]
      ),

      createFallbackSkill(
        "Accounting",
        "Accounting",
        8,
        "High"
      ),

      createFallbackSkill(
        "Financial Modeling",
        "Finance",
        8,
        "High"
      ),

      createFallbackSkill(
        "Data Analysis",
        "Analytics",
        7,
        "High"
      ),

      createFallbackSkill(
        "Risk Management",
        "Risk",
        6,
        "Medium"
      ),

      createFallbackSkill(
        "Communication",
        "Professional Skills",
        6,
        "Medium"
      ),
    ],
  },


  /* =====================================================
     ADMINISTRATION
  ===================================================== */

  {
    role: "Administration Professional",

    aliases: [
      "admin",
      "administrator",
      "administration",
      "admin executive",
      "administrative executive",
      "administrative assistant",
      "office administrator",
      "office manager",
    ],

    department:
      "Administration",

    industry:
      "General",

    jobFamily:
      "Administration",

    description:
      "Supports business operations through office administration, documentation, coordination, scheduling, and stakeholder communication.",

    requiredSkills: [
      createFallbackSkill(
        "Office Administration",
        "Administration",
        10,
        "Critical"
      ),

      createFallbackSkill(
        "Documentation",
        "Administration",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Microsoft Office",
        "Business Tools",
        8,
        "High",
        [
          "ms office",
          "office 365",
        ]
      ),

      createFallbackSkill(
        "Communication",
        "Professional Skills",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Scheduling",
        "Administration",
        8,
        "High",
        [
          "calendar management",
        ]
      ),

      createFallbackSkill(
        "Record Management",
        "Administration",
        7,
        "High"
      ),

      createFallbackSkill(
        "Vendor Coordination",
        "Operations",
        6,
        "Medium"
      ),

      createFallbackSkill(
        "Time Management",
        "Professional Skills",
        7,
        "High"
      ),

      createFallbackSkill(
        "Data Entry",
        "Administration",
        6,
        "Medium"
      ),

      createFallbackSkill(
        "Problem Solving",
        "Professional Skills",
        6,
        "Medium"
      ),
    ],
  },
];


/* =========================================================
   FIND FALLBACK ROLE TEMPLATE
========================================================= */

function findFallbackRoleTemplate(
  requestedRole
) {
  const normalizedRequestedRole =
    normalizeText(requestedRole);

  if (!normalizedRequestedRole) {
    return null;
  }

  return (
    FALLBACK_ROLE_LIBRARY.find(
      (template) => {
        const acceptedNames = [
          template.role,
          ...(template.aliases || []),
        ]
          .map(normalizeText)
          .filter(Boolean);

        return acceptedNames.includes(
          normalizedRequestedRole
        );
      }
    ) || null
  );
}


/* =========================================================
   INFER DEPARTMENT FROM ROLE NAME

   Used only when no exact fallback template exists.
========================================================= */

function inferFallbackDepartment(
  requestedRole
) {
  const role =
    normalizeText(requestedRole);


  if (
    /(developer|engineer|software|programmer|data|cloud|devops|cyber|security|database|dba|network|sap|erp|qa|quality assurance|tester|technical support|machine learning|artificial intelligence|ai engineer)/.test(
      role
    )
  ) {
    return {
      department:
        "Information Technology",

      jobFamily:
        "Technology",
    };
  }


  if (
    /(human resources|hr|recruiter|recruitment|talent acquisition|payroll|learning development|employee relations)/.test(
      role
    )
  ) {
    return {
      department:
        "Human Resources",

      jobFamily:
        "Human Resources",
    };
  }


  if (
    /(finance|financial|accountant|accounting|audit|auditor|tax|banking|investment|treasury|credit analyst)/.test(
      role
    )
  ) {
    return {
      department:
        "Finance",

      jobFamily:
        "Finance",
    };
  }


  if (
    /(admin|administration|administrative|office manager|office assistant)/.test(
      role
    )
  ) {
    return {
      department:
        "Administration",

      jobFamily:
        "Administration",
    };
  }


  if (
    /(sales|business development|account executive|sales executive)/.test(
      role
    )
  ) {
    return {
      department:
        "Sales",

      jobFamily:
        "Sales",
    };
  }


  if (
    /(marketing|seo|content marketing|digital marketing|brand|social media)/.test(
      role
    )
  ) {
    return {
      department:
        "Marketing",

      jobFamily:
        "Marketing",
    };
  }


  if (
    /(operations|operation manager|operations manager|business operations)/.test(
      role
    )
  ) {
    return {
      department:
        "Operations",

      jobFamily:
        "Operations",
    };
  }


  if (
    /(customer service|customer support|customer success|support executive)/.test(
      role
    )
  ) {
    return {
      department:
        "Customer Service",

      jobFamily:
        "Customer Service",
    };
  }


  return {
    department:
      "General",

    jobFamily:
      "General Professional",
  };
}


/* =========================================================
   GENERAL PROFESSIONAL SKILLS

   This prevents the API from failing for an unknown role.

   IMPORTANT:
   This is intentionally provisional.
========================================================= */

function buildGeneralFallbackSkills(
  department
) {
  const commonSkills = [
    createFallbackSkill(
      "Communication",
      "Professional Skills",
      8,
      "High"
    ),

    createFallbackSkill(
      "Problem Solving",
      "Professional Skills",
      8,
      "High"
    ),

    createFallbackSkill(
      "Analytical Thinking",
      "Professional Skills",
      7,
      "High"
    ),

    createFallbackSkill(
      "Collaboration",
      "Professional Skills",
      7,
      "High",
      [
        "teamwork",
      ]
    ),

    createFallbackSkill(
      "Time Management",
      "Professional Skills",
      6,
      "Medium"
    ),

    createFallbackSkill(
      "Documentation",
      "Business Skills",
      6,
      "Medium"
    ),

    createFallbackSkill(
      "Stakeholder Management",
      "Business Skills",
      6,
      "Medium"
    ),

    createFallbackSkill(
      "Continuous Learning",
      "Professional Skills",
      5,
      "Medium"
    ),
  ];


  if (
    department ===
    "Information Technology"
  ) {
    return [
      createFallbackSkill(
        "Programming",
        "Technology",
        9,
        "Critical",
        [
          "coding",
          "software development",
        ]
      ),

      createFallbackSkill(
        "Software Development",
        "Technology",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Git",
        "Engineering Practices",
        7,
        "High",
        [
          "github",
          "gitlab",
          "version control",
        ]
      ),

      createFallbackSkill(
        "Testing",
        "Software Quality",
        7,
        "High"
      ),

      createFallbackSkill(
        "Database Fundamentals",
        "Database",
        7,
        "High",
        [
          "sql",
          "database",
        ]
      ),

      createFallbackSkill(
        "Cloud Fundamentals",
        "Cloud",
        6,
        "Medium",
        [
          "aws",
          "azure",
          "gcp",
        ]
      ),

      ...commonSkills,
    ];
  }


  if (
    department ===
    "Human Resources"
  ) {
    return [
      createFallbackSkill(
        "Recruitment",
        "Human Resources",
        8,
        "High"
      ),

      createFallbackSkill(
        "Employee Relations",
        "Human Resources",
        8,
        "High"
      ),

      createFallbackSkill(
        "HR Operations",
        "Human Resources",
        7,
        "High"
      ),

      createFallbackSkill(
        "HR Policies",
        "Human Resources",
        7,
        "High"
      ),

      ...commonSkills,
    ];
  }


  if (
    department ===
    "Finance"
  ) {
    return [
      createFallbackSkill(
        "Financial Analysis",
        "Finance",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Financial Reporting",
        "Finance",
        8,
        "High"
      ),

      createFallbackSkill(
        "Microsoft Excel",
        "Finance Tools",
        8,
        "High",
        [
          "excel",
        ]
      ),

      createFallbackSkill(
        "Accounting Fundamentals",
        "Accounting",
        7,
        "High"
      ),

      ...commonSkills,
    ];
  }


  if (
    department ===
    "Administration"
  ) {
    return [
      createFallbackSkill(
        "Office Administration",
        "Administration",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Microsoft Office",
        "Business Tools",
        8,
        "High",
        [
          "ms office",
        ]
      ),

      createFallbackSkill(
        "Scheduling",
        "Administration",
        7,
        "High"
      ),

      createFallbackSkill(
        "Record Management",
        "Administration",
        7,
        "High"
      ),

      ...commonSkills,
    ];
  }


  if (
    department ===
    "Sales"
  ) {
    return [
      createFallbackSkill(
        "Lead Generation",
        "Sales",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Prospecting",
        "Sales",
        8,
        "High"
      ),

      createFallbackSkill(
        "Negotiation",
        "Sales",
        8,
        "High"
      ),

      createFallbackSkill(
        "CRM",
        "Sales Technology",
        7,
        "High"
      ),

      createFallbackSkill(
        "Sales Closing",
        "Sales",
        9,
        "Critical"
      ),

      ...commonSkills,
    ];
  }


  if (
    department ===
    "Marketing"
  ) {
    return [
      createFallbackSkill(
        "Marketing Strategy",
        "Marketing",
        9,
        "Critical"
      ),

      createFallbackSkill(
        "Market Research",
        "Marketing",
        8,
        "High"
      ),

      createFallbackSkill(
        "Campaign Management",
        "Marketing",
        8,
        "High"
      ),

      createFallbackSkill(
        "Marketing Analytics",
        "Analytics",
        7,
        "High"
      ),

      createFallbackSkill(
        "Content Strategy",
        "Marketing",
        7,
        "High"
      ),

      ...commonSkills,
    ];
  }


  return commonSkills;
}


/* =========================================================
   CREATE AND STORE FALLBACK ROLE PROFILE
========================================================= */

async function createFallbackRoleProfile(
  requestedRole
) {
  const normalizedRequestedRole =
    normalizeText(requestedRole);

  if (!normalizedRequestedRole) {
    throw new Error(
      "Requested occupation is required."
    );
  }


  /*
   * Check DB one more time to avoid duplicates.
   */

  const existingMatch =
    await findRoleProfile(
      requestedRole
    );

  if (existingMatch) {
    return existingMatch.profile;
  }


  /*
   * Look for exact fallback template.
   */

  const template =
    findFallbackRoleTemplate(
      requestedRole
    );


  let canonicalRole;

  let aliases;

  let department;

  let industry;

  let jobFamily;

  let description;

  let requiredSkills;


  if (template) {
    canonicalRole =
      template.role;

    aliases =
      normalizeStringArray([
        requestedRole,

        ...(template.aliases || []),
      ]);

    department =
      template.department;

    industry =
      template.industry ||
      "General";

    jobFamily =
      template.jobFamily ||
      template.role;

    description =
      template.description ||
      "";

    requiredSkills =
      template.requiredSkills;
  } else {
    const inferred =
      inferFallbackDepartment(
        requestedRole
      );

    /*
     * Preserve user's requested occupation.

     * Example:

       SAP FICO Consultant
       Procurement Manager
       React Native Developer

       should not become "General Professional".
    */

    canonicalRole =
      String(
        requestedRole
      ).trim();

    aliases = [];

    department =
      inferred.department;

    industry =
      "General";

    jobFamily =
      inferred.jobFamily;

    description =
      `Provisional occupation benchmark created for ${canonicalRole}.`;

    requiredSkills =
      buildGeneralFallbackSkills(
        department
      );
  }


  const normalizedRole =
    normalizeText(
      canonicalRole
    );


  aliases = [
    normalizedRequestedRole,

    ...aliases,
  ]
    .map(normalizeText)
    .filter(Boolean)
    .filter(
      (alias) =>
        alias !==
        normalizedRole
    );


  const profileData = {
    role:
      canonicalRole,

    normalizedRole,

    aliases:
      [...new Set(aliases)],

    department,

    industry,

    jobFamily,

    seniorityLevels: [],

    description,

    requiredSkills,

    preferredSkills: [],

    /*
     * NEVER mark fallback benchmark VERIFIED.
    */

    sourceType:
      "FALLBACK_GENERATED",

    verificationStatus:
      "PENDING_REVIEW",

    confidenceScore:
      template
        ? 65
        : 40,

    version: 1,

    isActive: true,
  };


  try {
    const existingCanonicalProfile =
      await RoleSkillProfile.findOne({
        normalizedRole,
      });

    if (existingCanonicalProfile) {
      if (
        normalizedRequestedRole !==
          normalizedRole &&
        !(
          existingCanonicalProfile
            .aliases || []
        ).includes(
          normalizedRequestedRole
        )
      ) {
        existingCanonicalProfile
          .aliases
          .push(
            normalizedRequestedRole
          );

        await existingCanonicalProfile
          .save();
      }

      return existingCanonicalProfile
        .toObject();
    }


    const profile =
      await RoleSkillProfile.create(
        profileData
      );


    console.log(
      `✅ FALLBACK ROLE PROFILE CREATED`,
      {
        requestedRole,

        canonicalRole,

        department,

        skillCount:
          requiredSkills.length,
      }
    );


    return profile.toObject();
  } catch (error) {
    /*
     * Handle concurrent duplicate creation.
    */

    if (error?.code === 11000) {
      const duplicate =
        await RoleSkillProfile.findOne({
          normalizedRole,
        }).lean();

      if (duplicate) {
        return duplicate;
      }
    }

    throw error;
  }
}


/* =========================================================
   MODIFIED GENERATE ROLE PROFILE

   REPLACE YOUR CURRENT generateRoleProfile()
   WITH THIS FUNCTION.
========================================================= */

async function generateRoleProfile(
  requestedRole
) {
  const normalizedRequestedRole =
    normalizeText(requestedRole);

  if (!normalizedRequestedRole) {
    throw new Error(
      "Requested occupation is required."
    );
  }


  /*
   * 1. Check MongoDB again.
   */

  const existingMatch =
    await findRoleProfile(
      requestedRole
    );

  if (existingMatch) {
    return {
      profile:
        existingMatch.profile,

      source:
        "DATABASE",
    };
  }


  /*
   * 2. AI is unavailable.

      DO NOT THROW ERROR.

      Create provisional fallback benchmark.
   */

  if (!generateStructuredJSON) {
    console.log(
      `⚠️ AI role generation unavailable. Creating fallback benchmark for "${requestedRole}".`
    );


    const fallbackProfile =
      await createFallbackRoleProfile(
        requestedRole
      );


    return {
      profile:
        fallbackProfile,

      source:
        "FALLBACK_GENERATED",
    };
  }


  /*
   * 3. Attempt AI generation.
   */

  try {
    const systemPrompt = `
You are the occupation intelligence engine for NoPromptJobs.

Create a professional occupation skill benchmark.

SUPPORTED AREAS:

Information Technology
Software Engineering
Data Engineering
Data Science
Artificial Intelligence
Machine Learning
Cloud Computing
DevOps
Cybersecurity
SAP
ERP
Quality Assurance
Technical Support
Human Resources
Recruitment
Talent Acquisition
Payroll
Learning and Development
Finance
Accounting
Banking
Insurance
Audit
Taxation
Investment
Administration
Operations
Sales
Marketing
Digital Marketing
Customer Service
Customer Success
Supply Chain
Procurement
Logistics
Legal
Healthcare
Engineering
Manufacturing
Product Management
Project Management
Program Management
Consulting
Education
Design
Business Analysis

RULES:

1. Resolve requested occupation to canonical title.
2. Generate realistic professional benchmark.
3. Generate 8 to 18 required skills.
4. Generate 3 to 10 preferred skills.
5. Avoid duplicate skills.
6. Do not invent technologies, laws, or certifications.
7. Return valid JSON only.

JSON FORMAT:

{
  "role": "",
  "aliases": [],
  "department": "",
  "industry": "General",
  "jobFamily": "",
  "seniorityLevels": [],
  "description": "",
  "requiredSkills": [
    {
      "name": "",
      "category": "",
      "weight": 1,
      "priority": "Critical",
      "aliases": [],
      "description": ""
    }
  ],
  "preferredSkills": []
}
`;


    const generated =
      await generateStructuredJSON({
        systemPrompt,

        userPrompt:
          `Create an occupation benchmark for "${requestedRole}".`,
      });


    if (
      !generated ||
      typeof generated !==
        "object"
    ) {
      throw new Error(
        "AI returned invalid occupation profile."
      );
    }


    const generatedRole =
      String(
        generated.role || ""
      ).trim();


    if (!generatedRole) {
      throw new Error(
        "AI profile does not contain role."
      );
    }


    const requiredSkills =
      (
        Array.isArray(
          generated.requiredSkills
        )
          ? generated.requiredSkills
          : []
      )
        .filter(
          validateGeneratedSkill
        )
        .map(
          sanitizeGeneratedSkill
        );


    if (
      requiredSkills.length < 5
    ) {
      throw new Error(
        "AI profile does not contain enough valid required skills."
      );
    }


    const preferredSkills =
      (
        Array.isArray(
          generated.preferredSkills
        )
          ? generated.preferredSkills
          : []
      )
        .filter(
          validateGeneratedSkill
        )
        .map(
          sanitizeGeneratedSkill
        );


    const canonicalNormalizedRole =
      normalizeText(
        generatedRole
      );


    const aliases =
      normalizeStringArray([
        requestedRole,

        ...(generated.aliases || []),
      ])
        .filter(
          (alias) =>
            alias !==
            canonicalNormalizedRole
        );


    const profileData = {
      role:
        generatedRole,

      normalizedRole:
        canonicalNormalizedRole,

      aliases,

      department:
        String(
          generated.department ||
          "General"
        ).trim(),

      industry:
        String(
          generated.industry ||
          "General"
        ).trim(),

      jobFamily:
        String(
          generated.jobFamily ||
          generatedRole
        ).trim(),

      seniorityLevels:
        Array.isArray(
          generated.seniorityLevels
        )
          ? generated
              .seniorityLevels
              .map(
                (item) =>
                  String(item).trim()
              )
              .filter(Boolean)
          : [],

      description:
        String(
          generated.description ||
          ""
        ).trim(),

      requiredSkills,

      preferredSkills,

      sourceType:
        "AI_GENERATED",

      verificationStatus:
        "PENDING_REVIEW",

      confidenceScore: 70,

      version: 1,

      isActive: true,
    };


    let profile;


    try {
      profile =
        await RoleSkillProfile.create(
          profileData
        );
    } catch (error) {
      if (error?.code === 11000) {
        profile =
          await RoleSkillProfile.findOne({
            normalizedRole:
              canonicalNormalizedRole,
          });

        if (profile) {
          return {
            profile:
              profile.toObject(),

            source:
              "AI_GENERATED",
          };
        }
      }

      throw error;
    }


    console.log(
      `🤖 AI ROLE PROFILE CREATED`,
      {
        requestedRole,

        generatedRole,

        skillCount:
          requiredSkills.length,
      }
    );


    return {
      profile:
        profile.toObject(),

      source:
        "AI_GENERATED",
    };
  } catch (aiError) {
    /*
     * AI failure must not break analysis.
    */

    console.error(
      `⚠️ AI role generation failed for "${requestedRole}". Using fallback benchmark:`,
      aiError.message
    );


    const fallbackProfile =
      await createFallbackRoleProfile(
        requestedRole
      );


    return {
      profile:
        fallbackProfile,

      source:
        "FALLBACK_GENERATED",
    };
  }
}


/* =========================================================
   MODIFIED RESOLVE ROLE PROFILE

   REPLACE YOUR CURRENT resolveRoleProfile()
   WITH THIS FUNCTION.
========================================================= */

async function resolveRoleProfile(
  targetRole
) {
  /*
   * 1. Exact / Alias / Legacy.
   */

  const existingMatch =
    await findRoleProfile(
      targetRole
    );


  if (existingMatch) {
    return {
      profile:
        existingMatch.profile,

      generated: false,

      matchType:
        existingMatch.matchType,
    };
  }


  /*
   * 2. AI or fallback generation.
   */

  const generatedResult =
    await generateRoleProfile(
      targetRole
    );


  if (
    !generatedResult ||
    !generatedResult.profile
  ) {
    throw new Error(
      `Unable to create occupation benchmark for "${targetRole}".`
    );
  }


  return {
    profile:
      generatedResult.profile,

    generated: true,

    matchType:
      generatedResult.source ===
      "AI_GENERATED"
        ? "AI_GENERATED"
        : "FALLBACK_GENERATED",
  };
}
/* =========================================================
   RESOLVE ROLE

   Exact → Alias → Legacy → AI Generation
========================================================= */

/* =========================================================
   REAL WEIGHTED ANALYSIS
========================================================= */

function calculateAnalysis(
  candidateSkills,
  roleProfile
) {
  const requirements = Array.isArray(
    roleProfile.requiredSkills
  )
    ? roleProfile.requiredSkills
    : [];

  if (requirements.length === 0) {
    throw new Error(
      `Role profile "${roleProfile.role}" has no required skills.`
    );
  }

  const totalWeight =
    requirements.reduce(
      (sum, item) =>
        sum +
        Number(item.weight || 1),
      0
    );

  const matched = [];
  const missing = [];

  for (const requirement of requirements) {
    const found = candidateSkills.find(
      (candidateSkill) =>
        skillMatches(
          candidateSkill,
          requirement
        )
    );

    const normalizedRequirement = {
      name:
        requirement.name,

      category:
        requirement.category ||
        "Other",

      weight:
        Number(
          requirement.weight || 1
        ),

      priority:
        requirement.priority ||
        "Medium",
    };

    if (found) {
      matched.push(
        normalizedRequirement
      );
    } else {
      missing.push(
        normalizedRequirement
      );
    }
  }

  const matchedWeight =
    matched.reduce(
      (sum, item) =>
        sum + item.weight,
      0
    );

  const overallScore =
    totalWeight > 0
      ? Math.round(
          (
            matchedWeight /
            totalWeight
          ) * 100
        )
      : 0;

  const strongSkills = [...matched]
    .sort(
      (a, b) =>
        b.weight - a.weight
    )
    .map((item) => ({
      name: item.name,

      category:
        item.category,

      score: Math.min(
        100,
        65 +
          item.weight * 3
      ),

      priority:
        item.priority,
    }));

  const improvementSkills = [
    ...missing,
  ]
    .sort(
      (a, b) =>
        b.weight - a.weight
    )
    .map((item) => ({
      name: item.name,

      category:
        item.category,

      score: 0,

      priority:
        item.priority,
    }));

  const matchedNames = new Set(
    matched.map((item) =>
      normalizeSkill(item.name)
    )
  );

  const categoryMap =
    new Map();

  for (const requirement of requirements) {
    const category =
      requirement.category ||
      "Other";

    const current =
      categoryMap.get(category) || {
        matchedWeight: 0,
        totalWeight: 0,
      };

    const weight = Number(
      requirement.weight || 1
    );

    current.totalWeight += weight;

    if (
      matchedNames.has(
        normalizeSkill(
          requirement.name
        )
      )
    ) {
      current.matchedWeight += weight;
    }

    categoryMap.set(
      category,
      current
    );
  }

  const categoryBreakdown = [
    ...categoryMap.entries(),
  ]
    .map(
      ([category, values]) => ({
        category,

        score:
          values.totalWeight > 0
            ? Math.round(
                (
                  values.matchedWeight /
                  values.totalWeight
                ) * 100
              )
            : 0,
      })
    )
    .sort(
      (a, b) =>
        b.score - a.score
    );

  const recommendations =
    improvementSkills
      .slice(0, 8)
      .map((skill) => ({
        title:
          `Build ${skill.name}`,

        description:
          `${skill.name} is a ${String(
            skill.priority
          ).toLowerCase()} priority requirement for ${roleProfile.role}.`,

        priority:
          skill.priority,
      }));

  return {
    overallScore,

    status:
      getStatus(overallScore),

    strongSkills,

    improvementSkills,

    categoryBreakdown,

    recommendations,
  };
}

/* =========================================================
   CAREER MATCHES

   IMPORTANT:
   Career matches only use stored role benchmarks.

   AI is NOT called repeatedly for career matches.
========================================================= */

async function buildCareerMatches(
  candidateSkills,
  selectedRole
) {
  const profiles =
    await RoleSkillProfile.find({
      isActive: true,

      "requiredSkills.0": {
        $exists: true,
      },
    })
      .select(
        "role requiredSkills verificationStatus sourceType"
      )
      .lean();

  return profiles
    .map((profile) => {
      try {
        const result =
          calculateAnalysis(
            candidateSkills,
            profile
          );

        return {
          role:
            profile.role,

          score:
            result.overallScore,

          verificationStatus:
            profile.verificationStatus,

          sourceType:
            profile.sourceType,
        };
      } catch (error) {
        return null;
      }
    })
    .filter(Boolean)
    .filter(
      (match) =>
        normalizeText(match.role) !==
        normalizeText(selectedRole)
    )
    .sort(
      (a, b) =>
        b.score - a.score
    )
    .slice(0, 6);
}

/* =========================================================
   SUMMARY
========================================================= */

function buildSummary(
  targetRole,
  result,
  roleProfile
) {
  const strengthCount =
    result.strongSkills.length;

  const gapCount =
    result.improvementSkills.length;

  const benchmarkText =
    roleProfile.verificationStatus ===
    "VERIFIED"
      ? "verified role benchmark"
      : "AI-generated role benchmark pending review";

  if (result.overallScore >= 80) {
    return (
      `Your current skills show strong readiness for ${targetRole} against the ${benchmarkText}. ` +
      `You matched ${strengthCount} required skills. ` +
      `Focus on the remaining ${gapCount} gaps to strengthen your readiness further.`
    );
  }

  if (result.overallScore >= 60) {
    return (
      `You have a good foundation for ${targetRole} against the ${benchmarkText}. ` +
      `${strengthCount} requirements matched your submitted skills, while ${gapCount} requirements need development.`
    );
  }

  if (result.overallScore >= 40) {
    return (
      `You are developing toward ${targetRole}. ` +
      `The analysis found ${strengthCount} matched skills and ${gapCount} gaps against the ${benchmarkText}. ` +
      `Focus first on Critical and High priority requirements.`
    );
  }

  return (
    `Your current submitted skills are not yet strongly aligned with ${targetRole}. ` +
    `The score was calculated against the ${benchmarkText}. ` +
    `The analysis identified ${strengthCount} matched requirements and ${gapCount} skill gaps.`
  );
}

/* =========================================================
   LATEST ANALYSIS + HISTORY
========================================================= */

async function getLatestWithHistory(
  candidateId
) {
  const latest =
    await SkillAnalysis.findOne({
      candidateId,
    })
      .sort({
        createdAt: -1,
      })
      .lean();

  if (!latest) {
    return null;
  }

  const recentAnalyses =
    await SkillAnalysis.find({
      candidateId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(5)
      .select(
        "_id targetRole overallScore status createdAt"
      )
      .lean();

  return {
    ...latest,

    recentAnalyses,

    lastAnalyzedAt:
      latest.updatedAt ||
      latest.createdAt,
  };
}

/* =========================================================
   TEST ENDPOINT

   GET /api/skill-analyzer/test
========================================================= */

exports.testSkillAnalyzer = async (
  req,
  res
) => {
  return res.status(200).json({
    success: true,

    message:
      "Skill Analyzer API is working",

    aiRoleGenerationEnabled:
      Boolean(
        generateStructuredJSON
      ),
  });
};

/* =========================================================
   LIST ROLES

   GET /api/skill-analyzer/roles

   Examples:

   ?search=finance
   ?department=Human Resources
   ?page=1&limit=50
========================================================= */

exports.listRoles = async (
  req,
  res
) => {
  try {
    const {
      department,
      search,
    } = req.query;

    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(
        Number(req.query.limit) || 50,
        1
      ),
      100
    );

    const query = {
      isActive: true,
    };

    if (
      String(department || "").trim()
    ) {
      query.department = {
        $regex:
          `^${escapeRegex(
            String(department).trim()
          )}$`,

        $options: "i",
      };
    }

    if (
      String(search || "").trim()
    ) {
      const regex = new RegExp(
        escapeRegex(
          String(search).trim()
        ),
        "i"
      );

      query.$or = [
        {
          role: regex,
        },
        {
          normalizedRole: regex,
        },
        {
          aliases: regex,
        },
        {
          department: regex,
        },
        {
          industry: regex,
        },
        {
          jobFamily: regex,
        },
      ];
    }

    const [
      roles,
      total,
    ] = await Promise.all([
      RoleSkillProfile.find(query)
        .select(
          "role normalizedRole aliases department industry jobFamily seniorityLevels description sourceType verificationStatus confidenceScore version"
        )
        .sort({
          department: 1,
          role: 1,
        })
        .skip(
          (page - 1) *
            limit
        )
        .limit(limit)
        .lean(),

      RoleSkillProfile.countDocuments(
        query
      ),
    ]);

    return res.status(200).json({
      success: true,

      roles,

      pagination: {
        page,
        limit,
        total,

        pages:
          Math.ceil(
            total / limit
          ),
      },
    });
  } catch (error) {
    console.error(
      "List roles error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load occupations",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   ROLE SUGGESTIONS

   GET /api/skill-analyzer/roles/suggestions?search=data
========================================================= */

exports.getRoleSuggestions = async (
  req,
  res
) => {
  try {
    const search = String(
      req.query.search || ""
    ).trim();

    if (search.length < 2) {
      return res.status(200).json({
        success: true,

        suggestions: [],
      });
    }

    const suggestions =
      await findRoleSuggestions(
        search,
        10
      );

    return res.status(200).json({
      success: true,

      suggestions,
    });
  } catch (error) {
    console.error(
      "Role suggestions error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load role suggestions",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   GET CURRENT CANDIDATE ANALYSIS

   GET /api/skill-analyzer/me?candidateId=...
   GET /api/skill-analyzer/candidate/:candidateId
========================================================= */

exports.getMyAnalysis = async (
  req,
  res
) => {
  try {
    const candidateId =
      getCandidateId(req);

    const validationError =
      validateCandidateId(
        candidateId
      );

    if (validationError) {
      return res.status(400).json({
        success: false,

        message:
          validationError,
      });
    }

    const analysis =
      await getLatestWithHistory(
        candidateId
      );

    if (!analysis) {
      return res.status(404).json({
        success: false,

        message:
          "No skill analysis found",
      });
    }

    return res.status(200).json({
      success: true,

      analysis,
    });
  } catch (error) {
    console.error(
      "Get skill analysis error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to load skill analysis",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   ANALYZE SKILLS

   POST /api/skill-analyzer/analyze
========================================================= */

exports.analyzeSkills = async (req, res) => {
  try {
    /* =====================================================
       1. GET AND VALIDATE CANDIDATE ID
    ===================================================== */

    const candidateId = getCandidateId(req);

    const validationError =
      validateCandidateId(candidateId);

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    /* =====================================================
       2. READ REQUEST BODY
    ===================================================== */

    const {
      targetRole,
      skills,
    } = req.body || {};

    const requestedRole =
      String(targetRole || "").trim();

    if (!requestedRole) {
      return res.status(400).json({
        success: false,
        message: "Target role is required",
      });
    }

    /* =====================================================
       3. NORMALIZE CANDIDATE SKILLS
    ===================================================== */

    const candidateSkills = uniqueSkills(
      Array.isArray(skills)
        ? skills
        : []
    );

    if (candidateSkills.length === 0) {
      return res.status(400).json({
        success: false,

        message:
          "At least one current skill is required",
      });
    }

    console.log(
      `🔍 Skill analysis requested`,
      {
        candidateId,
        requestedRole,
        candidateSkillCount:
          candidateSkills.length,
      }
    );

    /* =====================================================
       4. RESOLVE OCCUPATION BENCHMARK

       Resolution pipeline:

       1. Exact MongoDB role
       2. Alias match
       3. High-confidence fuzzy match
       4. AI-generated benchmark
       5. Deterministic fallback benchmark
    ===================================================== */

    let roleResolution;

    try {
      roleResolution =
        await resolveRoleProfile(
          requestedRole
        );
    } catch (resolutionError) {
      console.error(
        `❌ ROLE RESOLUTION FAILED FOR "${requestedRole}":`,
        resolutionError
      );

      return res.status(422).json({
        success: false,

        message:
          `Unable to resolve an occupation benchmark for "${requestedRole}".`,

        error:
          process.env.NODE_ENV ===
          "development"
            ? resolutionError.message
            : undefined,
      });
    }

    /* =====================================================
       5. EXTRACT ROLE PROFILE
    ===================================================== */

    const roleProfile =
      roleResolution?.profile;

    const roleMatchType =
      roleResolution?.matchType ||
      "UNKNOWN";

    const generated =
      Boolean(
        roleResolution?.generated
      );

    /* =====================================================
       6. VALIDATE RESOLVED ROLE PROFILE
    ===================================================== */

    if (!roleProfile) {
      return res.status(422).json({
        success: false,

        message:
          `Occupation resolution returned no benchmark for "${requestedRole}".`,
      });
    }

    if (
      !Array.isArray(
        roleProfile.requiredSkills
      )
    ) {
      return res.status(422).json({
        success: false,

        message:
          `Occupation benchmark "${roleProfile.role || requestedRole}" has an invalid requiredSkills structure.`,
      });
    }

    if (
      roleProfile.requiredSkills.length ===
      0
    ) {
      return res.status(422).json({
        success: false,

        message:
          `Occupation benchmark "${roleProfile.role || requestedRole}" contains no required skills.`,
      });
    }

    const resolvedRole =
      String(
        roleProfile.role ||
        requestedRole
      ).trim();

    const sourceType =
      String(
        roleProfile.sourceType ||
        "UNKNOWN"
      );

    const verificationStatus =
      String(
        roleProfile.verificationStatus ||
        "PENDING_REVIEW"
      );

    const benchmarkConfidence =
      Number.isFinite(
        Number(
          roleProfile.confidenceScore
        )
      )
        ? Number(
            roleProfile.confidenceScore
          )
        : 0;

    console.log(
      `✅ ROLE RESOLVED`,
      {
        requestedRole,
        resolvedRole,
        matchType:
          roleMatchType,
        sourceType,
        verificationStatus,
        benchmarkConfidence,
        benchmarkSkillCount:
          roleProfile
            .requiredSkills
            .length,
      }
    );

    /* =====================================================
       7. CALCULATE REAL SKILL ANALYSIS
    ===================================================== */

    let result;

    try {
      result =
        calculateAnalysis(
          candidateSkills,
          roleProfile
        );
    } catch (calculationError) {
      console.error(
        `❌ SKILL CALCULATION FAILED:`,
        calculationError
      );

      return res.status(422).json({
        success: false,

        message:
          `Unable to calculate skill analysis for "${resolvedRole}".`,

        error:
          process.env.NODE_ENV ===
          "development"
            ? calculationError.message
            : undefined,
      });
    }

    /* =====================================================
       8. VALIDATE CALCULATION RESULT
    ===================================================== */

    if (
      !result ||
      typeof result !== "object"
    ) {
      return res.status(422).json({
        success: false,

        message:
          "Skill analysis engine returned an invalid result.",
      });
    }

    const overallScore =
      Number(
        result.overallScore
      );

    if (
      !Number.isFinite(
        overallScore
      )
    ) {
      return res.status(422).json({
        success: false,

        message:
          "Skill analysis engine returned an invalid overall score.",
      });
    }

    /*
     * Protect database and frontend
     * against scores outside 0-100.
     */

    const safeOverallScore =
      Math.max(
        0,
        Math.min(
          100,
          Math.round(
            overallScore
          )
        )
      );

    /* =====================================================
       9. BUILD CAREER MATCHES

       Career match failure should NOT destroy
       the completed skill analysis.
    ===================================================== */

    let careerMatches = [];

    try {
      const generatedCareerMatches =
        await buildCareerMatches(
          candidateSkills,
          resolvedRole
        );

      careerMatches =
        Array.isArray(
          generatedCareerMatches
        )
          ? generatedCareerMatches
          : [];
    } catch (careerMatchError) {
      console.error(
        "⚠️ Career match generation failed:",
        careerMatchError.message
      );

      careerMatches = [];
    }

    /* =====================================================
       10. BUILD SUMMARY
    ===================================================== */

    let summary;

    try {
      summary =
        buildSummary(
          resolvedRole,
          {
            ...result,

            overallScore:
              safeOverallScore,
          },
          roleProfile
        );
    } catch (summaryError) {
      console.error(
        "⚠️ Summary generation failed:",
        summaryError.message
      );

      summary =
        `Skill analysis completed for ${resolvedRole}. ` +
        `Your current career readiness score is ${safeOverallScore}%.`;
    }

    /* =====================================================
       11. SANITIZE RESULT ARRAYS
    ===================================================== */

    const strongSkills =
      Array.isArray(
        result.strongSkills
      )
        ? result.strongSkills
        : [];

    const improvementSkills =
      Array.isArray(
        result.improvementSkills
      )
        ? result.improvementSkills
        : [];

    const categoryBreakdown =
      Array.isArray(
        result.categoryBreakdown
      )
        ? result.categoryBreakdown
        : [];

    const recommendations =
      Array.isArray(
        result.recommendations
      )
        ? result.recommendations
        : [];

    /* =====================================================
       12. DETERMINE ANALYSIS STATUS
    ===================================================== */

    const analysisStatus =
      String(
        result.status ||
        (
          safeOverallScore >= 80
            ? "Excellent"
            : safeOverallScore >= 65
            ? "Strong"
            : safeOverallScore >= 45
            ? "Developing"
            : "Needs Work"
        )
      );

    /* =====================================================
       13. CREATE DATABASE PAYLOAD

       IMPORTANT:

       roleResolution is intentionally NOT
       stored here because your existing
       SkillAnalysis schema may not support it.

       You can add it later after updating
       your Mongoose schema.
    ===================================================== */

    const analysisPayload = {
      candidateId,

      targetRole:
        resolvedRole,

      currentSkills:
        candidateSkills,

      overallScore:
        safeOverallScore,

      status:
        analysisStatus,

      summary,

      skillsAnalyzed:
        roleProfile
          .requiredSkills
          .length,

      strongSkills,

      improvementSkills,

      categoryBreakdown,

      recommendations,

      careerMatches,

      roleProfileId:
        roleProfile._id ||
        undefined,

      calculationVersion:
        String(
          roleProfile.version ||
          "1"
        ),
    };

    /* =====================================================
       14. SAVE ANALYSIS
    ===================================================== */

    let analysis;

    try {
      analysis =
        await SkillAnalysis.create(
          analysisPayload
        );
    } catch (databaseError) {
      console.error(
        "❌ SKILL ANALYSIS SAVE FAILED:",
        databaseError
      );

      return res.status(500).json({
        success: false,

        message:
          "Skill analysis was calculated but could not be saved.",

        error:
          process.env.NODE_ENV ===
          "development"
            ? databaseError.message
            : undefined,
      });
    }

    console.log(
      `✅ SKILL ANALYSIS SAVED`,
      {
        analysisId:
          analysis._id,

        candidateId,

        requestedRole,

        resolvedRole,

        overallScore:
          safeOverallScore,

        strongSkillCount:
          strongSkills.length,

        improvementSkillCount:
          improvementSkills.length,

        careerMatchCount:
          careerMatches.length,
      }
    );

    /* =====================================================
       15. GET RESPONSE ANALYSIS WITH HISTORY

       IMPORTANT:

       If history retrieval fails, return
       the newly created analysis.

       Never fail the completed request
       because history loading failed.
    ===================================================== */

    let responseAnalysis =
      analysis;

    try {
      const latestWithHistory =
        await getLatestWithHistory(
          candidateId
        );

      /*
       * Only use the enriched response when
       * a valid object was returned.
       */

      if (
        latestWithHistory &&
        typeof latestWithHistory ===
          "object"
      ) {
        responseAnalysis =
          latestWithHistory;
      }
    } catch (historyError) {
      console.error(
        "⚠️ Unable to load analysis history:",
        historyError.message
      );

      responseAnalysis =
        analysis;
    }

    /* =====================================================
       16. DETERMINE BENCHMARK QUALITY

       This is important for a genuine SaaS
       product.

       A fallback-generated benchmark should
       NOT be displayed as fully verified.
    ===================================================== */

    const isVerifiedBenchmark =
      verificationStatus ===
      "VERIFIED";

    const isProvisionalBenchmark =
      sourceType ===
        "FALLBACK_GENERATED" ||
      sourceType ===
        "AI_GENERATED" ||
      verificationStatus ===
        "PENDING_REVIEW";

    let benchmarkLabel;

    if (isVerifiedBenchmark) {
      benchmarkLabel =
        "Verified Skill Intelligence";
    } else if (
      sourceType ===
      "AI_GENERATED"
    ) {
      benchmarkLabel =
        "AI-Generated Skill Intelligence";
    } else if (
      sourceType ===
      "FALLBACK_GENERATED"
    ) {
      benchmarkLabel =
        "Provisional Skill Intelligence";
    } else {
      benchmarkLabel =
        "Skill Intelligence";
    }

    /* =====================================================
       17. SEND FINAL RESPONSE
    ===================================================== */

    return res.status(201).json({
      success: true,

      message:
        "Skill analysis completed successfully",

      roleResolution: {
        requestedRole,

        resolvedRole,

        department:
          roleProfile.department ||
          "General",

        industry:
          roleProfile.industry ||
          "General",

        jobFamily:
          roleProfile.jobFamily ||
          resolvedRole,

        sourceType,

        verificationStatus,

        confidenceScore:
          benchmarkConfidence,

        generated,

        matchType:
          roleMatchType,

        benchmarkSkillCount:
          roleProfile
            .requiredSkills
            .length,

        isVerifiedBenchmark,

        isProvisionalBenchmark,

        benchmarkLabel,
      },

      analysis:
        responseAnalysis,
    });
  } catch (error) {
    console.error(
      "❌ UNEXPECTED ANALYZE SKILLS ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to analyze skills",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};
/* =========================================================
   CREATE ROADMAP

   POST /api/skill-analyzer/roadmap
========================================================= */

exports.createRoadmap = async (
  req,
  res
) => {
  try {
    const candidateId =
      getCandidateId(req);

    const validationError =
      validateCandidateId(
        candidateId
      );

    if (validationError) {
      return res.status(400).json({
        success: false,

        message:
          validationError,
      });
    }

    const {
      analysisId,
    } = req.body;

    let analysis = null;

    if (
      analysisId &&
      mongoose.Types.ObjectId.isValid(
        analysisId
      )
    ) {
      analysis =
        await SkillAnalysis.findOne({
          _id:
            analysisId,

          candidateId,
        });
    }

    if (!analysis) {
      analysis =
        await SkillAnalysis.findOne({
          candidateId,
        }).sort({
          createdAt: -1,
        });
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,

        message:
          "Run a skill analysis before creating a roadmap",
      });
    }

    const items = (
      analysis.improvementSkills ||
      []
    ).map((skill) => ({
      skill:
        skill.name,

      priority:
        skill.priority,

      recommendedWeeks:
        skill.priority ===
        "Critical"
          ? 4
          : skill.priority ===
            "High"
          ? 3
          : skill.priority ===
            "Medium"
          ? 2
          : 1,
    }));

    const roadmap =
      await CareerRoadmap.create({
        candidateId,

        analysisId:
          analysis._id,

        targetRole:
          analysis.targetRole,

        items,
      });

    return res.status(201).json({
      success: true,

      message:
        "Career roadmap created",

      roadmap,
    });
  } catch (error) {
    console.error(
      "Create roadmap error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to create career roadmap",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   EXPORT PDF REPORT

   GET /api/skill-analyzer/report?candidateId=...

   OR

   GET /api/skill-analyzer/export/:analysisId?candidateId=...
========================================================= */

exports.exportReport = async (
  req,
  res
) => {
  try {
    const candidateId =
      getCandidateId(req);

    const validationError =
      validateCandidateId(
        candidateId
      );

    if (validationError) {
      return res.status(400).json({
        success: false,

        message:
          validationError,
      });
    }

    const analysisId =
      req.params?.analysisId;

    let analysis = null;

    if (
      analysisId &&
      mongoose.Types.ObjectId.isValid(
        analysisId
      )
    ) {
      analysis =
        await SkillAnalysis.findOne({
          _id:
            analysisId,

          candidateId,
        }).lean();
    }

    if (!analysis) {
      analysis =
        await SkillAnalysis.findOne({
          candidateId,
        })
          .sort({
            createdAt: -1,
          })
          .lean();
    }

    if (!analysis) {
      return res.status(404).json({
        success: false,

        message:
          "No skill analysis found",
      });
    }

    const document =
      new PDFDocument({
        margin: 48,
      });

    res.setHeader(
      "Content-Type",
      "application/pdf"
    );

    res.setHeader(
      "Content-Disposition",
      'attachment; filename="skill-analysis-report.pdf"'
    );

    document.pipe(res);

    document
      .fontSize(22)
      .text(
        "NoPromptJobs Skill Analysis Report"
      );

    document.moveDown(0.5);

    document
      .fontSize(12)
      .text(
        `Target Role: ${analysis.targetRole}`
      );

    document.text(
      `Overall Score: ${analysis.overallScore}%`
    );

    document.text(
      `Status: ${analysis.status}`
    );

    document.text(
      `Generated: ${new Date(
        analysis.createdAt
      ).toLocaleString("en-IN")}`
    );

    document.moveDown();

    document
      .fontSize(15)
      .text("Summary");

    document
      .fontSize(11)
      .text(
        analysis.summary ||
          "No summary available."
      );

    document.moveDown();

    document
      .fontSize(15)
      .text("Strong Skills");

    const strongSkills =
      analysis.strongSkills ||
      [];

    if (
      strongSkills.length === 0
    ) {
      document
        .fontSize(11)
        .text(
          "No strong skills identified."
        );
    } else {
      strongSkills.forEach(
        (skill) => {
          document
            .fontSize(11)
            .text(
              `• ${skill.name} (${skill.category})`
            );
        }
      );
    }

    document.moveDown();

    document
      .fontSize(15)
      .text("Skill Gaps");

    const improvementSkills =
      analysis.improvementSkills ||
      [];

    if (
      improvementSkills.length === 0
    ) {
      document
        .fontSize(11)
        .text(
          "No skill gaps identified."
        );
    } else {
      improvementSkills.forEach(
        (skill) => {
          document
            .fontSize(11)
            .text(
              `• ${skill.name} — ${skill.priority}`
            );
        }
      );
    }

    document.moveDown();

    document
      .fontSize(15)
      .text("Category Breakdown");

    const categoryBreakdown =
      analysis.categoryBreakdown ||
      [];

    if (
      categoryBreakdown.length === 0
    ) {
      document
        .fontSize(11)
        .text(
          "No category breakdown available."
        );
    } else {
      categoryBreakdown.forEach(
        (category) => {
          document
            .fontSize(11)
            .text(
              `• ${category.category}: ${category.score}%`
            );
        }
      );
    }

    document.moveDown();

    document
      .fontSize(15)
      .text("Recommendations");

    const recommendations =
      analysis.recommendations ||
      [];

    if (
      recommendations.length === 0
    ) {
      document
        .fontSize(11)
        .text(
          "No recommendations available."
        );
    } else {
      recommendations.forEach(
        (recommendation) => {
          document
            .fontSize(11)
            .text(
              `• ${recommendation.title} — ${recommendation.description}`
            );
        }
      );
    }

    document.moveDown();

    document
      .fontSize(15)
      .text("Career Matches");

    const careerMatches =
      analysis.careerMatches ||
      [];

    if (
      careerMatches.length === 0
    ) {
      document
        .fontSize(11)
        .text(
          "No career matches available."
        );
    } else {
      careerMatches.forEach(
        (match) => {
          document
            .fontSize(11)
            .text(
              `• ${match.role}: ${match.score}% match`
            );
        }
      );
    }

    document.end();
  } catch (error) {
    console.error(
      "Export skill report error:",
      error
    );

    if (!res.headersSent) {
      return res.status(500).json({
        success: false,

        message:
          "Unable to export skill report",

        error:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      });
    }
  }
};