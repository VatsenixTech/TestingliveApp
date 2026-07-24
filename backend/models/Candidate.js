const mongoose = require("mongoose");

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      default: "",
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    years: {
      type: Number,
      min: 0,
      default: 0,
    },

    lastUsed: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const employmentSchema = new mongoose.Schema(
  {
    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },

    company: {
      type: String,
      trim: true,
      default: "",
    },

    employmentType: {
      type: String,
      default: "",
    },

    startDate: {
      type: String,
      default: "",
    },

    endDate: {
      type: String,
      default: "",
    },

    currentlyWorking: {
      type: Boolean,
      default: false,
    },

    description: {
      type: String,
      default: "",
    },

    noticePeriod: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const educationSchema = new mongoose.Schema(
  {
    degree: {
      type: String,
      default: "",
    },

    specialization: {
      type: String,
      default: "",
    },

    college: {
      type: String,
      default: "",
    },

    startYear: {
      type: String,
      default: "",
    },

    endYear: {
      type: String,
      default: "",
    },

    educationType: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: "",
    },

    domain: {
      type: String,
      default: "",
    },

    tools: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    link: {
      type: String,
      default: "",
    },
  },
  {
    _id: true,
  }
);

const recruiterNoteSchema = new mongoose.Schema(
  {
    note: {
      type: String,
      default: "",
      trim: true,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: true,
  }
);

const candidateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "",
      trim: true,
    },

    email: {
      type: String,
      default: "",
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["candidate", "admin"],
      default: "candidate",
    },

    authProvider: {
      type: String,
      enum: ["email", "google", "microsoft", "github"],
      default: "email",
    },

    firebaseUid: {
      type: String,
      default: "",
    },

    /*
      Verification belongs to the account.
      The browser should not directly update these values.
    */
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerifiedAt: {
      type: Date,
      default: null,
    },

    isMobileVerified: {
      type: Boolean,
      default: false,
    },

    mobileVerifiedAt: {
      type: Date,
      default: null,
    },

    phone: {
      type: String,
      default: "",
      trim: true,
    },

    location: {
      type: String,
      default: "",
    },

    profileHeadline: {
      type: String,
      default: "",
    },

    profileSummary: {
      type: String,
      default: "",
    },

    selfIntro: {
      type: String,
      default: "",
    },

    currentRole: {
      type: String,
      default: "",
    },

    currentCompany: {
      type: String,
      default: "",
    },

    experienceYears: {
      type: Number,
      min: 0,
      default: 0,
    },

    experienceMonths: {
      type: Number,
      min: 0,
      max: 11,
      default: 0,
    },

    expectedSalary: {
      type: String,
      default: "",
    },

    currentSalary: {
      type: String,
      default: "",
    },

    noticePeriod: {
      type: String,
      default: "",
    },

    preferredLocation: {
      type: String,
      default: "",
    },

    workMode: {
      type: String,
      default: "",
    },

    jobType: {
      type: String,
      default: "",
    },

    employmentType: {
      type: String,
      default: "",
    },

    gender: {
      type: String,
      default: "",
    },

    dateOfBirth: {
      type: String,
      default: "",
    },

    maritalStatus: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      default: "",
    },

    languages: {
      type: [String],
      default: [],
    },

    skills: {
      type: [skillSchema],
      default: [],
    },

    employment: {
      type: [employmentSchema],
      default: [],
    },

    education: {
      type: [educationSchema],
      default: [],
    },

    projects: {
      type: [projectSchema],
      default: [],
    },

    projectTitle: {
      type: String,
      default: "",
    },

    projectDomain: {
      type: String,
      default: "",
    },

    projectTools: {
      type: String,
      default: "",
    },

    projectExplanation: {
      type: String,
      default: "",
    },

    projectLink: {
      type: String,
      default: "",
    },

    linkedinUrl: {
      type: String,
      default: "",
    },

    githubUrl: {
      type: String,
      default: "",
    },

    portfolioUrl: {
      type: String,
      default: "",
    },

    certifications: {
      type: [String],
      default: [],
    },

    profileImageUrl: {
      type: String,
      default: "",
    },

    resumeUrl: {
      type: String,
      default: "",
    },

    selfIntroVideoUrl: {
      type: String,
      default: "",
    },

    projectVideoUrl: {
      type: String,
      default: "",
    },

    profileViews: {
      type: Number,
      min: 0,
      default: 0,
    },

    shortlisted: {
      type: Boolean,
      default: false,
    },

    /*
      Subscription information
    */
    plan: {
      type: String,
      enum: ["Basic", "Pro", "Ultimate"],
      default: "Basic",
    },

    activePlan: {
      type: String,
      enum: ["Basic", "Pro", "Ultimate"],
      default: "Basic",
    },

    subscriptionStatus: {
      type: String,
      enum: ["inactive", "active", "expired", "cancelled"],
      default: "inactive",
    },

    subscriptionActivatedAt: {
      type: Date,
      default: null,
    },

    subscriptionExpiresAt: {
      type: Date,
      default: null,
    },

    subscriptionSource: {
      type: String,
      default: "",
    },

    razorpayPaymentId: {
      type: String,
      default: "",
    },

    razorpayPaymentLinkId: {
      type: String,
      default: "",
    },

    /*
      Coupon information
    */
    appliedCoupon: {
      type: String,
      default: "",
      uppercase: true,
      trim: true,
    },

    premiumAccessUntil: {
      type: Date,
      default: null,
    },

    couponDiscountPercent: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    couponDiscountAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    /*
      Referral information

      Do not use default: "" for referralCode.
      Multiple empty strings can create a duplicate-key error.
    */
    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      default: undefined,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      default: null,
    },

    referralJoinedAt: {
      type: Date,
      default: null,
    },

    /*
      Candidate settings
    */
    settings: {
      darkMode: {
        type: Boolean,
        default: false,
      },

      notifications: {
        jobAlerts: {
          type: Boolean,
          default: true,
        },

        applicationUpdates: {
          type: Boolean,
          default: true,
        },

        interviewReminders: {
          type: Boolean,
          default: true,
        },
      },

      privacy: {
        profileVisibility: {
          type: String,
          enum: ["public", "private", "recruiters_only"],
          default: "public",
        },

        showEmailToRecruiters: {
          type: Boolean,
          default: false,
        },

        showPhoneToRecruiters: {
          type: Boolean,
          default: false,
        },
      },
    },

    recruiterNotes: {
      type: [recruiterNoteSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

/*
  Helpful indexes
*/
candidateSchema.index({ email: 1 });
candidateSchema.index({ firebaseUid: 1 });
candidateSchema.index({ referralCode: 1 }, { unique: true, sparse: true });
candidateSchema.index({ referredBy: 1 });

module.exports = mongoose.model("Candidate", candidateSchema);