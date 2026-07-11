const mongoose = require("mongoose");

const AUTO_APPLY_ACTIVITY_STATUSES = [
  "queued",
  "applied",
  "skipped",
  "failed",
];

const autoApplyActivitySchema = new mongoose.Schema(
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

    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Application",
      default: null,
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
      default: 0,
      min: 0,
      max: 100,
    },

    status: {
      type: String,
      enum: {
        values: AUTO_APPLY_ACTIVITY_STATUSES,
        message: "{VALUE} is not a valid Auto Apply activity status.",
      },
      default: "queued",
      index: true,
    },

    reason: {
      type: String,
      trim: true,
      default: "",
      maxlength: 1500,
    },

    processedAt: {
      type: Date,
      default: null,
      index: true,
    },

    queuedAt: {
      type: Date,
      default: Date.now,
    },

    attemptCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastAttemptAt: {
      type: Date,
      default: null,
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

/*
  Prevent duplicate Auto Apply activity records
  for the same candidate and job.
*/
autoApplyActivitySchema.index(
  {
    candidateId: 1,
    jobId: 1,
  },
  {
    unique: true,
    name: "unique_candidate_job_auto_apply_activity",
  }
);

/*
  Useful indexes for dashboard activity queries.
*/
autoApplyActivitySchema.index(
  {
    candidateId: 1,
    status: 1,
    createdAt: -1,
  },
  {
    name: "candidate_activity_status_index",
  }
);

autoApplyActivitySchema.index(
  {
    candidateId: 1,
    processedAt: -1,
  },
  {
    name: "candidate_processed_activity_index",
  }
);

autoApplyActivitySchema.index(
  {
    candidateId: 1,
    createdAt: -1,
  },
  {
    name: "candidate_recent_activity_index",
  }
);

/*
  Automatically update timestamps and counters
  when the activity status changes.
*/
autoApplyActivitySchema.pre("save", function (next) {
  if (this.isNew && !this.queuedAt) {
    this.queuedAt = new Date();
  }

  if (this.isModified("status")) {
    if (this.status === "queued") {
      this.processedAt = null;
    } else {
      this.processedAt = new Date();
    }

    if (
      this.status === "applied" ||
      this.status === "skipped"
    ) {
      this.reason = this.reason || "";
    }

    if (
      this.status === "failed" &&
      !this.reason
    ) {
      this.reason =
        "Auto Apply processing failed.";
    }
  }

  next();
});

/*
  Mark the activity as queued.
*/
autoApplyActivitySchema.methods.markQueued =
  async function () {
    this.status = "queued";
    this.processedAt = null;
    this.reason = "";

    await this.save();

    return this;
  };

/*
  Mark the activity as successfully applied.
*/
autoApplyActivitySchema.methods.markApplied =
  async function (applicationId = null) {
    this.status = "applied";
    this.applicationId =
      applicationId || this.applicationId;
    this.reason = "";
    this.processedAt = new Date();
    this.lastAttemptAt = new Date();
    this.attemptCount += 1;

    await this.save();

    return this;
  };

/*
  Mark the activity as skipped.
*/
autoApplyActivitySchema.methods.markSkipped =
  async function (reason = "Already applied") {
    this.status = "skipped";
    this.reason = reason;
    this.processedAt = new Date();
    this.lastAttemptAt = new Date();
    this.attemptCount += 1;

    await this.save();

    return this;
  };

/*
  Mark the activity as failed.
*/
autoApplyActivitySchema.methods.markFailed =
  async function (reason = "Auto Apply failed") {
    this.status = "failed";
    this.reason = reason;
    this.processedAt = new Date();
    this.lastAttemptAt = new Date();
    this.attemptCount += 1;

    await this.save();

    return this;
  };

/*
  Create or update one activity record safely.
*/
autoApplyActivitySchema.statics.upsertActivity =
  async function ({
    candidateId,
    jobId,
    companyName = "",
    jobTitle = "",
    matchScore = 0,
    status = "queued",
    reason = "",
    applicationId = null,
    metadata = {},
  }) {
    if (
      !AUTO_APPLY_ACTIVITY_STATUSES.includes(
        status
      )
    ) {
      throw new Error(
        `${status} is not a valid Auto Apply activity status.`
      );
    }

    const update = {
      companyName,
      jobTitle,
      matchScore,
      status,
      reason,
      metadata,
      lastAttemptAt: new Date(),
    };

    if (applicationId) {
      update.applicationId = applicationId;
    }

    if (status === "queued") {
      update.processedAt = null;
    } else {
      update.processedAt = new Date();
    }

    return this.findOneAndUpdate(
      {
        candidateId,
        jobId,
      },
      {
        $set: update,

        $setOnInsert: {
          candidateId,
          jobId,
          queuedAt: new Date(),
        },

        $inc: {
          attemptCount: 1,
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );
  };

/*
  Get recent Auto Apply activity for dashboard.
*/
autoApplyActivitySchema.statics.getRecentActivity =
  async function (
    candidateId,
    limit = 10
  ) {
    const safeLimit = Math.max(
      1,
      Math.min(Number(limit) || 10, 50)
    );

    return this.find({
      candidateId,
    })
      .populate({
        path: "jobId",
        select:
          "title jobTitle role company companyName location",
      })
      .populate({
        path: "applicationId",
        select:
          "status appliedAt autoApplied source",
      })
      .sort({
        createdAt: -1,
      })
      .limit(safeLimit)
      .lean();
  };

/*
  Get dashboard status counts.
*/
autoApplyActivitySchema.statics.getCandidateStats =
  async function (candidateId) {
    const result = await this.aggregate([
      {
        $match: {
          candidateId:
            new mongoose.Types.ObjectId(
              candidateId
            ),
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
      queued: 0,
      applied: 0,
      skipped: 0,
      failed: 0,
    };

    for (const item of result) {
      stats.total += item.count;

      if (
        Object.prototype.hasOwnProperty.call(
          stats,
          item._id
        )
      ) {
        stats[item._id] = item.count;
      }
    }

    return stats;
  };

module.exports =
  mongoose.models.AutoApplyActivity ||
  mongoose.model(
    "AutoApplyActivity",
    autoApplyActivitySchema
  );