const mongoose = require("mongoose");

const SalaryPrediction = require(
  "../models/SalaryPrediction"
);

const Job = require("../models/Job");

const Candidate = require("../models/Candidate");


/* =========================================================
   HELPERS
========================================================= */

function normalizeText(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/[^\w\s+#.-]/g, " ")
    .replace(/\s+/g, " ");
}


function normalizeSkill(value = "") {
  return normalizeText(value)
    .replace(/\./g, "")
    .trim();
}


function uniqueStrings(values = []) {
  return [
    ...new Set(
      values
        .map((value) => String(value || "").trim())
        .filter(Boolean)
    ),
  ];
}


function parseExperience(value) {
  if (typeof value === "number") {
    return Math.max(0, value);
  }

  const numbers = String(value || "")
    .match(/\d+(\.\d+)?/g);

  if (!numbers?.length) {
    return 0;
  }

  const parsed = numbers.map(Number);

  if (parsed.length === 1) {
    return parsed[0];
  }

  return (
    parsed.reduce(
      (total, current) => total + current,
      0
    ) / parsed.length
  );
}


function percentile(sortedValues, percentileValue) {
  if (!sortedValues.length) {
    return 0;
  }

  if (sortedValues.length === 1) {
    return sortedValues[0];
  }

  const index =
    (percentileValue / 100) *
    (sortedValues.length - 1);

  const lower = Math.floor(index);
  const upper = Math.ceil(index);

  if (lower === upper) {
    return sortedValues[lower];
  }

  const weight = index - lower;

  return (
    sortedValues[lower] * (1 - weight) +
    sortedValues[upper] * weight
  );
}


function average(values = []) {
  if (!values.length) {
    return 0;
  }

  return (
    values.reduce(
      (total, current) => total + current,
      0
    ) / values.length
  );
}


function roundMoney(value) {
  return Math.round(Number(value || 0));
}


function clamp(value, minimum, maximum) {
  return Math.min(
    maximum,
    Math.max(minimum, value)
  );
}


function extractJobSkills(job) {
  const possibleSkills = [
    ...(Array.isArray(job.skills)
      ? job.skills
      : []),

    ...(Array.isArray(job.requiredSkills)
      ? job.requiredSkills
      : []),

    ...(Array.isArray(job.technologies)
      ? job.technologies
      : []),
  ];

  return uniqueStrings(
    possibleSkills.map(normalizeSkill)
  );
}


function extractJobRole(job) {
  return normalizeText(
    job.title ||
      job.role ||
      job.jobTitle ||
      job.position ||
      ""
  );
}


function extractJobLocation(job) {
  if (typeof job.location === "string") {
    return normalizeText(job.location);
  }

  if (job.location?.city) {
    return normalizeText(
      `${job.location.city} ${
        job.location.state || ""
      } ${job.location.country || ""}`
    );
  }

  return normalizeText(
    job.city ||
      job.jobLocation ||
      ""
  );
}


function extractJobExperience(job) {
  const minimum =
    Number(
      job.minimumExperience ??
        job.minExperience ??
        job.experienceMin
    );

  const maximum =
    Number(
      job.maximumExperience ??
        job.maxExperience ??
        job.experienceMax
    );

  if (
    Number.isFinite(minimum) ||
    Number.isFinite(maximum)
  ) {
    return {
      minimum:
        Number.isFinite(minimum)
          ? minimum
          : 0,

      maximum:
        Number.isFinite(maximum)
          ? maximum
          : minimum + 5,
    };
  }

  const experience =
    job.experience ||
    job.experienceLevel ||
    job.requiredExperience;

  const numbers =
    String(experience || "").match(/\d+/g);

  if (!numbers?.length) {
    return {
      minimum: 0,
      maximum: 50,
    };
  }

  if (numbers.length === 1) {
    return {
      minimum: Number(numbers[0]),
      maximum: Number(numbers[0]) + 3,
    };
  }

  return {
    minimum: Number(numbers[0]),
    maximum: Number(numbers[1]),
  };
}


/*
 IMPORTANT:

 Your Job model should preferably store:

 salary: {
   min: Number,
   max: Number,
   currency: "INR",
   period: "YEAR"
 }

 This helper also supports several existing
 field naming styles.
*/

function extractAnnualSalary(job) {
  let minimumSalary = null;
  let maximumSalary = null;

  let currency =
    job.salary?.currency ||
    job.currency ||
    "INR";

  let period =
    job.salary?.period ||
    job.salaryPeriod ||
    "YEAR";


  if (
    Number.isFinite(
      Number(job.salary?.min)
    )
  ) {
    minimumSalary =
      Number(job.salary.min);
  }


  if (
    Number.isFinite(
      Number(job.salary?.max)
    )
  ) {
    maximumSalary =
      Number(job.salary.max);
  }


  if (
    minimumSalary === null &&
    Number.isFinite(
      Number(job.minSalary)
    )
  ) {
    minimumSalary =
      Number(job.minSalary);
  }


  if (
    maximumSalary === null &&
    Number.isFinite(
      Number(job.maxSalary)
    )
  ) {
    maximumSalary =
      Number(job.maxSalary);
  }


  if (
    minimumSalary === null &&
    Number.isFinite(
      Number(job.salaryMin)
    )
  ) {
    minimumSalary =
      Number(job.salaryMin);
  }


  if (
    maximumSalary === null &&
    Number.isFinite(
      Number(job.salaryMax)
    )
  ) {
    maximumSalary =
      Number(job.salaryMax);
  }


  if (
    minimumSalary === null &&
    maximumSalary === null &&
    Number.isFinite(
      Number(job.salary)
    )
  ) {
    minimumSalary =
      Number(job.salary);

    maximumSalary =
      Number(job.salary);
  }


  if (
    minimumSalary === null ||
    maximumSalary === null
  ) {
    return null;
  }


  if (
    minimumSalary <= 0 ||
    maximumSalary <= 0
  ) {
    return null;
  }


  if (
    maximumSalary < minimumSalary
  ) {
    [
      minimumSalary,
      maximumSalary,
    ] = [
      maximumSalary,
      minimumSalary,
    ];
  }


  period =
    normalizeText(period).toUpperCase();


  let multiplier = 1;


  if (
    period === "MONTH" ||
    period === "MONTHLY"
  ) {
    multiplier = 12;
  }


  if (
    period === "WEEK" ||
    period === "WEEKLY"
  ) {
    multiplier = 52;
  }


  if (
    period === "DAY" ||
    period === "DAILY"
  ) {
    multiplier = 260;
  }


  if (
    period === "HOUR" ||
    period === "HOURLY"
  ) {
    multiplier = 2080;
  }


  return {
    minimumSalary:
      minimumSalary * multiplier,

    maximumSalary:
      maximumSalary * multiplier,

    midpoint:
      ((minimumSalary +
        maximumSalary) /
        2) *
      multiplier,

    currency:
      String(currency).toUpperCase(),
  };
}


function roleSimilarity(
  requestedRole,
  jobRole
) {
  const requestedTokens =
    new Set(
      normalizeText(requestedRole)
        .split(" ")
        .filter(Boolean)
    );

  const jobTokens =
    new Set(
      normalizeText(jobRole)
        .split(" ")
        .filter(Boolean)
    );

  if (
    requestedTokens.size === 0 ||
    jobTokens.size === 0
  ) {
    return 0;
  }

  const intersection =
    [...requestedTokens].filter(
      (token) => jobTokens.has(token)
    ).length;

  const union =
    new Set([
      ...requestedTokens,
      ...jobTokens,
    ]).size;

  return intersection / union;
}


function skillSimilarity(
  candidateSkills,
  jobSkills
) {
  if (!candidateSkills.length) {
    return 0;
  }

  const normalizedCandidateSkills =
    new Set(
      candidateSkills.map(normalizeSkill)
    );

  const normalizedJobSkills =
    new Set(
      jobSkills.map(normalizeSkill)
    );

  const matched =
    [...normalizedCandidateSkills]
      .filter((skill) =>
        normalizedJobSkills.has(skill)
      )
      .length;

  return (
    matched /
    normalizedCandidateSkills.size
  );
}


function calculateCandidatePercentile(
  salaries,
  predictedSalary
) {
  if (!salaries.length) {
    return 0;
  }

  const belowOrEqual =
    salaries.filter(
      (salary) =>
        salary <= predictedSalary
    ).length;

  return Math.round(
    (belowOrEqual /
      salaries.length) *
      100
  );
}


function calculateDemandLevel(
  matchedJobCount
) {
  if (matchedJobCount >= 100) {
    return "Very High";
  }

  if (matchedJobCount >= 50) {
    return "High";
  }

  if (matchedJobCount >= 20) {
    return "Moderate";
  }

  if (matchedJobCount >= 8) {
    return "Developing";
  }

  return "Limited Data";
}


function calculateConfidence({
  salaryRecordCount,
  roleScoreAverage,
  skillScoreAverage,
}) {
  const sampleScore =
    Math.min(
      salaryRecordCount / 50,
      1
    ) * 50;

  const roleScore =
    roleScoreAverage * 30;

  const skillScore =
    skillScoreAverage * 20;

  return Math.round(
    clamp(
      sampleScore +
        roleScore +
        skillScore,
      0,
      100
    )
  );
}


function buildSalaryBreakdown(
  predictedSalary
) {
  return {
    baseSalary:
      roundMoney(
        predictedSalary * 0.78
      ),

    performanceBonus:
      roundMoney(
        predictedSalary * 0.10
      ),

    stockCompensation:
      roundMoney(
        predictedSalary * 0.07
      ),

    otherBenefits:
      roundMoney(
        predictedSalary * 0.05
      ),
  };
}


function buildMarketPosition(
  candidatePercentile
) {
  if (candidatePercentile >= 90) {
    return "Top 10%";
  }

  if (candidatePercentile >= 75) {
    return "Top 25%";
  }

  if (candidatePercentile >= 50) {
    return "Above Median";
  }

  if (candidatePercentile >= 25) {
    return "Developing Position";
  }

  return "Entry Market Position";
}


function calculateSkillInsights({
  matchedRecords,
  candidateSkills,
  overallAverage,
}) {
  return candidateSkills
    .map((skill) => {
      const normalizedSkill =
        normalizeSkill(skill);

      const records =
        matchedRecords.filter(
          (record) =>
            record.skills.includes(
              normalizedSkill
            )
        );

      if (records.length < 3) {
        return null;
      }

      const skillAverage =
        average(
          records.map(
            (record) =>
              record.salary.midpoint
          )
        );

      const difference =
        skillAverage -
        overallAverage;

      return {
        skill,

        matchingJobs:
          records.length,

        salaryDifference:
          roundMoney(difference),

        impactPercent:
          overallAverage > 0
            ? Math.round(
                (difference /
                  overallAverage) *
                  100
              )
            : 0,
      };
    })
    .filter(Boolean)
    .sort(
      (first, second) =>
        second.impactPercent -
        first.impactPercent
    );
}


/* =========================================================
   GET CANDIDATE ID
========================================================= */

function getCandidateId(req) {
  return (
    req.user?.candidateId ||
    req.user?._id ||
    req.body?.candidateId ||
    req.query?.candidateId
  );
}


/* =========================================================
   PREDICT SALARY
========================================================= */

exports.predictSalary = async (
  req,
  res
) => {
  try {
    const candidateId =
      getCandidateId(req);

    const {
      targetRole,
      experience,
      experienceYears,
      location,
      employmentType,
      skills,
    } = req.body;


    if (
      !candidateId ||
      !mongoose.Types.ObjectId.isValid(
        candidateId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid candidate ID is required",
      });
    }


    if (
      !String(targetRole || "").trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Target role is required",
      });
    }


    const parsedExperience =
      Number.isFinite(
        Number(experienceYears)
      )
        ? Number(experienceYears)
        : parseExperience(experience);


    const candidateSkills =
      uniqueStrings(
        Array.isArray(skills)
          ? skills
          : String(skills || "")
              .split(",")
      );


    /*
     Fetch only active jobs.

     Change this query if your Job model uses
     another status field.
    */

    const jobs =
      await Job.find({
        $or: [
          { status: "active" },
          { status: "Active" },
          { isActive: true },
        ],
      })
        .lean()
        .limit(10000);


    const totalJobsAnalyzed =
      jobs.length;


    const requestedRole =
      normalizeText(targetRole);

    const requestedLocation =
      normalizeText(location);


    const marketRecords = [];


    for (const job of jobs) {
      const salary =
        extractAnnualSalary(job);

      if (!salary) {
        continue;
      }


      /*
       This implementation predicts INR
       salaries only.

       Currency conversion must use a real
       exchange-rate source before mixing
       currencies.
      */

      if (salary.currency !== "INR") {
        continue;
      }


      const jobRole =
        extractJobRole(job);

      const jobLocation =
        extractJobLocation(job);

      const jobSkills =
        extractJobSkills(job);

      const jobExperience =
        extractJobExperience(job);


      const roleScore =
        roleSimilarity(
          requestedRole,
          jobRole
        );


      const skillsScore =
        skillSimilarity(
          candidateSkills,
          jobSkills
        );


      const locationMatches =
        !requestedLocation ||
        jobLocation.includes(
          requestedLocation
        ) ||
        requestedLocation.includes(
          jobLocation
        );


      const experienceMatches =
        parsedExperience >=
          jobExperience.minimum - 1 &&
        parsedExperience <=
          jobExperience.maximum + 1;


      /*
       Weighted matching.

       Role is mandatory.

       Location and experience improve
       relevance.
      */

      if (roleScore < 0.25) {
        continue;
      }


      let matchScore =
        roleScore * 0.55 +
        skillsScore * 0.25;


      if (locationMatches) {
        matchScore += 0.10;
      }


      if (experienceMatches) {
        matchScore += 0.10;
      }


      marketRecords.push({
        jobId: job._id,

        role:
          job.title ||
          job.role ||
          targetRole,

        skills:
          jobSkills,

        salary,

        roleScore,

        skillsScore,

        locationMatches,

        experienceMatches,

        matchScore,
      });
    }


    /*
     Keep stronger matches first.
    */

    marketRecords.sort(
      (first, second) =>
        second.matchScore -
        first.matchScore
    );


    /*
     Prefer high quality matches.

     If fewer than 8 are found, expand the
     threshold while still requiring role
     relevance.
    */

    let matchedRecords =
      marketRecords.filter(
        (record) =>
          record.matchScore >= 0.55
      );


    if (matchedRecords.length < 8) {
      matchedRecords =
        marketRecords.filter(
          (record) =>
            record.matchScore >= 0.40
        );
    }


    if (matchedRecords.length < 3) {
      return res.status(422).json({
        success: false,

        code:
          "INSUFFICIENT_MARKET_DATA",

        message:
          `Not enough verified salary records are available for "${targetRole}". Add structured salary information to matching jobs before generating a prediction.`,

        marketData: {
          totalJobsAnalyzed,

          salaryRecordsFound:
            marketRecords.length,

          matchedSalaryRecords:
            matchedRecords.length,
        },
      });
    }


    const salaryValues =
      matchedRecords
        .map(
          (record) =>
            record.salary.midpoint
        )
        .sort(
          (first, second) =>
            first - second
        );


    const minimumSalary =
      salaryValues[0];


    const maximumSalary =
      salaryValues[
        salaryValues.length - 1
      ];


    const marketAverage =
      average(salaryValues);


    const medianSalary =
      percentile(
        salaryValues,
        50
      );


    const percentile25 =
      percentile(
        salaryValues,
        25
      );


    const percentile75 =
      percentile(
        salaryValues,
        75
      );


    const percentile90 =
      percentile(
        salaryValues,
        90
      );


    /*
     Weighted prediction.

     Better matching jobs influence the
     prediction more strongly.
    */

    const weightedSalaryTotal =
      matchedRecords.reduce(
        (total, record) =>
          total +
          record.salary.midpoint *
            Math.max(
              record.matchScore,
              0.1
            ),
        0
      );


    const totalWeight =
      matchedRecords.reduce(
        (total, record) =>
          total +
          Math.max(
            record.matchScore,
            0.1
          ),
        0
      );


    const predictedSalary =
      weightedSalaryTotal /
      totalWeight;


    const candidatePercentile =
      calculateCandidatePercentile(
        salaryValues,
        predictedSalary
      );


    const roleScoreAverage =
      average(
        matchedRecords.map(
          (record) =>
            record.roleScore
        )
      );


    const skillScoreAverage =
      average(
        matchedRecords.map(
          (record) =>
            record.skillsScore
        )
      );


    const confidenceScore =
      calculateConfidence({
        salaryRecordCount:
          matchedRecords.length,

        roleScoreAverage,

        skillScoreAverage,
      });


    const demandLevel =
      calculateDemandLevel(
        matchedRecords.length
      );


    const marketComparisonPercent =
      marketAverage > 0
        ? Math.round(
            ((predictedSalary -
              marketAverage) /
              marketAverage) *
              100
          )
        : 0;


    const skillInsights =
      calculateSkillInsights({
        matchedRecords,

        candidateSkills,

        overallAverage:
          marketAverage,
      });


    const salaryBreakdown =
      buildSalaryBreakdown(
        predictedSalary
      );


    const predictionDocument =
      await SalaryPrediction.create({
        candidateId,

        requestedRole:
          String(targetRole).trim(),

        resolvedRole:
          String(targetRole).trim(),

        location:
          String(location || "").trim(),

        experienceYears:
          parsedExperience,

        employmentType:
          employmentType ||
          "Full-time",

        skills:
          candidateSkills,

        prediction: {
          currency: "INR",

          period: "YEAR",

          minimumSalary:
            roundMoney(
              minimumSalary
            ),

          maximumSalary:
            roundMoney(
              maximumSalary
            ),

          marketAverage:
            roundMoney(
              marketAverage
            ),

          medianSalary:
            roundMoney(
              medianSalary
            ),

          predictedSalary:
            roundMoney(
              predictedSalary
            ),

          percentile25:
            roundMoney(
              percentile25
            ),

          percentile75:
            roundMoney(
              percentile75
            ),

          percentile90:
            roundMoney(
              percentile90
            ),

          candidatePercentile,

          confidenceScore,

          demandLevel,

          salaryRecordCount:
            matchedRecords.length,

          matchedJobCount:
            matchedRecords.length,

          totalJobsAnalyzed,
        },

        salaryBreakdown,

        skillInsights,

        marketInsights: {
          marketPosition:
            buildMarketPosition(
              candidatePercentile
            ),

          marketComparisonPercent,

          similarExperienceComparisonPercent:
            0,

          similarSkillsComparisonPercent:
            skillScoreAverage > 0
              ? Math.round(
                  skillScoreAverage *
                    100
                )
              : 0,
        },
      });


    return res.status(201).json({
      success: true,

      message:
        "Salary prediction generated successfully",

      prediction:
        predictionDocument,
    });
  } catch (error) {
    console.error(
      "SALARY PREDICTION ERROR:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Unable to generate salary prediction",

      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};


/* =========================================================
   GET LATEST PREDICTION
========================================================= */

exports.getLatestPrediction = async (
  req,
  res
) => {
  try {
    const candidateId =
      getCandidateId(req);

    if (
      !candidateId ||
      !mongoose.Types.ObjectId.isValid(
        candidateId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid candidate ID is required",
      });
    }


    const prediction =
      await SalaryPrediction
        .findOne({
          candidateId,
        })
        .sort({
          createdAt: -1,
        })
        .lean();


    return res.json({
      success: true,
      prediction:
        prediction || null,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load salary prediction",
    });
  }
};


/* =========================================================
   GET HISTORY
========================================================= */

exports.getPredictionHistory = async (
  req,
  res
) => {
  try {
    const candidateId =
      getCandidateId(req);

    if (
      !candidateId ||
      !mongoose.Types.ObjectId.isValid(
        candidateId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Valid candidate ID is required",
      });
    }


    const predictions =
      await SalaryPrediction
        .find({
          candidateId,
        })
        .sort({
          createdAt: -1,
        })
        .limit(20)
        .lean();


    return res.json({
      success: true,
      predictions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load prediction history",
    });
  }
};


/* =========================================================
   GET DASHBOARD MARKET METRICS
========================================================= */

exports.getMarketMetrics = async (
  req,
  res
) => {
  try {
    const jobs =
      await Job.find({
        $or: [
          { status: "active" },
          { status: "Active" },
          { isActive: true },
        ],
      })
        .lean()
        .limit(10000);


    let salaryRecords = 0;

    const roles = new Set();

    let latestMarketUpdate = null;


    for (const job of jobs) {
      if (extractAnnualSalary(job)) {
        salaryRecords += 1;
      }

      const role =
        extractJobRole(job);

      if (role) {
        roles.add(role);
      }

      if (
        job.updatedAt &&
        (!latestMarketUpdate ||
          new Date(job.updatedAt) >
            latestMarketUpdate)
      ) {
        latestMarketUpdate =
          new Date(job.updatedAt);
      }
    }


    return res.json({
      success: true,

      metrics: {
        totalJobsAnalyzed:
          jobs.length,

        salaryRecords,

        rolesCovered:
          roles.size,

        lastMarketUpdate:
          latestMarketUpdate,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message:
        "Unable to load market metrics",
    });
  }
};