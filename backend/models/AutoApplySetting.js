const mongoose = require("mongoose");

const AUTO_APPLY_RUN_STATUSES = [
  "not_started",
  "running",
  "completed",
  "failed",
  "paused",
];

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    ),
  ];
}

const autoApplySettingSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      unique: true,
      index: true,
    },

    /* =====================================================
       ENGINE STATUS
    ===================================================== */

    enabled: {
      type: Boolean,
      default: false,
      index: true,
    },

    consent: {
      type: Boolean,
      default: false,
    },

    consentAcceptedAt: {
      type: Date,
      default: null,
    },

    consentRevokedAt: {
      type: Date,
      default: null,
    },

    /* =====================================================
       DAILY APPLICATION CONTROLS
    ===================================================== */

    dailyLimit: {
      type: Number,
      default: 25,
      min: 1,
      max: 100,
    },

    applicationsToday: {
      type: Number,
      default: 0,
      min: 0,
    },

    counterDate: {
      type: String,
      default: getTodayKey,
      index: true,
    },

    /* =====================================================
       JOB MATCHING PREFERENCES
    ===================================================== */

    minimumMatchScore: {
      type: Number,
      default: 70,
      min: 0,
      max: 100,
    },

    remoteOnly: {
      type: Boolean,
      default: false,
    },

    easyApplyOnly: {
      type: Boolean,
      default: true,
    },

    preferredRoles: {
      type: [String],
      default: [],
    },

    preferredLocations: {
      type: [String],
      default: [],
    },

    excludedCompanies: {
      type: [String],
      default: [],
    },

    excludedJobTitles: {
      type: [String],
      default: [],
    },

    /* =====================================================
       ENGINE EXECUTION INFORMATION
    ===================================================== */

    lastRunAt: {
      type: Date,
      default: null,
      index: true,
    },

    nextRunAt: {
      type: Date,
      default: null,
    },

    lastRunStatus: {
      type: String,
      enum: {
        values: AUTO_APPLY_RUN_STATUSES,
        message:
          "{VALUE} is not a valid Auto Apply run status.",
      },
      default: "not_started",
      index: true,
    },

    lastRunMessage: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    lastMatchedJobsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastAppliedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastSkippedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastFailedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =====================================================
       LIFETIME STATISTICS
    ===================================================== */

    totalApplicationsSent: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalJobsMatched: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalApplicationsSkipped: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalApplicationsFailed: {
      type: Number,
      default: 0,
      min: 0,
    },

    /* =====================================================
       ADDITIONAL CONTROL
    ===================================================== */

    pausedReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/* =========================================================
   INDEXES
========================================================= */

autoApplySettingSchema.index(
  {
    enabled: 1,
    consent: 1,
    lastRunStatus: 1,
    nextRunAt: 1,
  },
  {
    name: "auto_apply_engine_scheduler_index",
  }
);

autoApplySettingSchema.index(
  {
    candidateId: 1,
    updatedAt: -1,
  },
  {
    name: "candidate_auto_apply_setting_index",
  }
);

/* =========================================================
   DOCUMENT VALIDATION
========================================================= */

autoApplySettingSchema.pre(
  "validate",
  function (next) {
    this.preferredRoles = normalizeStringArray(
      this.preferredRoles
    );

    this.preferredLocations = normalizeStringArray(
      this.preferredLocations
    );

    this.excludedCompanies = normalizeStringArray(
      this.excludedCompanies
    );

    this.excludedJobTitles = normalizeStringArray(
      this.excludedJobTitles
    );

    if (this.dailyLimit < 1) {
      this.dailyLimit = 1;
    }

    if (this.dailyLimit > 100) {
      this.dailyLimit = 100;
    }

    if (this.minimumMatchScore < 0) {
      this.minimumMatchScore = 0;
    }

    if (this.minimumMatchScore > 100) {
      this.minimumMatchScore = 100;
    }

    if (this.applicationsToday < 0) {
      this.applicationsToday = 0;
    }

    next();
  }
);

/* =========================================================
   CONSENT HANDLING
========================================================= */

autoApplySettingSchema.methods.acceptConsent =
  async function () {
    this.consent = true;
    this.consentAcceptedAt = new Date();
    this.consentRevokedAt = null;

    await this.save();

    return this;
  };

autoApplySettingSchema.methods.revokeConsent =
  async function () {
    this.consent = false;
    this.enabled = false;
    this.consentRevokedAt = new Date();
    this.lastRunStatus = "paused";
    this.pausedReason =
      "Candidate consent was revoked.";

    await this.save();

    return this;
  };

/* =========================================================
   DAILY COUNTER
========================================================= */

autoApplySettingSchema.methods.resetDailyCounterIfNeeded =
  async function () {
    const today = getTodayKey();

    if (this.counterDate !== today) {
      this.counterDate = today;
      this.applicationsToday = 0;

      await this.save();
    }

    return this;
  };

autoApplySettingSchema.methods.getRemainingApplications =
  function () {
    return Math.max(
      this.dailyLimit -
        (this.applicationsToday || 0),
      0
    );
  };

/* =========================================================
   ENGINE PERMISSION CHECK
========================================================= */

autoApplySettingSchema.methods.canApplyToday =
  function () {
    if (!this.enabled) {
      return {
        allowed: false,
        reason: "Auto Apply Engine is paused.",
        remainingApplications:
          this.getRemainingApplications(),
      };
    }

    if (!this.consent) {
      return {
        allowed: false,
        reason:
          "Candidate consent is required.",
        remainingApplications:
          this.getRemainingApplications(),
      };
    }

    if (
      this.applicationsToday >=
      this.dailyLimit
    ) {
      return {
        allowed: false,
        reason:
          "Daily application limit has been reached.",
        remainingApplications: 0,
      };
    }

    return {
      allowed: true,
      reason: "",
      remainingApplications:
        this.getRemainingApplications(),
    };
  };

/* =========================================================
   ENGINE START / COMPLETE / FAIL
========================================================= */

autoApplySettingSchema.methods.markRunStarted =
  async function () {
    await this.resetDailyCounterIfNeeded();

    this.lastRunAt = new Date();
    this.lastRunStatus = "running";
    this.lastRunMessage = "";
    this.pausedReason = "";

    this.lastMatchedJobsCount = 0;
    this.lastAppliedCount = 0;
    this.lastSkippedCount = 0;
    this.lastFailedCount = 0;

    await this.save();

    return this;
  };

autoApplySettingSchema.methods.markRunCompleted =
  async function ({
    matchedCount = 0,
    appliedCount = 0,
    skippedCount = 0,
    failedCount = 0,
    message = "",
  } = {}) {
    await this.resetDailyCounterIfNeeded();

    const safeMatchedCount = Math.max(
      Number(matchedCount) || 0,
      0
    );

    const safeAppliedCount = Math.max(
      Number(appliedCount) || 0,
      0
    );

    const safeSkippedCount = Math.max(
      Number(skippedCount) || 0,
      0
    );

    const safeFailedCount = Math.max(
      Number(failedCount) || 0,
      0
    );

    this.applicationsToday +=
      safeAppliedCount;

    this.totalApplicationsSent +=
      safeAppliedCount;

    this.totalJobsMatched +=
      safeMatchedCount;

    this.totalApplicationsSkipped +=
      safeSkippedCount;

    this.totalApplicationsFailed +=
      safeFailedCount;

    this.lastMatchedJobsCount =
      safeMatchedCount;

    this.lastAppliedCount =
      safeAppliedCount;

    this.lastSkippedCount =
      safeSkippedCount;

    this.lastFailedCount =
      safeFailedCount;

    this.lastRunAt = new Date();
    this.lastRunStatus = "completed";

    this.lastRunMessage =
      message ||
      (
        safeAppliedCount > 0
          ? `${safeAppliedCount} applications submitted successfully.`
          : "No new eligible jobs were available."
      );

    await this.save();

    return this;
  };

autoApplySettingSchema.methods.markRunFailed =
  async function (
    message = "Auto Apply failed."
  ) {
    this.lastRunAt = new Date();
    this.lastRunStatus = "failed";
    this.lastRunMessage = message;
    this.lastFailedCount += 1;
    this.totalApplicationsFailed += 1;

    await this.save();

    return this;
  };

autoApplySettingSchema.methods.pauseEngine =
  async function (
    reason = "Auto Apply Engine was paused."
  ) {
    this.enabled = false;
    this.lastRunStatus = "paused";
    this.pausedReason = reason;
    this.lastRunMessage = reason;

    await this.save();

    return this;
  };

autoApplySettingSchema.methods.enableEngine =
  async function () {
    if (!this.consent) {
      throw new Error(
        "Candidate consent is required before enabling Auto Apply."
      );
    }

    this.enabled = true;
    this.lastRunStatus = "not_started";
    this.pausedReason = "";
    this.lastRunMessage = "";

    await this.save();

    return this;
  };

/* =========================================================
   INDIVIDUAL COUNTER HELPERS
========================================================= */

autoApplySettingSchema.methods.recordSuccessfulApplication =
  async function () {
    await this.resetDailyCounterIfNeeded();

    if (
      this.applicationsToday >=
      this.dailyLimit
    ) {
      throw new Error(
        "Daily application limit has been reached."
      );
    }

    this.applicationsToday += 1;
    this.totalApplicationsSent += 1;
    this.lastAppliedCount += 1;
    this.lastRunAt = new Date();

    await this.save();

    return this;
  };

autoApplySettingSchema.methods.recordSkippedApplication =
  async function () {
    this.totalApplicationsSkipped += 1;
    this.lastSkippedCount += 1;
    this.lastRunAt = new Date();

    await this.save();

    return this;
  };

autoApplySettingSchema.methods.recordFailedApplication =
  async function (
    message = "Application failed."
  ) {
    this.totalApplicationsFailed += 1;
    this.lastFailedCount += 1;
    this.lastRunAt = new Date();
    this.lastRunMessage = message;

    await this.save();

    return this;
  };

/* =========================================================
   SETTINGS UPDATE HELPER
========================================================= */

autoApplySettingSchema.methods.updatePreferences =
  async function ({
    dailyLimit,
    minimumMatchScore,
    remoteOnly,
    easyApplyOnly,
    preferredRoles,
    preferredLocations,
    excludedCompanies,
    excludedJobTitles,
    consent,
  } = {}) {
    if (dailyLimit !== undefined) {
      this.dailyLimit = Math.max(
        1,
        Math.min(
          Number(dailyLimit) || 25,
          100
        )
      );
    }

    if (minimumMatchScore !== undefined) {
      this.minimumMatchScore = Math.max(
        0,
        Math.min(
          Number(minimumMatchScore) || 0,
          100
        )
      );
    }

    if (typeof remoteOnly === "boolean") {
      this.remoteOnly = remoteOnly;
    }

    if (
      typeof easyApplyOnly === "boolean"
    ) {
      this.easyApplyOnly =
        easyApplyOnly;
    }

    if (preferredRoles !== undefined) {
      this.preferredRoles =
        normalizeStringArray(
          preferredRoles
        );
    }

    if (
      preferredLocations !== undefined
    ) {
      this.preferredLocations =
        normalizeStringArray(
          preferredLocations
        );
    }

    if (
      excludedCompanies !== undefined
    ) {
      this.excludedCompanies =
        normalizeStringArray(
          excludedCompanies
        );
    }

    if (
      excludedJobTitles !== undefined
    ) {
      this.excludedJobTitles =
        normalizeStringArray(
          excludedJobTitles
        );
    }

    if (typeof consent === "boolean") {
      if (
        consent &&
        !this.consent
      ) {
        this.consentAcceptedAt =
          new Date();

        this.consentRevokedAt = null;
      }

      if (
        !consent &&
        this.consent
      ) {
        this.consentRevokedAt =
          new Date();

        this.enabled = false;
        this.lastRunStatus = "paused";
        this.pausedReason =
          "Candidate consent was revoked.";
      }

      this.consent = consent;
    }

    await this.save();

    return this;
  };

/* =========================================================
   FRONTEND RESPONSE FORMAT
========================================================= */

autoApplySettingSchema.methods.toDashboardJSON =
  function () {
    return {
      candidateId: this.candidateId,
      enabled: this.enabled,
      consent: this.consent,
      dailyLimit: this.dailyLimit,
      applicationsToday:
        this.applicationsToday,
      remainingApplications:
        this.getRemainingApplications(),
      minimumMatchScore:
        this.minimumMatchScore,
      remoteOnly: this.remoteOnly,
      easyApplyOnly:
        this.easyApplyOnly,
      preferredRoles:
        this.preferredRoles,
      preferredLocations:
        this.preferredLocations,
      excludedCompanies:
        this.excludedCompanies,
      excludedJobTitles:
        this.excludedJobTitles,
      lastRunAt: this.lastRunAt,
      nextRunAt: this.nextRunAt,
      lastRunStatus:
        this.lastRunStatus,
      lastRunMessage:
        this.lastRunMessage,
      lastMatchedJobsCount:
        this.lastMatchedJobsCount,
      lastAppliedCount:
        this.lastAppliedCount,
      lastSkippedCount:
        this.lastSkippedCount,
      lastFailedCount:
        this.lastFailedCount,
      totalApplicationsSent:
        this.totalApplicationsSent,
      totalJobsMatched:
        this.totalJobsMatched,
      totalApplicationsSkipped:
        this.totalApplicationsSkipped,
      totalApplicationsFailed:
        this.totalApplicationsFailed,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  };

/* =========================================================
   STATIC HELPERS
========================================================= */

autoApplySettingSchema.statics.findOrCreateForCandidate =
  async function (candidateId) {
    return this.findOneAndUpdate(
      {
        candidateId,
      },
      {
        $setOnInsert: {
          candidateId,
          counterDate: getTodayKey(),
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
  };

/* =========================================================
   MODEL EXPORT
========================================================= */

module.exports =
  mongoose.models.AutoApplySetting ||
  mongoose.model(
    "AutoApplySetting",
    autoApplySettingSchema
  );