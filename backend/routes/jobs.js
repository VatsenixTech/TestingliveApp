const express = require("express");
const mongoose = require("mongoose");

const Job = require("../models/job");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");
const Notification = require("../models/Notification");
const AutoApplySetting = require(
  "../models/AutoApplySetting"
);

const router = express.Router();

/* =========================================================
   HELPERS
========================================================= */

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(value);
}

function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) {
    return [];
  }

  return skills
    .map((skill) => {
      if (typeof skill === "string") {
        return normalizeText(skill);
      }

      return normalizeText(
        skill?.name ||
          skill?.skillName ||
          skill?.title
      );
    })
    .filter(Boolean);
}

function normalizeStringArray(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => normalizeText(item))
      .filter(Boolean);
  }

  return [];
}

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function getJobTitle(job) {
  return (
    job?.title ||
    job?.jobTitle ||
    job?.role ||
    "Job Opportunity"
  );
}

function getJobCompany(job) {
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

function getJobSkills(job) {
  return normalizeSkills(
    job?.skills ||
      job?.requiredSkills ||
      job?.technologies ||
      []
  );
}

function isRemoteJob(job) {
  const workMode = normalizeText(
    job?.workMode ||
      job?.jobType ||
      job?.location
  );

  return (
    job?.remoteOnly === true ||
    job?.isRemote === true ||
    job?.remote === true ||
    workMode.includes("remote") ||
    workMode.includes("work from home")
  );
}

function isEasyApplyJob(job) {
  return (
    job?.easyApply === true ||
    job?.isEasyApply === true ||
    job?.quickApply === true
  );
}

/* =========================================================
   REAL MATCH SCORE
========================================================= */

function calculateMatchScore(
  candidate,
  job,
  setting
) {
  let score = 0;

  const candidateSkills = normalizeSkills(
    candidate?.skills
  );

  const jobSkills = getJobSkills(job);

  const candidateRole = normalizeText(
    candidate?.currentRole ||
      candidate?.role ||
      candidate?.jobTitle
  );

  const jobTitle = normalizeText(
    getJobTitle(job)
  );

  const candidateLocation = normalizeText(
    candidate?.preferredLocation ||
      candidate?.location
  );

  const jobLocation = normalizeText(
    getJobLocation(job)
  );

  const preferredRoles = normalizeStringArray(
    setting?.preferredRoles
  );

  const preferredLocations =
    normalizeStringArray(
      setting?.preferredLocations
    );

  /*
    Skills contribute up to 45 points.
  */

  if (
    candidateSkills.length > 0 &&
    jobSkills.length > 0
  ) {
    const matchedSkills = candidateSkills.filter(
      (candidateSkill) =>
        jobSkills.some(
          (jobSkill) =>
            jobSkill.includes(candidateSkill) ||
            candidateSkill.includes(jobSkill)
        )
    );

    const skillPercentage =
      matchedSkills.length /
      Math.max(jobSkills.length, 1);

    score += Math.round(
      Math.min(skillPercentage, 1) * 45
    );
  }

  /*
    Candidate current role contributes 20 points.
  */

  if (
    candidateRole &&
    jobTitle &&
    (
      jobTitle.includes(candidateRole) ||
      candidateRole.includes(jobTitle)
    )
  ) {
    score += 20;
  }

  /*
    Preferred roles contribute 15 points.
  */

  if (preferredRoles.length > 0) {
    const preferredRoleMatched =
      preferredRoles.some(
        (role) =>
          jobTitle.includes(role) ||
          role.includes(jobTitle)
      );

    if (preferredRoleMatched) {
      score += 15;
    }
  }

  /*
    Location contributes 10 points.
  */

  if (
    candidateLocation &&
    jobLocation &&
    (
      jobLocation.includes(candidateLocation) ||
      candidateLocation.includes(jobLocation)
    )
  ) {
    score += 10;
  }

  /*
    Preferred locations contribute 10 points.
  */

  if (preferredLocations.length > 0) {
    const preferredLocationMatched =
      preferredLocations.some(
        (location) =>
          jobLocation.includes(location) ||
          location.includes(jobLocation)
      );

    if (preferredLocationMatched) {
      score += 10;
    }
  }

  /*
    Enforce remote-only preference.
  */

  if (
    setting?.remoteOnly &&
    !isRemoteJob(job)
  ) {
    return 0;
  }

  /*
    Enforce easy-apply-only preference.
  */

  if (
    setting?.easyApplyOnly &&
    !isEasyApplyJob(job)
  ) {
    return 0;
  }

  /*
    Give small bonus when preference matches.
  */

  if (
    setting?.remoteOnly &&
    isRemoteJob(job)
  ) {
    score += 5;
  }

  if (
    setting?.easyApplyOnly &&
    isEasyApplyJob(job)
  ) {
    score += 5;
  }

  return Math.max(
    0,
    Math.min(score, 100)
  );
}

/* =========================================================
   RECRUITER POSTS JOB
   POST /api/jobs
========================================================= */

router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);

    return res.status(201).json({
      success: true,
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    console.error("Job post error:", error);

    return res.status(500).json({
      success: false,
      message: "Job post failed",
      error: error.message,
    });
  }
});

/* =========================================================
   GET ALL ACTIVE JOBS
   GET /api/jobs
========================================================= */

router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({
      isActive: true,
    }).sort({
      createdAt: -1,
    });

    return res.json(jobs);
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to load jobs",
      error: error.message,
    });
  }
});

/* =========================================================
   RECOMMENDED JOBS FOR CANDIDATE
   GET /api/jobs/recommended/:candidateId
========================================================= */

router.get(
  "/recommended/:candidateId",
  async (req, res) => {
    try {
      const { candidateId } = req.params;

      if (!isValidObjectId(candidateId)) {
        return res.status(400).json({
          success: false,
          message:
            "Valid candidate ID is required",
        });
      }

      const candidate =
        await Candidate.findById(candidateId);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      let setting =
        await AutoApplySetting.findOne({
          candidateId,
        });

      if (!setting) {
        setting =
          await AutoApplySetting.create({
            candidateId,
          });
      }

      const jobs = await Job.find({
        isActive: true,
      })
        .sort({
          createdAt: -1,
        })
        .limit(500)
        .lean();

      const recommendedJobs = jobs
        .map((job) => {
          const matchScore =
            calculateMatchScore(
              candidate,
              job,
              setting
            );

          return {
            ...job,
            matchScore,
          };
        })
        .filter(
          (job) =>
            job.matchScore >=
            setting.minimumMatchScore
        )
        .sort(
          (first, second) =>
            second.matchScore -
            first.matchScore
        );

      setting.totalJobsMatched =
        recommendedJobs.length;

      await setting.save();

      return res.json({
        success: true,
        count: recommendedJobs.length,
        jobs: recommendedJobs,
      });
    } catch (error) {
      console.error(
        "Recommended jobs error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Recommended jobs failed",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   APPLY TO JOB MANUALLY
   POST /api/jobs/:jobId/apply/:candidateId
========================================================= */

router.post(
  "/:jobId/apply/:candidateId",
  async (req, res) => {
    try {
      const {
        jobId,
        candidateId,
      } = req.params;

      if (
        !isValidObjectId(jobId) ||
        !isValidObjectId(candidateId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Valid job ID and candidate ID are required",
        });
      }

      const [
        candidate,
        job,
      ] = await Promise.all([
        Candidate.findById(candidateId),
        Job.findById(jobId),
      ]);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      if (!job) {
        return res.status(404).json({
          success: false,
          message: "Job not found",
        });
      }

      if (!job.isActive) {
        return res.status(400).json({
          success: false,
          message:
            "This job is no longer active",
        });
      }

      const existing =
        await Application.findOne({
          jobId,
          candidateId,
        });

      if (existing) {
        return res.json({
          success: true,
          alreadyApplied: true,
          message: "Already applied",
          application: existing,
        });
      }

      const application =
        await Application.create({
          jobId,
          candidateId,
          jobTitle: getJobTitle(job),
          company: getJobCompany(job),
          status: "applied",
          source: "manual",
          autoApplied: false,
          appliedAt: new Date(),
        });

      await Notification.create({
        candidateId,
        title: "Application Submitted",
        message: `Your application for ${getJobTitle(
          job
        )} at ${getJobCompany(
          job
        )} was submitted successfully.`,
        type: "Job Alerts",
        read: false,
      });

      return res.status(201).json({
        success: true,
        message: "Applied successfully",
        application,
      });
    } catch (error) {
      console.error(
        "Manual apply error:",
        error
      );

      return res.status(500).json({
        success: false,
        message: "Apply failed",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   AUTO APPLY RECOMMENDED JOBS
   POST /api/jobs/auto-apply/:candidateId
========================================================= */

router.post(
  "/auto-apply/:candidateId",
  async (req, res) => {
    let setting = null;

    try {
      const { candidateId } =
        req.params;

      if (!isValidObjectId(candidateId)) {
        return res.status(400).json({
          success: false,
          message:
            "Valid candidate ID is required",
        });
      }

      const candidate =
        await Candidate.findById(candidateId);

      if (!candidate) {
        return res.status(404).json({
          success: false,
          message: "Candidate not found",
        });
      }

      setting =
        await AutoApplySetting.findOne({
          candidateId,
        });

      if (!setting) {
        return res.status(404).json({
          success: false,
          message:
            "Auto Apply settings not found. Save your settings first.",
        });
      }

      if (!setting.enabled) {
        return res.status(400).json({
          success: false,
          message:
            "Auto Apply Engine is paused",
        });
      }

      if (!setting.consent) {
        return res.status(400).json({
          success: false,
          message:
            "Candidate consent is required before Auto Apply can run",
        });
      }

      const today = getTodayKey();

      if (setting.counterDate !== today) {
        setting.counterDate = today;
        setting.applicationsToday = 0;
      }

      const applicationsToday =
        setting.applicationsToday || 0;

      const remainingLimit = Math.max(
        setting.dailyLimit -
          applicationsToday,
        0
      );

      if (remainingLimit <= 0) {
        return res.status(400).json({
          success: false,
          message:
            "Daily application limit reached",
          dailyLimit: setting.dailyLimit,
          applicationsToday,
          remainingApplications: 0,
        });
      }

      setting.lastRunStatus = "running";
      setting.lastRunAt = new Date();
      setting.lastRunMessage = "";

      await setting.save();

      const jobs = await Job.find({
        isActive: true,
      })
        .sort({
          createdAt: -1,
        })
        .limit(500);

      const recommendedJobs = jobs
        .map((job) => ({
          job,
          matchScore:
            calculateMatchScore(
              candidate,
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

      const applications = [];
      const skippedJobs = [];
      const failedJobs = [];

      for (
        const recommendedItem of
        recommendedJobs
      ) {
        if (
          applications.length >=
          remainingLimit
        ) {
          break;
        }

        const {
          job,
          matchScore,
        } = recommendedItem;

        try {
          const existing =
            await Application.findOne({
              jobId: job._id,
              candidateId,
            });

          if (existing) {
            skippedJobs.push({
              jobId: job._id,
              title: getJobTitle(job),
              reason: "Already applied",
            });

            continue;
          }

          const application =
            await Application.create({
              jobId: job._id,
              candidateId,
              jobTitle: getJobTitle(job),
              company: getJobCompany(job),
              status: "applied",
              source: "auto_apply",
              autoApplied: true,
              matchScore,
              appliedAt: new Date(),
            });

          applications.push({
            application,
            job: {
              _id: job._id,
              title: getJobTitle(job),
              company: getJobCompany(job),
              location: getJobLocation(job),
            },
            matchScore,
          });
        } catch (applicationError) {
          console.error(
            `Auto Apply failed for job ${job._id}:`,
            applicationError
          );

          failedJobs.push({
            jobId: job._id,
            title: getJobTitle(job),
            reason:
              applicationError.message,
          });
        }
      }

      const appliedCount =
        applications.length;

      setting.applicationsToday =
        applicationsToday +
        appliedCount;

      setting.totalApplicationsSent =
        (
          setting.totalApplicationsSent ||
          0
        ) + appliedCount;

      setting.totalJobsMatched =
        recommendedJobs.length;

      setting.totalApplicationsFailed =
        (
          setting.totalApplicationsFailed ||
          0
        ) + failedJobs.length;

      setting.lastRunAt = new Date();
      setting.lastRunStatus =
        "completed";

      setting.lastRunMessage =
        appliedCount > 0
          ? `${appliedCount} applications submitted successfully.`
          : "No new eligible jobs were available.";

      await setting.save();

      await Notification.create({
        candidateId,
        title: "Auto Apply Completed",
        message:
          appliedCount > 0
            ? `Auto Apply submitted ${appliedCount} job applications successfully.`
            : "Auto Apply completed, but no new eligible jobs were available.",
        type: "Job Alerts",
        read: false,
      });

      return res.json({
        success: true,
        message:
          appliedCount > 0
            ? "Auto Apply completed successfully"
            : "No new eligible jobs were found",

        appliedCount,

        totalMatchedJobs:
          recommendedJobs.length,

        skippedCount:
          skippedJobs.length,

        failedCount:
          failedJobs.length,

        dailyLimit:
          setting.dailyLimit,

        applicationsToday:
          setting.applicationsToday,

        remainingApplications:
          Math.max(
            setting.dailyLimit -
              setting.applicationsToday,
            0
          ),

        applications,
        skippedJobs,
        failedJobs,
      });
    } catch (error) {
      console.error(
        "Auto Apply error:",
        error
      );

      if (setting) {
        try {
          setting.lastRunStatus =
            "failed";

          setting.lastRunAt =
            new Date();

          setting.lastRunMessage =
            error.message ||
            "Auto Apply failed";

          setting.totalApplicationsFailed =
            (
              setting.totalApplicationsFailed ||
              0
            ) + 1;

          await setting.save();
        } catch (settingError) {
          console.error(
            "Unable to update failed Auto Apply status:",
            settingError
          );
        }
      }

      return res.status(500).json({
        success: false,
        message: "Auto apply failed",
        error: error.message,
      });
    }
  }
);

/* =========================================================
   GET SINGLE JOB
   GET /api/jobs/:id

   Keep this route at the bottom because "/:id" can otherwise
   capture routes such as "/recommended".
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Valid job ID is required",
      });
    }

    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Job not found",
      });
    }

    return res.json(job);
  } catch (error) {
    console.error(
      "Job details error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Job details failed",
      error: error.message,
    });
  }
});

module.exports = router;