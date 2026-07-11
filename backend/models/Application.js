const mongoose = require("mongoose");

const APPLICATION_STATUSES = [
  "Applied",
  "Queued",
  "Under Review",
  "Interview",
  "Offered",
  "Rejected",
  "Skipped",
  "Failed",
];

const APPLICATION_SOURCES = [
  "manual",
  "auto-apply",
];

const applicationSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: {
        values: APPLICATION_STATUSES,
        message: "{VALUE} is not a valid application status.",
      },
      default: "Applied",
      index: true,
    },

    autoApplied: {
      type: Boolean,
      default: false,
      index: true,
    },

    source: {
      type: String,
      enum: {
        values: APPLICATION_SOURCES,
        message: "{VALUE} is not a valid application source.",
      },
      default: "manual",
      index: true,
    },

    companyName: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    jobTitle: {
      type: String,
      trim: true,
      default: "",
      maxlength: 250,
    },

    matchScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    appliedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    nextStep: {
      type: String,
      trim: true,
      default: "",
      maxlength: 500,
    },

    interviewStage: {
      type: String,
      trim: true,
      default: "",
      maxlength: 200,
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: 3000,
    },

    lastStatusChangedAt: {
      type: Date,
      default: Date.now,
    },

    failureReason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1000,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
  Prevent the same candidate from applying
  to the same job more than once.
*/
applicationSchema.index(
  {
    candidateId: 1,
    jobId: 1,
  },
  {
    unique: true,
    name: "unique_candidate_job_application",
  }
);

/*
  Helpful indexes for dashboard and reporting queries.
*/
applicationSchema.index(
  {
    candidateId: 1,
    status: 1,
    createdAt: -1,
  },
  {
    name: "candidate_status_created_index",
  }
);

applicationSchema.index(
  {
    candidateId: 1,
    autoApplied: 1,
    appliedAt: -1,
  },
  {
    name: "candidate_auto_applied_date_index",
  }
);

applicationSchema.index(
  {
    candidateId: 1,
    source: 1,
    appliedAt: -1,
  },
  {
    name: "candidate_source_date_index",
  }
);

/*
  Keep autoApplied and source synchronized.
*/
applicationSchema.pre("validate", function (next) {
  if (this.autoApplied === true) {
    this.source = "auto-apply";
  }

  if (this.source === "auto-apply") {
    this.autoApplied = true;
  }

  next();
});

/*
  Track when status changes.
*/
applicationSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    this.lastStatusChangedAt = new Date();

    if (this.status !== "Failed") {
      this.failureReason = "";
    }
  }

  next();
});

/*
  Return a frontend-friendly application object.
*/
applicationSchema.methods.toDashboardJSON = function () {
  const application = this.toObject();

  return {
    ...application,

    company:
      application.companyName ||
      "",

    jobTitle:
      application.jobTitle ||
      "",

    status:
      application.status ||
      "Applied",

    appliedAt:
      application.appliedAt ||
      application.createdAt,

    source:
      application.source ||
      (
        application.autoApplied
          ? "auto-apply"
          : "manual"
      ),
  };
};

/*
  Update application status safely.
*/
applicationSchema.methods.updateStatus = async function (
  nextStatus,
  extra = {}
) {
  if (!APPLICATION_STATUSES.includes(nextStatus)) {
    throw new Error(
      `${nextStatus} is not a valid application status.`
    );
  }

  this.status = nextStatus;

  if (extra.nextStep !== undefined) {
    this.nextStep = extra.nextStep;
  }

  if (extra.interviewStage !== undefined) {
    this.interviewStage = extra.interviewStage;
  }

  if (extra.notes !== undefined) {
    this.notes = extra.notes;
  }

  if (nextStatus === "Failed") {
    this.failureReason =
      extra.failureReason ||
      "Application processing failed.";
  }

  await this.save();

  return this;
};

/*
  Check whether a candidate already applied to a job.
*/
applicationSchema.statics.hasCandidateApplied = async function (
  candidateId,
  jobId
) {
  const application = await this.findOne({
    candidateId,
    jobId,
  })
    .select("_id status appliedAt")
    .lean();

  return application;
};

/*
  Get dashboard application counts for one candidate.
*/
applicationSchema.statics.getCandidateStats = async function (
  candidateId
) {
  const result = await this.aggregate([
    {
      $match: {
        candidateId:
          new mongoose.Types.ObjectId(candidateId),
      },
    },
    {
      $group: {
        _id: "$status",
        count: {
          $sum: 1,
        },
      },
    },
  ]);

  const stats = {
    total: 0,
    applied: 0,
    queued: 0,
    underReview: 0,
    interview: 0,
    offered: 0,
    rejected: 0,
    skipped: 0,
    failed: 0,
  };

  for (const item of result) {
    stats.total += item.count;

    switch (item._id) {
      case "Applied":
        stats.applied = item.count;
        break;

      case "Queued":
        stats.queued = item.count;
        break;

      case "Under Review":
        stats.underReview = item.count;
        break;

      case "Interview":
        stats.interview = item.count;
        break;

      case "Offered":
        stats.offered = item.count;
        break;

      case "Rejected":
        stats.rejected = item.count;
        break;

      case "Skipped":
        stats.skipped = item.count;
        break;

      case "Failed":
        stats.failed = item.count;
        break;

      default:
        break;
    }
  }

  return stats;
};

module.exports =
  mongoose.models.Application ||
  mongoose.model(
    "Application",
    applicationSchema
  );