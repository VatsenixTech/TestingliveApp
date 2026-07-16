const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    normalizedName: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },

    priority: {
      type: String,

      enum: [
        "Critical",
        "High",
        "Medium",
        "Low",
      ],

      default: "Medium",
    },

    aliases: [
      {
        type: String,
        trim: true,
      },
    ],

    description: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  }
);


const roleSkillProfileSchema =
  new mongoose.Schema(
    {
      role: {
        type: String,
        required: true,
        trim: true,
      },

      normalizedRole: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        index: true,
      },

      aliases: [
        {
          type: String,
          trim: true,
          lowercase: true,
        },
      ],

      department: {
        type: String,
        required: true,
        trim: true,
        index: true,
      },

      industry: {
        type: String,
        default: "General",
        trim: true,
      },

      jobFamily: {
        type: String,
        default: "",
        trim: true,
      },

      seniorityLevels: [
        {
          type: String,
          trim: true,
        },
      ],

      description: {
        type: String,
        default: "",
      },

      requiredSkills: {
        type: [skillSchema],
        default: [],
      },

      preferredSkills: {
        type: [skillSchema],
        default: [],
      },

      sourceType: {
        type: String,

        enum: [
          "CURATED",
          "AI_GENERATED",
          "ADMIN_CREATED",
        ],

        default: "CURATED",
      },

      verificationStatus: {
        type: String,

        enum: [
          "VERIFIED",
          "PENDING_REVIEW",
          "REJECTED",
        ],

        default: "PENDING_REVIEW",
      },

      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
      },

      version: {
        type: Number,
        default: 1,
      },

      isActive: {
        type: Boolean,
        default: true,
        index: true,
      },
    },
    {
      timestamps: true,
    }
  );


function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, "")
    .replace(/\s+/g, " ");
}


roleSkillProfileSchema.pre(
  "validate",
  function normalizeProfile(next) {
    this.normalizedRole =
      normalizeText(this.role);

    this.aliases = [
      ...new Set(
        (this.aliases || [])
          .map(normalizeText)
          .filter(Boolean)
      ),
    ];

    this.requiredSkills =
      (this.requiredSkills || []).map(
        (skill) => ({
          ...skill,

          normalizedName:
            normalizeText(skill.name),

          aliases: [
            ...new Set(
              (skill.aliases || [])
                .map(normalizeText)
                .filter(Boolean)
            ),
          ],
        })
      );

    this.preferredSkills =
      (this.preferredSkills || []).map(
        (skill) => ({
          ...skill,

          normalizedName:
            normalizeText(skill.name),

          aliases: [
            ...new Set(
              (skill.aliases || [])
                .map(normalizeText)
                .filter(Boolean)
            ),
          ],
        })
      );

    next();
  }
);


roleSkillProfileSchema.index({
  department: 1,
  normalizedRole: 1,
});

roleSkillProfileSchema.index({
  aliases: 1,
});

module.exports = mongoose.model(
  "RoleSkillProfile",
  roleSkillProfileSchema
);