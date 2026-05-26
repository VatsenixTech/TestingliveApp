const express = require("express");
const Job = require("../models/Job");
const Candidate = require("../models/Candidate");
const Application = require("../models/Application");

const router = express.Router();

// recruiter posts job
router.post("/", async (req, res) => {
  try {
    const job = await Job.create(req.body);

    res.status(201).json({
      message: "Job posted successfully",
      job,
    });
  } catch (error) {
    res.status(500).json({
      message: "Job post failed",
      error: error.message,
    });
  }
});

// get all active jobs
router.get("/", async (req, res) => {
  try {
    const jobs = await Job.find({ isActive: true }).sort({
      createdAt: -1,
    });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

// recommended jobs for candidate
router.get("/recommended/:candidateId", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    const candidateSkills = candidate.skills?.map((s) => s.name) || [];

    const jobs = await Job.find({
      isActive: true,
      $or: [
        { skills: { $in: candidateSkills } },
        {
          title: {
            $regex: candidate.currentRole || "",
            $options: "i",
          },
        },
        {
          location: {
            $regex:
              candidate.preferredLocation ||
              candidate.location ||
              "",
            $options: "i",
          },
        },
      ],
    }).sort({ createdAt: -1 });

    res.json(jobs);
  } catch (error) {
    res.status(500).json({
      message: "Recommended jobs failed",
      error: error.message,
    });
  }
});

// apply job manually
router.post("/:jobId/apply/:candidateId", async (req, res) => {
  try {
    const existing = await Application.findOne({
      jobId: req.params.jobId,
      candidateId: req.params.candidateId,
    });

    if (existing) {
      return res.json({
        message: "Already applied",
        application: existing,
      });
    }

    const application = await Application.create({
      jobId: req.params.jobId,
      candidateId: req.params.candidateId,
      autoApplied: false,
    });

    res.status(201).json({
      message: "Applied successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({
      message: "Apply failed",
      error: error.message,
    });
  }
});

// auto apply recommended jobs
router.post("/auto-apply/:candidateId", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.candidateId);

    if (!candidate) {
      return res.status(404).json({
        message: "Candidate not found",
      });
    }

    const candidateSkills = candidate.skills?.map((s) => s.name) || [];

    const jobs = await Job.find({
      isActive: true,
      skills: { $in: candidateSkills },
    }).limit(10);

    const applications = [];

    for (const job of jobs) {
      const existing = await Application.findOne({
        jobId: job._id,
        candidateId: candidate._id,
      });

      if (!existing) {
        const app = await Application.create({
          jobId: job._id,
          candidateId: candidate._id,
          autoApplied: true,
        });

        applications.push(app);
      }
    }

    res.json({
      message: "Auto apply completed",
      appliedCount: applications.length,
      applications,
    });
  } catch (error) {
    res.status(500).json({
      message: "Auto apply failed",
      error: error.message,
    });
  }
});

// get single job by id
// keep this near bottom, before module.exports
router.get("/:id", async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        message: "Job not found",
      });
    }

    res.json(job);
  } catch (error) {
    res.status(500).json({
      message: "Job details failed",
      error: error.message,
    });
  }
});

module.exports = router;