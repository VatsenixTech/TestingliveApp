const express = require("express");
const mongoose = require("mongoose");

const AutoApplySetting = require("../models/AutoApplySetting");
const AutoApplyActivity = require("../models/AutoApplyActivity");
const Job = require("../models/job");
const Application = require("../models/Application");
const Notification = require("../models/Notification");

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

function isValidId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeArray(value) {
  if (Array.isArray(value)) {
    return [
      ...new Set(
        value
          .map((item) => normalizeText(item))
          .filter(Boolean)
      ),
    ];
  }

  if (typeof value === "string") {
    return [
      ...new Set(
        value
          .split(",")
          .map((item) => normalizeText(item))
          .filter(Boolean)
      ),
    ];
  }

  return [];
}

function clampNumber(value, minimum, maximum, fallback) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.max(minimum, Math.min(parsed, maximum));
}

function getJobTitle(job) {
  return (
    job?.title ||
    job?.jobTitle ||
    job?.role ||
    "Job Opportunity"
  );
}

function getCompanyName(job) {
  if (typeof job?.company === "string") {
    return job.company;
  }

  return (
    job?.company?.name ||
    job?.companyName ||
    job?.organization ||
    "Company"
  );
}

function getJobLocation(job) {
  return (
    job?.location ||
    job?.jobLocation ||
    job?.city ||
    job?.workLocation ||
    ""
  );
}

function isRemoteJob(job) {
  const combinedText = normalizeText(
    [
      job?.workMode,
      job?.location,
      job?.jobLocation,
      job?.description,
    ]
      .filter(Boolean)
      .join(" ")
  );

  return (
    job?.remote === true ||
    job?.isRemote === true ||
    job?.remoteOnly === true ||
    combinedText.includes("remote") ||
    combinedText.includes("work from home")
  );
}

function isEasyApplyJob(job) {
  return (
    job?.easyApply === true ||
    job?.isEasyApply === true ||
    job?.quickApply === true
  );
}

function calculateMatchScore(job, setting) {
  let score = 50;

  const jobTitle = normalizeText(getJobTitle(job));
  const jobLocation = normalizeText(getJobLocation(job));
  const companyName = normalizeText(getCompanyName(job));

  const preferredRoles = normalizeArray(
    setting?.preferredRoles
  );

  const preferredLocations = normalizeArray(
    setting?.preferredLocations
  );

  const excludedCompanies = normalizeArray(
    setting?.excludedCompanies
  );

  const excludedJobTitles = normalizeArray(
    setting?.excludedJobTitles
  );

  if (
    excludedCompanies.some(
      (company) =>
        companyName.includes(company) ||
        company.includes(companyName)
    )
  ) {
    return 0;
  }

  if (
    excludedJobTitles.some(
      (title) =>
        jobTitle.includes(title) ||
        title.includes(jobTitle)
    )
  ) {
    return 0;
  }

  if (preferredRoles.length > 0) {
    const roleMatched = preferredRoles.some(
      (role) =>
        jobTitle.includes(role) ||
        role.includes(jobTitle)
    );

    score += roleMatched ? 25 : -20;
  }

  if (preferredLocations.length > 0) {
    const locationMatched = preferredLocations.some(
      (location) =>
        jobLocation.includes(location) ||
        location.includes(jobLocation)
    );

    score += locationMatched ? 15 : -10;
  }

  if (setting?.remoteOnly) {
    if (!isRemoteJob(job)) {
      return 0;
    }

    score += 10;
  }

  if (setting?.easyApplyOnly) {
    if (!isEasyApplyJob(job)) {
      return 0;
    }

    score += 10;
  }

  return Math.max(0, Math.min(Math.round(score), 100));
}

async function findOrCreateSetting(candidateId) {
  if (
    typeof AutoApplySetting.findOrCreateForCandidate ===
    "function"
  ) {
    return AutoApplySetting.findOrCreateForCandidate(
      candidateId
    );
  }

  return AutoApplySetting.findOneAndUpdate(
    {
      candidateId,
    },
    {
      $setOnInsert: {
        candidateId,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
    }
  );
}

function serializeSetting(setting) {
  if (
    setting &&
    typeof setting.toDashboardJSON === "function"
  ) {
    return setting.toDashboardJSON();
  }

  return {
    candidateId: setting.candidateId,
    enabled: setting.enabled,
    consent: setting.consent,
    dailyLimit: setting.dailyLimit,
    applicationsToday:
      setting.applicationsToday || 0,

    remainingApplications: Math.max(
      setting.dailyLimit -
        (setting.applicationsToday || 0),
      0
    ),

    minimumMatchScore:
      setting.minimumMatchScore,

    remoteOnly:
      setting.remoteOnly,

    easyApplyOnly:
      setting.easyApplyOnly,

    preferredRoles:
      setting.preferredRoles || [],

    preferredLocations:
      setting.preferredLocations || [],

    excludedCompanies:
      setting.excludedCompanies || [],

    excludedJobTitles:
      setting.excludedJobTitles || [],

    lastRunAt:
      setting.lastRunAt,

    nextRunAt:
      setting.nextRunAt,

    lastRunStatus:
      setting.lastRunStatus,

    lastRunMessage:
      setting.lastRunMessage,

    lastMatchedJobsCount:
      setting.lastMatchedJobsCount || 0,

    lastAppliedCount:
      setting.lastAppliedCount || 0,

    lastSkippedCount:
      setting.lastSkippedCount || 0,

    lastFailedCount:
      setting.lastFailedCount || 0,

    totalApplicationsSent:
      setting.totalApplicationsSent || 0,

    totalJobsMatched:
      setting.totalJobsMatched || 0,

    totalApplicationsSkipped:
      setting.totalApplicationsSkipped || 0,

    totalApplicationsFailed:
      setting.totalApplicationsFailed || 0,
  };
}

/* =========================================================
   GET ENGINE STATUS
   GET /api/auto-apply/status/:candidateId
========================================================= */

router.get("/status/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    if (!isValidId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Valid candidate ID is required.",
      });
    }

    const setting = await findOrCreateSetting(candidateId);

    if (
      typeof setting.resetDailyCounterIfNeeded ===
      "function"
    ) {
      await setting.resetDailyCounterIfNeeded();
    }

    return res.json({
      success: true,
      ...serializeSetting(setting),
    });
  } catch (error) {
    console.error(
      "Get Auto Apply status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load Auto Apply settings.",
      error: error.message,
    });
  }
});

/* =========================================================
   ENABLE OR PAUSE ENGINE
   PUT /api/auto-apply/status
========================================================= */

router.put("/status", async (req, res) => {
  try {
    const {
      candidateId,
      enabled,
      dailyLimit,
      consent,
    } = req.body;

    if (!isValidId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Valid candidate ID is required.",
      });
    }

    if (typeof enabled !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "enabled must be true or false.",
      });
    }

    const setting = await findOrCreateSetting(candidateId);

    if (dailyLimit !== undefined) {
      setting.dailyLimit = clampNumber(
        dailyLimit,
        1,
        100,
        setting.dailyLimit || 25
      );
    }

    if (typeof consent === "boolean") {
      if (consent && !setting.consent) {
        setting.consentAcceptedAt = new Date();
        setting.consentRevokedAt = null;
      }

      if (!consent && setting.consent) {
        setting.consentRevokedAt = new Date();
      }

      setting.consent = consent;
    }

    if (enabled && !setting.consent) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate consent is required before enabling Auto Apply.",
      });
    }

    setting.enabled = enabled;

    setting.lastRunStatus = enabled
      ? "not_started"
      : "paused";

    setting.pausedReason = enabled
      ? ""
      : "Auto Apply Engine was paused by the candidate.";

    setting.lastRunMessage = enabled
      ? ""
      : setting.pausedReason;

    await setting.save();

    return res.json({
      success: true,

      message: setting.enabled
        ? "Auto Apply Engine activated."
        : "Auto Apply Engine paused.",

      ...serializeSetting(setting),
    });
  } catch (error) {
    console.error(
      "Update Auto Apply status error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to update Auto Apply Engine.",
      error: error.message,
    });
  }
});

/* =========================================================
   SAVE ALL SETTINGS
   PUT /api/auto-apply/settings
========================================================= */

router.put("/settings", async (req, res) => {
  try {
    const {
      candidateId,
      dailyLimit,
      minimumMatchScore,
      remoteOnly,
      easyApplyOnly,
      consent,
      preferredRoles,
      preferredLocations,
      excludedCompanies,
      excludedJobTitles,
    } = req.body;

    if (!isValidId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Valid candidate ID is required.",
      });
    }

    const setting = await findOrCreateSetting(candidateId);

    if (
      typeof setting.updatePreferences ===
      "function"
    ) {
      await setting.updatePreferences({
        dailyLimit,
        minimumMatchScore,
        remoteOnly,
        easyApplyOnly,
        consent,
        preferredRoles,
        preferredLocations,
        excludedCompanies,
        excludedJobTitles,
      });
    } else {
      if (dailyLimit !== undefined) {
        setting.dailyLimit = clampNumber(
          dailyLimit,
          1,
          100,
          setting.dailyLimit || 25
        );
      }

      if (minimumMatchScore !== undefined) {
        setting.minimumMatchScore = clampNumber(
          minimumMatchScore,
          0,
          100,
          setting.minimumMatchScore || 70
        );
      }

      if (typeof remoteOnly === "boolean") {
        setting.remoteOnly = remoteOnly;
      }

      if (typeof easyApplyOnly === "boolean") {
        setting.easyApplyOnly = easyApplyOnly;
      }

      if (preferredRoles !== undefined) {
        setting.preferredRoles =
          normalizeArray(preferredRoles);
      }

      if (preferredLocations !== undefined) {
        setting.preferredLocations =
          normalizeArray(preferredLocations);
      }

      if (excludedCompanies !== undefined) {
        setting.excludedCompanies =
          normalizeArray(excludedCompanies);
      }

      if (excludedJobTitles !== undefined) {
        setting.excludedJobTitles =
          normalizeArray(excludedJobTitles);
      }

      if (typeof consent === "boolean") {
        setting.consent = consent;

        if (!consent) {
          setting.enabled = false;
          setting.lastRunStatus = "paused";
          setting.pausedReason =
            "Candidate consent was revoked.";
        }
      }

      await setting.save();
    }

    return res.json({
      success: true,
      message:
        "Auto Apply settings saved successfully.",
      ...serializeSetting(setting),
    });
  } catch (error) {
    console.error(
      "Save Auto Apply settings error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to save Auto Apply settings.",
      error: error.message,
    });
  }
});

/* =========================================================
   GET RECENT AUTO APPLY ACTIVITY
   GET /api/auto-apply/activity/:candidateId
========================================================= */

router.get(
  "/activity/:candidateId",
  async (req, res) => {
    try {
      const { candidateId } = req.params;

      if (!isValidId(candidateId)) {
        return res.status(400).json({
          success: false,
          message: "Valid candidate ID is required.",
        });
      }

      const limit = Math.max(
        1,
        Math.min(Number(req.query.limit) || 10, 50)
      );

      const activities =
        typeof AutoApplyActivity.getRecentActivity ===
        "function"
          ? await AutoApplyActivity.getRecentActivity(
              candidateId,
              limit
            )
          : await AutoApplyActivity.find({
              candidateId,
            })
              .populate("jobId")
              .populate("applicationId")
              .sort({
                createdAt: -1,
              })
              .limit(limit)
              .lean();

      return res.json({
        success: true,
        count: activities.length,
        activities,
      });
    } catch (error) {
      console.error(
        "Get Auto Apply activity error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load Auto Apply activity.",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   RUN AUTO APPLY
   POST /api/auto-apply/run/:candidateId
========================================================= */

router.post("/run/:candidateId", async (req, res) => {
  let setting = null;

  try {
    const { candidateId } = req.params;

    if (!isValidId(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "Valid candidate ID is required.",
      });
    }

    setting = await findOrCreateSetting(candidateId);

    if (
      typeof setting.resetDailyCounterIfNeeded ===
      "function"
    ) {
      await setting.resetDailyCounterIfNeeded();
    }

    const permission =
      typeof setting.canApplyToday === "function"
        ? setting.canApplyToday()
        : {
            allowed:
              setting.enabled &&
              setting.consent &&
              setting.applicationsToday <
                setting.dailyLimit,

            reason: !setting.enabled
              ? "Auto Apply Engine is paused."
              : !setting.consent
              ? "Candidate consent is required."
              : "Daily application limit has been reached.",

            remainingApplications: Math.max(
              setting.dailyLimit -
                (setting.applicationsToday || 0),
              0
            ),
          };

    if (!permission.allowed) {
      return res.status(400).json({
        success: false,
        message: permission.reason,
        remainingApplications:
          permission.remainingApplications,
      });
    }

    const availableLimit =
      permission.remainingApplications;

    if (
      typeof setting.markRunStarted === "function"
    ) {
      await setting.markRunStarted();
    } else {
      setting.lastRunStatus = "running";
      setting.lastRunAt = new Date();
      setting.lastRunMessage = "";

      await setting.save();
    }

    const jobs = await Job.find({
      isActive: true,
    })
      .sort({
        createdAt: -1,
      })
      .limit(500)
      .lean();

    const matchedJobs = jobs
      .map((job) => ({
        job,

        matchScore: calculateMatchScore(
          job,
          setting
        ),
      }))
      .filter(
        ({ matchScore }) =>
          matchScore >=
          setting.minimumMatchScore
      )
      .sort(
        (first, second) =>
          second.matchScore -
          first.matchScore
      );

    const appliedJobs = [];
    const skippedJobs = [];
    const failedJobs = [];

    for (const matchedItem of matchedJobs) {
      if (
        appliedJobs.length >=
        availableLimit
      ) {
        break;
      }

      const {
        job,
        matchScore,
      } = matchedItem;

      const jobTitle =
        getJobTitle(job);

      const companyName =
        getCompanyName(job);

      let activity = null;

      try {
        if (
          typeof AutoApplyActivity.upsertActivity ===
          "function"
        ) {
          activity =
            await AutoApplyActivity.upsertActivity({
              candidateId,
              jobId: job._id,
              companyName,
              jobTitle,
              matchScore,
              status: "queued",
              reason: "",
            });
        } else {
          activity =
            await AutoApplyActivity.findOneAndUpdate(
              {
                candidateId,
                jobId: job._id,
              },
              {
                $set: {
                  companyName,
                  jobTitle,
                  matchScore,
                  status: "queued",
                  reason: "",
                  processedAt: null,
                },

                $setOnInsert: {
                  candidateId,
                  jobId: job._id,
                },
              },
              {
                new: true,
                upsert: true,
                runValidators: true,
              }
            );
        }

        const existingApplication =
          await Application.findOne({
            candidateId,
            jobId: job._id,
          });

        if (existingApplication) {
          skippedJobs.push({
            jobId: job._id,
            title: jobTitle,
            reason:
              "Candidate already applied to this job.",
          });

          if (
            activity &&
            typeof activity.markSkipped ===
            "function"
          ) {
            await activity.markSkipped(
              "Candidate already applied to this job."
            );
          } else if (activity) {
            activity.status = "skipped";
            activity.reason =
              "Candidate already applied to this job.";
            activity.processedAt = new Date();

            await activity.save();
          }

          continue;
        }

        const application =
          await Application.create({
            candidateId,
            jobId: job._id,
            companyName,
            jobTitle,
            matchScore,
            status: "Applied",
            autoApplied: true,
            source: "auto-apply",
            appliedAt: new Date(),
          });

        appliedJobs.push({
          applicationId:
            application._id,

          jobId:
            job._id,

          title:
            jobTitle,

          companyName,

          matchScore,
        });

        if (
          activity &&
          typeof activity.markApplied === "function"
        ) {
          await activity.markApplied(
            application._id
          );
        } else if (activity) {
          activity.status = "applied";
          activity.applicationId =
            application._id;
          activity.reason = "";
          activity.processedAt =
            new Date();

          await activity.save();
        }
      } catch (applicationError) {
        console.error(
          `Auto Apply failed for job ${job._id}:`,
          applicationError
        );

        failedJobs.push({
          jobId: job._id,
          title: jobTitle,

          reason:
            applicationError.message ||
            "Application failed.",
        });

        try {
          if (
            activity &&
            typeof activity.markFailed ===
            "function"
          ) {
            await activity.markFailed(
              applicationError.message
            );
          } else if (activity) {
            activity.status = "failed";
            activity.reason =
              applicationError.message ||
              "Application failed.";
            activity.processedAt =
              new Date();

            await activity.save();
          }
        } catch (activityError) {
          console.error(
            "Unable to save failed Auto Apply activity:",
            activityError
          );
        }
      }
    }

    if (
      typeof setting.markRunCompleted ===
      "function"
    ) {
      await setting.markRunCompleted({
        matchedCount:
          matchedJobs.length,

        appliedCount:
          appliedJobs.length,

        skippedCount:
          skippedJobs.length,

        failedCount:
          failedJobs.length,
      });
    } else {
      setting.applicationsToday =
        (setting.applicationsToday || 0) +
        appliedJobs.length;

      setting.totalApplicationsSent =
        (setting.totalApplicationsSent || 0) +
        appliedJobs.length;

      setting.totalJobsMatched =
        (setting.totalJobsMatched || 0) +
        matchedJobs.length;

      setting.totalApplicationsSkipped =
        (setting.totalApplicationsSkipped || 0) +
        skippedJobs.length;

      setting.totalApplicationsFailed =
        (setting.totalApplicationsFailed || 0) +
        failedJobs.length;

      setting.lastRunStatus =
        "completed";

      setting.lastRunAt =
        new Date();

      setting.lastRunMessage =
        appliedJobs.length > 0
          ? `${appliedJobs.length} applications submitted successfully.`
          : "No new eligible jobs were available.";

      await setting.save();
    }

    try {
      await Notification.create({
        candidateId,

        title:
          "Auto Apply Completed",

        message:
          appliedJobs.length > 0
            ? `Auto Apply submitted ${appliedJobs.length} job applications successfully.`
            : "Auto Apply completed, but no new eligible jobs were available.",

        type:
          "Job Alerts",

        read:
          false,
      });
    } catch (notificationError) {
      console.error(
        "Auto Apply notification error:",
        notificationError
      );
    }

    return res.json({
      success: true,

      message:
        appliedJobs.length > 0
          ? "Auto Apply completed successfully."
          : "Auto Apply completed, but no new applications were submitted.",

      candidateId,

      appliedCount:
        appliedJobs.length,

      skippedCount:
        skippedJobs.length,

      failedCount:
        failedJobs.length,

      totalMatchedJobs:
        matchedJobs.length,

      dailyLimit:
        setting.dailyLimit,

      applicationsToday:
        setting.applicationsToday,

      remainingApplications: Math.max(
        setting.dailyLimit -
          setting.applicationsToday,
        0
      ),

      appliedJobs,
      skippedJobs,
      failedJobs,
    });
  } catch (error) {
    console.error(
      "Auto Apply run error:",
      error
    );

    if (setting) {
      try {
        if (
          typeof setting.markRunFailed ===
          "function"
        ) {
          await setting.markRunFailed(
            error.message ||
              "Auto Apply failed."
          );
        } else {
          setting.lastRunStatus =
            "failed";

          setting.lastRunAt =
            new Date();

          setting.lastRunMessage =
            error.message ||
            "Auto Apply failed.";

          setting.totalApplicationsFailed =
            (setting.totalApplicationsFailed ||
              0) + 1;

          await setting.save();
        }
      } catch (saveError) {
        console.error(
          "Unable to save failed Auto Apply status:",
          saveError
        );
      }
    }

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Auto Apply failed.",
    });
  }
});

module.exports = router;