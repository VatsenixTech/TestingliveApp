require("dotenv").config();

const mongoose = require("mongoose");

const RoleSkillProfile = require(
  "../models/RoleSkillProfile"
);

const profiles = [
  {
    role: "Data Engineer",

    description:
      "Production data engineering role profile.",

    requiredSkills: [
      {
        name: "Python",

        category:
          "Programming",

        weight: 8,

        priority:
          "Critical",

        aliases: [
          "Py",
        ],
      },

      {
        name: "SQL",

        category:
          "Databases",

        weight: 9,

        priority:
          "Critical",
      },

      {
        name: "PySpark",

        category:
          "Data Processing",

        weight: 9,

        priority:
          "Critical",

        aliases: [
          "Apache Spark",
          "Spark",
        ],
      },

      {
        name: "ETL",

        category:
          "Data Engineering",

        weight: 8,

        priority:
          "Critical",

        aliases: [
          "ELT",
          "Data Pipelines",
        ],
      },

      {
        name: "AWS",

        category:
          "Cloud",

        weight: 7,

        priority:
          "High",

        aliases: [
          "Amazon Web Services",
        ],
      },

      {
        name: "Data Modeling",

        category:
          "Data Engineering",

        weight: 7,

        priority:
          "High",
      },

      {
        name: "Airflow",

        category:
          "Orchestration",

        weight: 6,

        priority:
          "High",

        aliases: [
          "Apache Airflow",
        ],
      },

      {
        name: "Kafka",

        category:
          "Streaming",

        weight: 6,

        priority:
          "High",

        aliases: [
          "Apache Kafka",
        ],
      },

      {
        name: "Git",

        category:
          "Tools",

        weight: 4,

        priority:
          "Medium",
      },

      {
        name: "Docker",

        category:
          "DevOps",

        weight: 4,

        priority:
          "Medium",
      },
    ],
  },

  {
    role: "Frontend Developer",

    description:
      "Production frontend engineering role profile.",

    requiredSkills: [
      {
        name: "JavaScript",

        category:
          "Programming",

        weight: 9,

        priority:
          "Critical",

        aliases: [
          "JS",
        ],
      },

      {
        name: "React",

        category:
          "Frontend",

        weight: 9,

        priority:
          "Critical",

        aliases: [
          "React.js",
          "ReactJS",
        ],
      },

      {
        name: "HTML",

        category:
          "Frontend",

        weight: 7,

        priority:
          "High",
      },

      {
        name: "CSS",

        category:
          "Frontend",

        weight: 7,

        priority:
          "High",
      },

      {
        name: "TypeScript",

        category:
          "Programming",

        weight: 7,

        priority:
          "High",

        aliases: [
          "TS",
        ],
      },

      {
        name: "REST APIs",

        category:
          "Integration",

        weight: 6,

        priority:
          "High",

        aliases: [
          "REST API",
          "API Integration",
        ],
      },

      {
        name:
          "Responsive Design",

        category:
          "UX",

        weight: 5,

        priority:
          "Medium",
      },

      {
        name: "Git",

        category:
          "Tools",

        weight: 4,

        priority:
          "Medium",
      },

      {
        name: "Testing",

        category:
          "Quality",

        weight: 4,

        priority:
          "Medium",

        aliases: [
          "Jest",
          "React Testing Library",
        ],
      },
    ],
  },

  {
    role: "Backend Developer",

    description:
      "Production backend engineering role profile.",

    requiredSkills: [
      {
        name: "Node.js",

        category:
          "Programming",

        weight: 9,

        priority:
          "Critical",

        aliases: [
          "Node",
          "NodeJS",
        ],
      },

      {
        name: "Express",

        category:
          "Backend",

        weight: 8,

        priority:
          "Critical",

        aliases: [
          "Express.js",
        ],
      },

      {
        name: "MongoDB",

        category:
          "Databases",

        weight: 8,

        priority:
          "Critical",
      },

      {
        name: "REST APIs",

        category:
          "Backend",

        weight: 9,

        priority:
          "Critical",
      },

      {
        name:
          "Authentication",

        category:
          "Security",

        weight: 7,

        priority:
          "High",

        aliases: [
          "JWT",
          "OAuth",
        ],
      },

      {
        name: "SQL",

        category:
          "Databases",

        weight: 6,

        priority:
          "High",
      },

      {
        name: "Docker",

        category:
          "DevOps",

        weight: 5,

        priority:
          "Medium",
      },

      {
        name: "Git",

        category:
          "Tools",

        weight: 4,

        priority:
          "Medium",
      },
    ],
  },
];

/* =========================================================
   SEED FUNCTION
========================================================= */

async function seed() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error(
        "MONGO_URI is missing from .env"
      );
    }

    await mongoose.connect(
      process.env.MONGO_URI
    );

    console.log(
      "✅ Connected to MongoDB"
    );

    for (
      const profile
      of profiles
    ) {
      const normalizedRole =
        profile.role
          .trim()
          .toLowerCase();

      await RoleSkillProfile.findOneAndUpdate(
        {
          normalizedRole,
        },

        {
          ...profile,

          normalizedRole,

          isActive: true,

          source:
            "Internal verified role profile",

          version:
            "1.0.0",
        },

        {
          upsert: true,

          new: true,

          setDefaultsOnInsert:
            true,

          runValidators: true,
        }
      );

      console.log(
        `✅ Seeded ${profile.role}`
      );
    }

    console.log(
      "✅ Role skill profiles seeded successfully"
    );
  } catch (error) {
    console.error(
      "❌ Seed error:",
      error
    );

    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();

    console.log(
      "✅ MongoDB disconnected"
    );
  }
}

seed();