const mongoose = require("mongoose");

/* =========================================================
   CONSTANTS
========================================================= */

const INTERVIEW_TYPES = [
  "Technical",
  "HR",
  "Mixed",
];

const QUESTION_CATEGORIES = [
  "Technical",
  "HR",
  "Behavioral",
];

const QUESTION_DIFFICULTIES = [
  "Easy",
  "Medium",
  "Advanced",
];

const SESSION_STATUSES = [
  "created",
  "in-progress",
  "completed",
  "cancelled",
];

const ALLOWED_QUESTION_COUNTS = [
  5,
  10,
  15,
  20,
];

/* =========================================================
   HELPERS
========================================================= */

function normalizeStringArray(values) {
  if (!Array.isArray(values)) {
    return [];
  }

  return [
    ...new Set(
      values
        .map((value) =>
          String(value || "").trim()
        )
        .filter(Boolean)
    ),
  ];
}

function clampScore(value) {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  const score = Number(value);

  if (!Number.isFinite(score)) {
    return null;
  }

  return Math.min(
    100,
    Math.max(0, score)
  );
}

function calculateAverage(values) {
  const validValues = values
    .map((value) => clampScore(value))
    .filter(
      (value) => value !== null
    );

  if (validValues.length === 0) {
    return null;
  }

  const total = validValues.reduce(
    (sum, value) => sum + value,
    0
  );

  return Number(
    (
      total / validValues.length
    ).toFixed(2)
  );
}

/* =========================================================
   INTERVIEW QUESTION SUB-SCHEMA
========================================================= */

const interviewQuestionSchema =
  new mongoose.Schema(
    {
      question: {
        type: String,
        required: true,
        trim: true,
        maxlength: 3000,
      },

      category: {
        type: String,
        enum: {
          values:
            QUESTION_CATEGORIES,
          message:
            "{VALUE} is not a valid question category.",
        },
        required: true,
      },

      difficulty: {
        type: String,
        enum: {
          values:
            QUESTION_DIFFICULTIES,
          message:
            "{VALUE} is not a valid difficulty.",
        },
        default: "Medium",
      },

      answer: {
        type: String,
        default: "",
        trim: true,
        maxlength: 10000,
      },

      answerDuration: {
        type: Number,
        default: 0,
        min: 0,
      },

      technicalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      communicationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      overallScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      feedback: {
        type: String,
        default: "",
        trim: true,
        maxlength: 5000,
      },

      strengths: {
        type: [String],
        default: [],
      },

      improvements: {
        type: [String],
        default: [],
      },

      answeredAt: {
        type: Date,
        default: null,
      },

      isAnswered: {
        type: Boolean,
        default: false,
      },

      metadata: {
        type:
          mongoose.Schema.Types.Mixed,
        default: {},
      },
    },
    {
      _id: true,
      timestamps: false,
    }
  );

/* =========================================================
   QUESTION VALIDATION
========================================================= */

interviewQuestionSchema.pre(
  "validate",
  function () {
    this.strengths =
      normalizeStringArray(
        this.strengths
      );

    this.improvements =
      normalizeStringArray(
        this.improvements
      );

    this.technicalScore =
      clampScore(
        this.technicalScore
      );

    this.communicationScore =
      clampScore(
        this.communicationScore
      );

    this.confidenceScore =
      clampScore(
        this.confidenceScore
      );

    this.overallScore =
      clampScore(
        this.overallScore
      );

    if (
      this.answer &&
      this.answer.trim()
    ) {
      this.isAnswered = true;

      if (!this.answeredAt) {
        this.answeredAt =
          new Date();
      }
    }
  }
);

/* =========================================================
   INTERVIEW SESSION SCHEMA
========================================================= */

const interviewSessionSchema =
  new mongoose.Schema(
    {
      candidateId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Candidate",
        required: true,
        index: true,
      },

      role: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      experienceLevel: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
      },

      interviewType: {
        type: String,
        enum: {
          values:
            INTERVIEW_TYPES,
          message:
            "{VALUE} is not a valid interview type.",
        },
        required: true,
      },

      questionCount: {
        type: Number,
        enum: {
          values:
            ALLOWED_QUESTION_COUNTS,
          message:
            "{VALUE} is not a valid question count.",
        },
        required: true,
      },

      durationMinutes: {
        type: Number,
        default: 30,
        min: 1,
        max: 180,
      },

      status: {
        type: String,
        enum: {
          values:
            SESSION_STATUSES,
          message:
            "{VALUE} is not a valid interview status.",
        },
        default: "created",
        index: true,
      },

      currentQuestionIndex: {
        type: Number,
        default: 0,
        min: 0,
      },

      questionsAttempted: {
        type: Number,
        default: 0,
        min: 0,
      },

      questions: {
        type: [
          interviewQuestionSchema,
        ],
        default: [],
      },

      averageScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      technicalScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      communicationScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      confidenceScore: {
        type: Number,
        min: 0,
        max: 100,
        default: null,
      },

      strongAreas: {
        type: [String],
        default: [],
      },

      improvementAreas: {
        type: [String],
        default: [],
      },

      reportSummary: {
        type: String,
        default: "",
        trim: true,
        maxlength: 10000,
      },

      startedAt: {
        type: Date,
        default: null,
      },

      completedAt: {
        type: Date,
        default: null,
      },

      cancelledAt: {
        type: Date,
        default: null,
      },

      lastActivityAt: {
        type: Date,
        default: Date.now,
        index: true,
      },

      metadata: {
        type:
          mongoose.Schema.Types.Mixed,
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

interviewSessionSchema.index({
  candidateId: 1,
  createdAt: -1,
});

interviewSessionSchema.index({
  candidateId: 1,
  status: 1,
  updatedAt: -1,
});

interviewSessionSchema.index({
  candidateId: 1,
  completedAt: -1,
});

/* =========================================================
   SESSION VALIDATION
========================================================= */

interviewSessionSchema.pre(
  "validate",
  function () {
    this.strongAreas =
      normalizeStringArray(
        this.strongAreas
      );

    this.improvementAreas =
      normalizeStringArray(
        this.improvementAreas
      );

    this.averageScore =
      clampScore(
        this.averageScore
      );

    this.technicalScore =
      clampScore(
        this.technicalScore
      );

    this.communicationScore =
      clampScore(
        this.communicationScore
      );

    this.confidenceScore =
      clampScore(
        this.confidenceScore
      );

    if (
      this.questionsAttempted >
      this.questions.length
    ) {
      this.questionsAttempted =
        this.questions.length;
    }

    if (
      this.currentQuestionIndex >
      this.questions.length
    ) {
      this.currentQuestionIndex =
        this.questions.length;
    }

    this.lastActivityAt =
      new Date();
  }
);

/* =========================================================
   START SESSION
========================================================= */

interviewSessionSchema.methods.startSession =
  async function () {
    if (
      this.status === "completed"
    ) {
      throw new Error(
        "Completed interview cannot be restarted."
      );
    }

    if (
      this.status === "cancelled"
    ) {
      throw new Error(
        "Cancelled interview cannot be started."
      );
    }

    this.status =
      "in-progress";

    this.startedAt =
      this.startedAt ||
      new Date();

    this.lastActivityAt =
      new Date();

    await this.save();

    return this;
  };

/* =========================================================
   SAVE ANSWER
========================================================= */

interviewSessionSchema.methods.saveAnswer =
  async function ({
    questionId,
    answer = "",
    answerDuration = 0,
    technicalScore = null,
    communicationScore = null,
    confidenceScore = null,
    overallScore = null,
    feedback = "",
    strengths = [],
    improvements = [],
  }) {
    const question =
      this.questions.id(
        questionId
      );

    if (!question) {
      throw new Error(
        "Interview question was not found."
      );
    }

    question.answer =
      String(answer || "").trim();

    question.answerDuration =
      Math.max(
        Number(answerDuration) ||
          0,
        0
      );

    question.technicalScore =
      clampScore(
        technicalScore
      );

    question.communicationScore =
      clampScore(
        communicationScore
      );

    question.confidenceScore =
      clampScore(
        confidenceScore
      );

    question.overallScore =
      overallScore === null ||
      overallScore === undefined
        ? calculateAverage([
            question.technicalScore,
            question.communicationScore,
            question.confidenceScore,
          ])
        : clampScore(
            overallScore
          );

    question.feedback =
      String(feedback || "").trim();

    question.strengths =
      normalizeStringArray(
        strengths
      );

    question.improvements =
      normalizeStringArray(
        improvements
      );

    question.isAnswered = true;
    question.answeredAt =
      new Date();

    this.questionsAttempted =
      this.questions.filter(
        (item) =>
          item.isAnswered ||
          Boolean(
            item.answer &&
              item.answer.trim()
          )
      ).length;

    const questionIndex =
      this.questions.findIndex(
        (item) =>
          String(item._id) ===
          String(questionId)
      );

    if (questionIndex >= 0) {
      this.currentQuestionIndex =
        Math.min(
          questionIndex + 1,
          this.questions.length
        );
    }

    if (
      this.status === "created"
    ) {
      this.status =
        "in-progress";

      this.startedAt =
        this.startedAt ||
        new Date();
    }

    this.lastActivityAt =
      new Date();

    await this.save();

    return question;
  };

/* =========================================================
   RECALCULATE SCORES
========================================================= */

interviewSessionSchema.methods.recalculateScores =
  function () {
    const answeredQuestions =
      this.questions.filter(
        (question) =>
          question.isAnswered ||
          Boolean(
            question.answer &&
              question.answer.trim()
          )
      );

    this.questionsAttempted =
      answeredQuestions.length;

    this.technicalScore =
      calculateAverage(
        answeredQuestions.map(
          (question) =>
            question.technicalScore
        )
      );

    this.communicationScore =
      calculateAverage(
        answeredQuestions.map(
          (question) =>
            question.communicationScore
        )
      );

    this.confidenceScore =
      calculateAverage(
        answeredQuestions.map(
          (question) =>
            question.confidenceScore
        )
      );

    this.averageScore =
      calculateAverage(
        answeredQuestions.map(
          (question) =>
            question.overallScore
        )
      );

    const strengths =
      answeredQuestions.flatMap(
        (question) =>
          question.strengths || []
      );

    const improvements =
      answeredQuestions.flatMap(
        (question) =>
          question.improvements || []
      );

    this.strongAreas =
      normalizeStringArray(
        strengths
      );

    this.improvementAreas =
      normalizeStringArray(
        improvements
      );

    return this;
  };

/* =========================================================
   COMPLETE SESSION
========================================================= */

interviewSessionSchema.methods.completeSession =
  async function ({
    reportSummary = "",
  } = {}) {
    this.recalculateScores();

    this.status = "completed";
    this.completedAt =
      new Date();

    this.reportSummary =
      String(
        reportSummary || ""
      ).trim();

    this.currentQuestionIndex =
      this.questions.length;

    this.lastActivityAt =
      new Date();

    await this.save();

    return this;
  };

/* =========================================================
   CANCEL SESSION
========================================================= */

interviewSessionSchema.methods.cancelSession =
  async function () {
    if (
      this.status === "completed"
    ) {
      throw new Error(
        "Completed interview cannot be cancelled."
      );
    }

    this.status = "cancelled";
    this.cancelledAt =
      new Date();

    this.lastActivityAt =
      new Date();

    await this.save();

    return this;
  };

/* =========================================================
   FRONTEND HISTORY FORMAT
========================================================= */

interviewSessionSchema.methods.toHistoryJSON =
  function () {
    return {
      sessionId: this._id,
      candidateId:
        this.candidateId,
      role: this.role,
      experienceLevel:
        this.experienceLevel,
      interviewType:
        this.interviewType,
      questionCount:
        this.questionCount,
      questionsAttempted:
        this.questionsAttempted,
      status: this.status,
      averageScore:
        this.averageScore,
      technicalScore:
        this.technicalScore,
      communicationScore:
        this.communicationScore,
      confidenceScore:
        this.confidenceScore,
      startedAt:
        this.startedAt,
      completedAt:
        this.completedAt,
      createdAt:
        this.createdAt,
      updatedAt:
        this.updatedAt,
    };
  };

/* =========================================================
   FRONTEND REPORT FORMAT
========================================================= */

interviewSessionSchema.methods.toReportJSON =
  function () {
    return {
      sessionId: this._id,
      candidateId:
        this.candidateId,
      role: this.role,
      experienceLevel:
        this.experienceLevel,
      interviewType:
        this.interviewType,
      status: this.status,
      questionCount:
        this.questionCount,
      questionsAttempted:
        this.questionsAttempted,
      averageScore:
        this.averageScore,
      overallScore:
        this.averageScore,
      technicalScore:
        this.technicalScore,
      communicationScore:
        this.communicationScore,
      confidenceScore:
        this.confidenceScore,
      strongAreas:
        this.strongAreas,
      improvementAreas:
        this.improvementAreas,
      reportSummary:
        this.reportSummary,
      feedback:
        this.reportSummary,
      questions:
        this.questions,
      startedAt:
        this.startedAt,
      completedAt:
        this.completedAt,
      createdAt:
        this.createdAt,
      updatedAt:
        this.updatedAt,
    };
  };

/* =========================================================
   GET CANDIDATE HISTORY
========================================================= */

interviewSessionSchema.statics.getCandidateHistory =
  async function (
    candidateId,
    limit = 50
  ) {
    const safeLimit =
      Math.max(
        1,
        Math.min(
          Number(limit) || 50,
          100
        )
      );

    return this.find({
      candidateId,
    })
      .sort({
        createdAt: -1,
      })
      .limit(safeLimit);
  };

/* =========================================================
   GET CANDIDATE REPORTS
========================================================= */

interviewSessionSchema.statics.getCandidateReports =
  async function (
    candidateId,
    limit = 50
  ) {
    const safeLimit =
      Math.max(
        1,
        Math.min(
          Number(limit) || 50,
          100
        )
      );

    return this.find({
      candidateId,
      status: "completed",
    })
      .sort({
        completedAt: -1,
        updatedAt: -1,
      })
      .limit(safeLimit);
  };

/* =========================================================
   GET CANDIDATE STATS
========================================================= */

interviewSessionSchema.statics.getCandidateStats =
  async function (
    candidateId
  ) {
    const sessions =
      await this.find({
        candidateId,
        status: "completed",
      })
        .select(
          [
            "questionsAttempted",
            "averageScore",
            "strongAreas",
            "improvementAreas",
          ].join(" ")
        )
        .lean();

    const completedSessions =
      sessions.length;

    const questionsAttempted =
      sessions.reduce(
        (total, session) =>
          total +
          Number(
            session.questionsAttempted ||
              0
          ),
        0
      );

    const averageScore =
      calculateAverage(
        sessions.map(
          (session) =>
            session.averageScore
        )
      );

    const strongAreas =
      normalizeStringArray(
        sessions.flatMap(
          (session) =>
            session.strongAreas ||
            []
        )
      ).length;

    const needsImprovement =
      normalizeStringArray(
        sessions.flatMap(
          (session) =>
            session.improvementAreas ||
            []
        )
      ).length;

    const completionPercent =
      Math.min(
        100,
        completedSessions * 10
      );

    return {
      completedSessions,
      questionsAttempted,
      averageScore,
      strongAreas,
      needsImprovement,
      completionPercent,
    };
  };

/* =========================================================
   MODEL EXPORT
========================================================= */

module.exports =
  mongoose.models.InterviewSession ||
  mongoose.model(
    "InterviewSession",
    interviewSessionSchema
  );