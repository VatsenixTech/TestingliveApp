const mongoose = require("mongoose");

const Candidate =
  require("../models/Candidate");

const Job =
  require("../models/Job");

const CandidateJobAlert =
  require("../models/CandidateJobAlert");


/* =========================================================
   HELPERS
========================================================= */

function isValidObjectId(value) {
  return mongoose.Types.ObjectId.isValid(
    String(value || "")
  );
}


function normalize(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}


function normalizeArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values
        .map((item) => {
          if (
            typeof item ===
            "string"
          ) {
            return normalize(item);
          }

          return normalize(
            item?.name ||
            item?.skill ||
            item?.title
          );
        })
        .filter(Boolean)
    ),
  ];
}


function candidateSkills(candidate) {
  return normalizeArray(
    candidate?.skills ||
    candidate?.technicalSkills ||
    candidate?.primarySkills ||
    []
  );
}


function jobSkills(job) {
  return normalizeArray(
    job?.requiredSkills ||
    job?.skills ||
    job?.technicalSkills ||
    []
  );
}


function getJobTitle(job) {
  return String(
    job?.title ||
    job?.jobTitle ||
    ""
  ).trim();
}


function getCompanyName(job) {
  if (
    typeof job?.company ===
    "string"
  ) {
    return job.company;
  }

  return (
    job?.companyName ||
    job?.company?.name ||
    job?.employerName ||
    ""
  );
}


function getCompanyLogo(job) {
  return (
    job?.companyLogo ||
    job?.logo ||
    job?.company?.logo ||
    ""
  );
}


function getLocation(job) {
  if (
    typeof job?.location ===
    "string"
  ) {
    return job.location;
  }

  return [
    job?.location?.city,
    job?.location?.state,
    job?.location?.country,
  ]
    .filter(Boolean)
    .join(", ");
}


function getSalaryMin(job) {
  return Number(
    job?.salaryMin ||
    job?.minimumSalary ||
    job?.salary?.min ||
    0
  );
}


function getSalaryMax(job) {
  return Number(
    job?.salaryMax ||
    job?.maximumSalary ||
    job?.salary?.max ||
    0
  );
}


function getCandidateSalary(candidate) {
  return Number(
    candidate?.currentSalary ||
    candidate?.annualSalary ||
    candidate?.salary ||
    0
  );
}


function getClosingDate(job) {
  return (
    job?.closingDate ||
    job?.applicationDeadline ||
    job?.deadline ||
    null
  );
}


function calculateMatch({
  candidate,
  job,
}) {
  const candidateSkillList =
    candidateSkills(candidate);

  const requiredSkillList =
    jobSkills(job);

  const matchedSkills =
    requiredSkillList.filter(
      (skill) =>
        candidateSkillList.includes(
          skill
        )
    );

  const missingSkills =
    requiredSkillList.filter(
      (skill) =>
        !candidateSkillList.includes(
          skill
        )
    );

  const skillScore =
    requiredSkillList.length > 0
      ? (
          matchedSkills.length /
          requiredSkillList.length
        ) * 65
      : 0;

  const candidateRole =
    normalize(
      candidate?.role ||
      candidate?.jobTitle ||
      candidate?.currentRole
    );

  const roleMatched =
    candidateRole &&
    normalize(
      getJobTitle(job)
    ).includes(candidateRole);

  const roleScore =
    roleMatched ? 20 : 0;

  const candidateLocation =
    normalize(
      typeof candidate?.location ===
      "string"
        ? candidate.location
        : candidate?.location?.city ||
          candidate?.city
    );

  const jobLocation =
    normalize(
      getLocation(job)
    );

  const locationMatched =
    candidateLocation &&
    jobLocation.includes(
      candidateLocation
    );

  const locationScore =
    locationMatched ? 10 : 0;

  const employmentMatched =
    !candidate?.employmentType ||
    !job?.employmentType ||
    normalize(
      candidate.employmentType
    ) ===
      normalize(
        job.employmentType
      );

  const employmentScore =
    employmentMatched ? 5 : 0;

  const score =
    Math.min(
      Math.round(
        skillScore +
        roleScore +
        locationScore +
        employmentScore
      ),
      100
    );

  return {
    score,
    matchedSkills,
    missingSkills,
  };
}


function calculateSalaryIncrease({
  candidate,
  job,
}) {
  const currentSalary =
    getCandidateSalary(candidate);

  const maximumSalary =
    getSalaryMax(job);

  if (
    currentSalary <= 0 ||
    maximumSalary <=
      currentSalary
  ) {
    return 0;
  }

  return Math.round(
    (
      (
        maximumSalary -
        currentSalary
      ) /
      currentSalary
    ) * 100
  );
}


function resolveAlertType({
  score,
  salaryIncreasePercent,
  closingDate,
}) {
  if (closingDate) {
    const milliseconds =
      new Date(closingDate) -
      new Date();

    const daysRemaining =
      Math.ceil(
        milliseconds /
        86400000
      );

    if (
      daysRemaining >= 0 &&
      daysRemaining <= 3
    ) {
      return "closing_soon";
    }
  }

  if (
    salaryIncreasePercent >= 20
  ) {
    return "salary_upgrade";
  }

  if (score >= 90) {
    return "high_match";
  }

  if (score >= 65) {
    return "ai_recommended";
  }

  return "job_match";
}


/* =========================================================
   GENERATE ALERTS FROM REAL JOBS
========================================================= */

exports.generateAlerts =
  async (req, res) => {
    try {
      const {
        candidateId,
      } = req.params;

      if (
        !isValidObjectId(
          candidateId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Valid candidate ID is required",
          });
      }

      const candidate =
        await Candidate.findById(
          candidateId
        ).lean();

      if (!candidate) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Candidate was not found",
          });
      }

      const jobs =
        await Job.find({
          isDeleted: {
            $ne: true,
          },

          $or: [
            {
              status: "active",
            },

            {
              isActive: true,
            },

            {
              status: {
                $exists: false,
              },
            },
          ],
        })
          .sort({
            createdAt: -1,
          })
          .limit(1000)
          .lean();

      let created = 0;
      let updated = 0;
      let ignored = 0;

      for (const job of jobs) {
        const match =
          calculateMatch({
            candidate,
            job,
          });

        /*
         * Do not create meaningless
         * alerts for very poor matches.
         */
        if (match.score < 35) {
          ignored += 1;
          continue;
        }

        const salaryIncreasePercent =
          calculateSalaryIncrease({
            candidate,
            job,
          });

        const closingDate =
          getClosingDate(job);

        const type =
          resolveAlertType({
            score:
              match.score,

            salaryIncreasePercent,

            closingDate,
          });

        const existingAlert =
          await CandidateJobAlert.findOne({
            candidateId,
            jobId: job._id,
          });

        if (existingAlert) {
          existingAlert.type =
            type;

          existingAlert.matchScore =
            match.score;

          existingAlert.matchedSkills =
            match.matchedSkills;

          existingAlert.missingSkills =
            match.missingSkills;

          existingAlert.salaryIncreasePercent =
            salaryIncreasePercent;

          existingAlert.generatedAt =
            new Date();

          await existingAlert.save();

          updated += 1;
          continue;
        }

        await CandidateJobAlert.create({
          candidateId,
          jobId: job._id,

          recruiterId:
            job?.recruiterId ||
            null,

          type,

          matchScore:
            match.score,

          matchedSkills:
            match.matchedSkills,

          missingSkills:
            match.missingSkills,

          salaryIncreasePercent,

          generatedAt:
            new Date(),
        });

        created += 1;
      }

      return res.json({
        success: true,

        message:
          "Real job alerts generated successfully",

        result: {
          jobsAnalyzed:
            jobs.length,

          created,

          updated,

          ignored,
        },
      });
    } catch (error) {
      console.error(
        "Generate job alerts error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to generate job alerts",

          error:
            process.env.NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }
  };


/* =========================================================
   GET DASHBOARD
========================================================= */

exports.getCandidateAlerts =
  async (req, res) => {
    try {
      const {
        candidateId,
      } = req.params;

      if (
        !isValidObjectId(
          candidateId
        )
      ) {
        return res
          .status(400)
          .json({
            success: false,
            message:
              "Valid candidate ID is required",
          });
      }

      const {
        type = "all",
        search = "",
        location = "",
        sort = "newest",
        page = 1,
        limit = 20,
      } = req.query;

      const alertMatch = {
        candidateId:
          new mongoose.Types.ObjectId(
            candidateId
          ),

        isDismissed: false,
      };

      if (
        type !== "all"
      ) {
        if (type === "saved") {
          alertMatch.isSaved = true;
        } else {
          alertMatch.type = type;
        }
      }

      const safePage =
        Math.max(
          Number(page) || 1,
          1
        );

      const safeLimit =
        Math.min(
          Math.max(
            Number(limit) || 20,
            1
          ),
          100
        );

      const pipeline = [
        {
          $match:
            alertMatch,
        },

        {
          $lookup: {
            from:
              Job.collection.name,

            localField:
              "jobId",

            foreignField:
              "_id",

            as: "job",
          },
        },

        {
          $unwind: {
            path: "$job",
            preserveNullAndEmptyArrays:
              false,
          },
        },
      ];

      if (
        String(search).trim()
      ) {
        const regularExpression =
          new RegExp(
            String(search).trim(),
            "i"
          );

        pipeline.push({
          $match: {
            $or: [
              {
                "job.title":
                  regularExpression,
              },

              {
                "job.jobTitle":
                  regularExpression,
              },

              {
                "job.companyName":
                  regularExpression,
              },

              {
                "job.company.name":
                  regularExpression,
              },

              {
                "job.skills":
                  regularExpression,
              },

              {
                "job.requiredSkills":
                  regularExpression,
              },
            ],
          },
        });
      }

      if (
        String(location).trim()
      ) {
        pipeline.push({
          $match: {
            $or: [
              {
                "job.location": {
                  $regex:
                    String(
                      location
                    ).trim(),

                  $options: "i",
                },
              },

              {
                "job.location.city": {
                  $regex:
                    String(
                      location
                    ).trim(),

                  $options: "i",
                },
              },
            ],
          },
        });
      }

      const sortStage =
        sort ===
        "highest_match"
          ? {
              matchScore: -1,
              createdAt: -1,
            }
          : sort ===
            "highest_salary"
          ? {
              "job.salaryMax": -1,
              createdAt: -1,
            }
          : {
              createdAt: -1,
            };

      pipeline.push({
        $sort: sortStage,
      });

      const dataPipeline = [
        ...pipeline,

        {
          $skip:
            (
              safePage -
              1
            ) *
            safeLimit,
        },

        {
          $limit:
            safeLimit,
        },
      ];

      const [
        alerts,
        totalResult,
        counts,
        todayCount,
        companies,
        candidate,
      ] =
        await Promise.all([
          CandidateJobAlert.aggregate(
            dataPipeline
          ),

          CandidateJobAlert.aggregate([
            ...pipeline,

            {
              $count:
                "total",
            },
          ]),

          CandidateJobAlert.aggregate([
            {
              $match: {
                candidateId:
                  new mongoose.Types.ObjectId(
                    candidateId
                  ),

                isDismissed:
                  false,
              },
            },

            {
              $group: {
                _id: "$type",
                count: {
                  $sum: 1,
                },
              },
            },
          ]),

          CandidateJobAlert.countDocuments({
            candidateId,

            isDismissed:
              false,

            createdAt: {
              $gte:
                new Date(
                  new Date()
                    .setHours(
                      0,
                      0,
                      0,
                      0
                    )
                ),
            },
          }),

          CandidateJobAlert.aggregate([
            {
              $match: {
                candidateId:
                  new mongoose.Types.ObjectId(
                    candidateId
                  ),

                isDismissed:
                  false,
              },
            },

            {
              $lookup: {
                from:
                  Job.collection.name,

                localField:
                  "jobId",

                foreignField:
                  "_id",

                as: "job",
              },
            },

            {
              $unwind:
                "$job",
            },

            {
              $group: {
                _id: {
                  $ifNull: [
                    "$job.companyName",
                    "$job.company.name",
                  ],
                },
              },
            },

            {
              $match: {
                _id: {
                  $nin: [
                    null,
                    "",
                  ],
                },
              },
            },
          ]),

          Candidate.findById(
            candidateId
          )
            .select(
              "notificationPreferences"
            )
            .lean(),
        ]);

      const countMap =
        Object.fromEntries(
          counts.map(
            (item) => [
              item._id,
              item.count,
            ]
          )
        );

      const total =
        totalResult?.[0]
          ?.total || 0;

      const maximumSalaryUpgrade =
        alerts.reduce(
          (
            maximum,
            item
          ) =>
            Math.max(
              maximum,
              Number(
                item
                  .salaryIncreasePercent ||
                0
              )
            ),
          0
        );

      const formattedAlerts =
        alerts.map(
          (alert) => ({
            _id:
              alert._id,

            type:
              alert.type,

            matchScore:
              alert.matchScore,

            matchedSkills:
              alert.matchedSkills,

            missingSkills:
              alert.missingSkills,

            salaryIncreasePercent:
              alert.salaryIncreasePercent,

            isRead:
              alert.isRead,

            isSaved:
              alert.isSaved,

            createdAt:
              alert.createdAt,

            job: {
              _id:
                alert.job._id,

              title:
                getJobTitle(
                  alert.job
                ),

              companyName:
                getCompanyName(
                  alert.job
                ),

              companyLogo:
                getCompanyLogo(
                  alert.job
                ),

              location:
                getLocation(
                  alert.job
                ),

              employmentType:
                alert.job
                  ?.employmentType ||
                alert.job
                  ?.jobType ||
                "",

              salaryMin:
                getSalaryMin(
                  alert.job
                ),

              salaryMax:
                getSalaryMax(
                  alert.job
                ),

              requiredSkills:
                jobSkills(
                  alert.job
                ),

              closingDate:
                getClosingDate(
                  alert.job
                ),

              verifiedCompany:
                Boolean(
                  alert.job
                    ?.verifiedCompany ||
                  alert.job
                    ?.company
                    ?.verified
                ),
            },
          })
        );

      const preferences =
        candidate
          ?.notificationPreferences ||
        {};

      return res.json({
        success: true,

        alerts:
          formattedAlerts,

        summary: {
          totalAlerts:
            total,

          newAlertsToday:
            todayCount,

          highMatchJobs:
            countMap
              .high_match ||
            0,

          urgentJobs:
            countMap
              .closing_soon ||
            0,

          salaryUpgrade:
            maximumSalaryUpgrade,

          companiesHiring:
            companies.length,

          aiRecommended:
            countMap
              .ai_recommended ||
            0,

          savedAlerts:
            await CandidateJobAlert.countDocuments({
              candidateId,
              isDismissed:
                false,
              isSaved: true,
            }),
        },

        filterCounts: {
          all:
            total,

          high_match:
            countMap
              .high_match ||
            0,

          closing_soon:
            countMap
              .closing_soon ||
            0,

          salary_upgrade:
            countMap
              .salary_upgrade ||
            0,

          recruiter_activity:
            countMap
              .recruiter_activity ||
            0,

          interview_alert:
            countMap
              .interview_alert ||
            0,

          saved:
            await CandidateJobAlert.countDocuments({
              candidateId,
              isDismissed:
                false,
              isSaved: true,
            }),
        },

        notificationChannels: {
          email:
            preferences
              ?.email !==
            false,

          push:
            preferences
              ?.push !==
            false,

          sms:
            preferences
              ?.sms ===
            true,

          whatsapp:
            preferences
              ?.whatsapp ===
            true,
        },

        pagination: {
          page:
            safePage,

          limit:
            safeLimit,

          total,

          pages:
            Math.ceil(
              total /
              safeLimit
            ),
        },
      });
    } catch (error) {
      console.error(
        "Get job alerts error:",
        error
      );

      return res
        .status(500)
        .json({
          success: false,

          message:
            "Unable to load job alerts",

          error:
            process.env.NODE_ENV ===
            "development"
              ? error.message
              : undefined,
        });
    }
  };


/* =========================================================
   UPDATE SINGLE ALERT
========================================================= */

exports.markAlertRead =
  async (req, res) => {
    try {
      const alert =
        await CandidateJobAlert.findByIdAndUpdate(
          req.params.alertId,

          {
            $set: {
              isRead: true,
            },
          },

          {
            new: true,
          }
        );

      if (!alert) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Alert not found",
          });
      }

      return res.json({
        success: true,
        alert,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to update alert",
        });
    }
  };


exports.toggleSavedAlert =
  async (req, res) => {
    try {
      const alert =
        await CandidateJobAlert.findById(
          req.params.alertId
        );

      if (!alert) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Alert not found",
          });
      }

      alert.isSaved =
        !alert.isSaved;

      await alert.save();

      return res.json({
        success: true,
        alert,
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to save alert",
        });
    }
  };


exports.dismissAlert =
  async (req, res) => {
    try {
      const alert =
        await CandidateJobAlert.findByIdAndUpdate(
          req.params.alertId,

          {
            $set: {
              isDismissed:
                true,
            },
          },

          {
            new: true,
          }
        );

      if (!alert) {
        return res
          .status(404)
          .json({
            success: false,
            message:
              "Alert not found",
          });
      }

      return res.json({
        success: true,
        message:
          "Alert dismissed",
      });
    } catch (error) {
      return res
        .status(500)
        .json({
          success: false,
          message:
            "Unable to dismiss alert",
        });
    }
  };