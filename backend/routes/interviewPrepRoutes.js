const express = require("express");
const mongoose = require("mongoose");

const InterviewSession = require(
  "../models/InterviewSession"
);

const router = express.Router();

/* =========================================================
   BASIC HELPERS
========================================================= */

const isValidObjectId = (value) =>
  mongoose.Types.ObjectId.isValid(value);

const countWords = (value) =>
  String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

const getCandidateId = (req) =>
  req.query?.candidateId ||
  req.body?.candidateId ||
  req.user?.candidateId ||
  req.user?._id ||
  req.user?.id ||
  null;

const normalizeInterviewType = (value) => {
  const normalizedValue = String(value || "")
    .trim()
    .toLowerCase();

  if (normalizedValue === "hr") {
    return "HR";
  }

  if (normalizedValue === "mixed") {
    return "Mixed";
  }

  return "Technical";
};

/* =========================================================
   QUESTION BANK
========================================================= */

const COMMON_HR_QUESTIONS = [
  "Tell me about yourself.",
  "Why are you looking for a new opportunity?",
  "What are your greatest professional strengths?",
  "What is one area you are currently improving?",
  "Describe a difficult situation you handled at work.",
  "How do you manage competing deadlines?",
  "Tell me about a disagreement you had with a teammate.",
  "Why should we hire you?",
  "Where do you see yourself in the next three years?",
  "Why do you want to join our company?",
  "Describe a time when you made a mistake.",
  "How do you respond to constructive feedback?",
  "What motivates you at work?",
  "Tell me about your biggest professional achievement.",
  "How do you handle pressure?",
  "What type of work environment do you prefer?",
  "Why did you choose your current career path?",
  "How do you work with difficult stakeholders?",
  "How do you prioritize your work?",
  "Do you have any questions for us?",
];

const QUESTION_BANK = {
  "data engineer": {
    technical: [
      "Tell me about your experience as a Data Engineer.",
      "Describe one complete data pipeline you developed.",
      "What is the difference between batch processing and stream processing?",
      "Explain lazy evaluation in Apache Spark.",
      "What is the difference between repartition and coalesce?",
      "How do you optimize a slow-running Spark job?",
      "What is data partitioning and why is it important?",
      "Explain the difference between a data warehouse and a data lake.",
      "How do you handle duplicate records in a data pipeline?",
      "What are narrow and wide transformations in Spark?",
      "How do you design an incremental data-loading process?",
      "What is a shuffle operation in Apache Spark?",
      "Explain Slowly Changing Dimensions.",
      "How do you monitor production data pipelines?",
      "How do you handle source schema changes?",
      "Explain the medallion architecture.",
      "What is the difference between cache and persist?",
      "How do you validate data quality?",
      "Explain window functions with a practical example.",
      "How do you manage failed ETL jobs?",
    ],

    hr: COMMON_HR_QUESTIONS,
  },

  "data scientist": {
    technical: [
      "Tell me about your experience as a Data Scientist.",
      "Describe a machine-learning project you completed.",
      "What is the difference between supervised and unsupervised learning?",
      "Explain overfitting and underfitting.",
      "How do you evaluate a classification model?",
      "What is cross-validation?",
      "Explain precision, recall, and F1 score.",
      "What is feature engineering?",
      "How do you handle missing values?",
      "Explain bias and variance.",
      "What is regularization?",
      "How do you select important features?",
      "What is the difference between bagging and boosting?",
      "How do you deploy a machine-learning model?",
      "How do you monitor model performance?",
      "What is data leakage?",
      "Explain a confusion matrix.",
      "What is gradient descent?",
      "How do you handle imbalanced datasets?",
      "How do you explain predictions to non-technical stakeholders?",
    ],

    hr: COMMON_HR_QUESTIONS,
  },

  "frontend developer": {
    technical: [
      "Tell me about your experience as a Frontend Developer.",
      "Describe a frontend application you developed.",
      "What is the difference between props and state in React?",
      "How does the React component lifecycle work?",
      "Explain React hooks and their common use cases.",
      "How do you optimize the performance of a React application?",
      "What is the virtual DOM?",
      "How do you manage application state?",
      "Explain controlled and uncontrolled components.",
      "How do you handle API errors in the frontend?",
      "How do you implement authentication in React?",
      "What is code splitting?",
      "How do you make an application responsive?",
      "How do you improve web accessibility?",
      "How do you prevent unnecessary component rendering?",
      "Explain event bubbling and event capturing.",
      "What is the difference between local storage and session storage?",
      "How do you test frontend components?",
      "How do you protect frontend routes?",
      "Describe a difficult frontend issue you resolved.",
    ],

    hr: COMMON_HR_QUESTIONS,
  },

  "backend developer": {
    technical: [
      "Tell me about your experience as a Backend Developer.",
      "Describe a backend service you developed.",
      "How do you design a REST API?",
      "How do you implement authentication and authorization?",
      "What is middleware in Express?",
      "How do you handle errors in Node.js?",
      "How do you optimize slow database queries?",
      "Explain database indexing.",
      "What is the difference between SQL and NoSQL databases?",
      "How do you validate incoming API requests?",
      "How do you secure sensitive environment variables?",
      "How do you implement pagination?",
      "How do you prevent duplicate requests?",
      "How do you design an API for high traffic?",
      "What is caching and when do you use it?",
      "How do you monitor backend services?",
      "How do you handle database transactions?",
      "How do you test backend APIs?",
      "How do you manage background jobs?",
      "Describe a production issue you resolved.",
    ],

    hr: COMMON_HR_QUESTIONS,
  },

  "full stack developer": {
    technical: [
      "Tell me about your experience as a Full Stack Developer.",
      "Describe a complete application you developed.",
      "How do the frontend and backend communicate?",
      "How do you design authentication for a full-stack application?",
      "How do you manage state in a React application?",
      "How do you design a REST API?",
      "How do you secure protected routes?",
      "How do you optimize database queries?",
      "How do you manage file uploads?",
      "How do you handle errors across frontend and backend?",
      "How do you deploy a full-stack application?",
      "How do you manage environment variables?",
      "What is CORS and why is it required?",
      "How do you prevent unnecessary frontend rendering?",
      "How do you implement pagination?",
      "How do you monitor production failures?",
      "How do you design reusable components?",
      "How do you test a full-stack application?",
      "How do you handle concurrent requests?",
      "Describe a difficult end-to-end issue you resolved.",
    ],

    hr: COMMON_HR_QUESTIONS,
  },
};

const getQuestionBank = (role) => {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  return (
    QUESTION_BANK[normalizedRole] ||
    QUESTION_BANK["data engineer"]
  );
};

const generateQuestions = (
  role,
  interviewType,
  questionCount
) => {
  const selectedBank = getQuestionBank(role);

  if (interviewType === "HR") {
    return selectedBank.hr
      .slice(0, questionCount)
      .map((question, index) => ({
        question,
        category: "HR",
        difficulty:
          index < 6
            ? "Easy"
            : index < 14
              ? "Medium"
              : "Advanced",
      }));
  }

  if (interviewType === "Mixed") {
    const technicalCount = Math.ceil(
      questionCount / 2
    );

    const hrCount =
      questionCount - technicalCount;

    const technicalQuestions =
      selectedBank.technical
        .slice(0, technicalCount)
        .map((question, index) => ({
          question,
          category: "Technical",
          difficulty:
            index < 4
              ? "Easy"
              : index < 8
                ? "Medium"
                : "Advanced",
        }));

    const hrQuestions = selectedBank.hr
      .slice(0, hrCount)
      .map((question, index) => ({
        question,
        category: "HR",
        difficulty:
          index < 3
            ? "Easy"
            : index < 7
              ? "Medium"
              : "Advanced",
      }));

    return [
      ...technicalQuestions,
      ...hrQuestions,
    ];
  }

  return selectedBank.technical
    .slice(0, questionCount)
    .map((question, index) => ({
      question,
      category: "Technical",
      difficulty:
        index < 6
          ? "Easy"
          : index < 14
            ? "Medium"
            : "Advanced",
    }));
};

/* =========================================================
   FOLLOW-UP QUESTION GENERATOR
========================================================= */

const createFollowUpQuestion = (
  answer,
  session
) => {
  const normalizedAnswer = String(answer || "")
    .trim()
    .toLowerCase();

  const wordCount = countWords(answer);

  if (wordCount < 15) {
    return "Please explain your answer in more detail. Include the situation, your responsibility, the action you took, and the final result.";
  }

  if (
    normalizedAnswer.includes("team") &&
    !normalizedAnswer.includes(
      "my responsibility"
    ) &&
    !normalizedAnswer.includes("my role")
  ) {
    return "What was your individual responsibility, separate from the work completed by the rest of the team?";
  }

  if (
    !normalizedAnswer.includes("%") &&
    !normalizedAnswer.includes("result") &&
    !normalizedAnswer.includes("improved") &&
    !normalizedAnswer.includes("reduced") &&
    !normalizedAnswer.includes("increased") &&
    !normalizedAnswer.includes("saved")
  ) {
    return "What measurable result did you achieve, such as time saved, cost reduced, performance improved, or quality increased?";
  }

  if (
    normalizedAnswer.includes("spark") ||
    normalizedAnswer.includes("pipeline") ||
    normalizedAnswer.includes("react") ||
    normalizedAnswer.includes("api") ||
    normalizedAnswer.includes("mongodb") ||
    normalizedAnswer.includes("sql")
  ) {
    return "What was the most difficult technical challenge in that work, and how did you resolve it?";
  }

  if (
    session.interviewType === "HR"
  ) {
    return "What did you learn from that experience, and what would you do differently next time?";
  }

  return null;
};

/* =========================================================
   TEST ROUTE
   GET /api/interview-prep/test
========================================================= */

router.get("/test", (req, res) => {
  return res.status(200).json({
    success: true,
    message:
      "Interview preparation routes are working correctly.",
  });
});

/* =========================================================
   INTERVIEW STATISTICS
   GET /api/interview-prep/stats
========================================================= */

router.get("/stats", async (req, res) => {
  try {
    const candidateId =
      getCandidateId(req);

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate ID is required.",
      });
    }

    if (!isValidObjectId(candidateId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid candidate ID.",
      });
    }

    const sessions =
      await InterviewSession.find({
        candidateId,
      }).lean();

    const completedSessions =
      sessions.filter(
        (session) =>
          session.status === "completed"
      );

    const questionsAttempted =
      completedSessions.reduce(
        (total, session) =>
          total +
          Number(
            session.questionsAttempted || 0
          ),
        0
      );

    const validScores =
      completedSessions
        .map((session) =>
          Number(session.averageScore)
        )
        .filter(Number.isFinite);

    const averageScore =
      validScores.length > 0
        ? validScores.reduce(
            (total, score) =>
              total + score,
            0
          ) / validScores.length
        : null;

    const strongAreas =
      completedSessions.reduce(
        (total, session) =>
          total +
          Number(
            session.strongAreas?.length || 0
          ),
        0
      );

    const needsImprovement =
      completedSessions.reduce(
        (total, session) =>
          total +
          Number(
            session.improvementAreas
              ?.length || 0
          ),
        0
      );

    return res.status(200).json({
      success: true,
      completedSessions:
        completedSessions.length,
      questionsAttempted,
      averageScore,
      strongAreas,
      needsImprovement,
      completionPercent: Math.min(
        100,
        completedSessions.length * 10
      ),
    });
  } catch (error) {
    console.error(
      "Interview statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve interview statistics.",
    });
  }
});

/* =========================================================
   CREATE INTERVIEW SESSION
   POST /api/interview-prep/sessions
========================================================= */

router.post("/sessions", async (req, res) => {
  try {
    console.log(
      "✅ POST /api/interview-prep/sessions reached"
    );

    console.log(
      "Request body:",
      req.body
    );

    const {
      candidateId,
      role,
      experienceLevel,
      interviewType,
      questionCount,
      durationMinutes,
    } = req.body;

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate ID is required.",
      });
    }

    if (!isValidObjectId(candidateId)) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate ID must be a valid MongoDB ID.",
      });
    }

    if (!role?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Interview role is required.",
      });
    }

    if (!experienceLevel?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Experience level is required.",
      });
    }

    const normalizedInterviewType =
      normalizeInterviewType(
        interviewType
      );

    const normalizedQuestionCount =
      Number(questionCount || 20);

    if (
      ![5, 10, 15, 20].includes(
        normalizedQuestionCount
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question count must be 5, 10, 15, or 20.",
      });
    }

    const normalizedDuration =
      Number(durationMinutes || 30);

    if (
      !Number.isFinite(
        normalizedDuration
      ) ||
      normalizedDuration < 1 ||
      normalizedDuration > 120
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interview duration must be between 1 and 120 minutes.",
      });
    }

    const generatedQuestions =
      generateQuestions(
        role,
        normalizedInterviewType,
        normalizedQuestionCount
      );

    const createPayload = {
      candidateId,
      role: role.trim(),
      experienceLevel:
        experienceLevel.trim(),
      interviewType:
        normalizedInterviewType,
      questionCount:
        normalizedQuestionCount,
      status: "created",
      questionsAttempted: 0,
      averageScore: null,
      strongAreas: [],
      improvementAreas: [],
      startedAt: null,
      completedAt: null,
    };

    if (
      InterviewSession.schema.path(
        "durationMinutes"
      )
    ) {
      createPayload.durationMinutes =
        normalizedDuration;
    }

    if (
      InterviewSession.schema.path(
        "currentQuestionIndex"
      )
    ) {
      createPayload.currentQuestionIndex =
        0;
    }

    if (
      InterviewSession.schema.path(
        "questions"
      )
    ) {
      createPayload.questions =
        generatedQuestions;
    }

    const session =
      await InterviewSession.create(
        createPayload
      );

    return res.status(201).json({
      success: true,
      message:
        "Interview session created successfully.",
      session: {
        sessionId: session._id,
        id: session._id,
        _id: session._id,
        candidateId:
          session.candidateId,
        role: session.role,
        experienceLevel:
          session.experienceLevel,
        interviewType:
          session.interviewType,
        durationMinutes:
          session.durationMinutes ||
          normalizedDuration,
        questionCount:
          session.questionCount,
        status: session.status,
        questions:
          session.questions ||
          generatedQuestions,
        createdAt:
          session.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Create interview session error:",
      error
    );

    if (
      error.name === "ValidationError"
    ) {
      return res.status(400).json({
        success: false,
        message: Object.values(
          error.errors
        )
          .map((item) => item.message)
          .join(", "),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create interview session.",
    });
  }
});

/* =========================================================
   GET INTERVIEW HISTORY
   GET /api/interview-prep/sessions
========================================================= */

router.get("/sessions", async (req, res) => {
  try {
    const candidateId =
      getCandidateId(req);

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate ID is required.",
      });
    }

    if (!isValidObjectId(candidateId)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid candidate ID.",
      });
    }

    const sessions =
      await InterviewSession.find({
        candidateId,
      })
        .sort({
          createdAt: -1,
        })
        .limit(50)
        .lean();

    return res.status(200).json({
      success: true,
      count: sessions.length,
      sessions,
    });
  } catch (error) {
    console.error(
      "Interview history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve interview history.",
    });
  }
});

/* =========================================================
   START INTERVIEW SESSION
   PATCH /api/interview-prep/sessions/:sessionId/start
========================================================= */

router.patch(
  "/sessions/:sessionId/start",
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      console.log(
        `✅ PATCH START reached: ${sessionId}`
      );

      if (
        !isValidObjectId(sessionId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview session ID.",
        });
      }

      const session =
        await InterviewSession.findById(
          sessionId
        );

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Interview session not found.",
        });
      }

      if (
        session.status === "completed"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This interview session has already been completed.",
        });
      }

      if (
        session.status === "cancelled"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "A cancelled interview cannot be started.",
        });
      }

      if (
        session.status === "in-progress"
      ) {
        return res.status(200).json({
          success: true,
          alreadyStarted: true,
          message:
            "Interview session is already in progress.",
          session,
        });
      }

      session.status =
        "in-progress";

      if (!session.startedAt) {
        session.startedAt =
          new Date();
      }

      await session.save();

      return res.status(200).json({
        success: true,
        alreadyStarted: false,
        message:
          "Interview session started successfully.",
        session,
      });
    } catch (error) {
      console.error(
        "Start interview session error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to start interview session.",
      });
    }
  }
);

/* =========================================================
   SUBMIT AUTOMATIC VOICE ANSWER
   POST /api/interview-prep/sessions/:sessionId/answers
========================================================= */

router.post(
  "/sessions/:sessionId/answers",
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const {
        answer,
        transcript = [],
      } = req.body;

      console.log(
        `✅ POST ANSWER reached: ${sessionId}`
      );

      if (
        !isValidObjectId(sessionId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview session ID.",
        });
      }

      const cleanedAnswer =
        String(answer || "").trim();

      if (!cleanedAnswer) {
        return res.status(400).json({
          success: false,
          message:
            "Interview answer is required.",
        });
      }

      const session =
        await InterviewSession.findById(
          sessionId
        );

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Interview session not found.",
        });
      }

      if (
        session.status === "completed"
      ) {
        return res.status(409).json({
          success: false,
          message:
            "This interview session has already been completed.",
        });
      }

      if (
        session.status === "created"
      ) {
        session.status =
          "in-progress";

        if (!session.startedAt) {
          session.startedAt =
            new Date();
        }
      }

      const candidateAnswers =
        Array.isArray(transcript)
          ? transcript.filter(
              (message) =>
                message?.sender ===
                "candidate"
            )
          : [];

      const attempted =
        candidateAnswers.length ||
        Number(
          session.questionsAttempted || 0
        ) + 1;

      session.questionsAttempted =
        attempted;

      let currentQuestionIndex =
        Number(
          session.currentQuestionIndex || 0
        );

      currentQuestionIndex += 1;

      if (
        InterviewSession.schema.path(
          "currentQuestionIndex"
        )
      ) {
        session.currentQuestionIndex =
          currentQuestionIndex;
      }

      await session.save();

      const followUpQuestion =
        createFollowUpQuestion(
          cleanedAnswer,
          session
        );

      let nextQuestion =
        followUpQuestion;

      if (!nextQuestion) {
        const availableQuestions =
          session.questions?.length
            ? session.questions
            : generateQuestions(
                session.role,
                session.interviewType,
                session.questionCount || 20
              );

        const nextQuestionIndex =
          currentQuestionIndex %
          availableQuestions.length;

        nextQuestion =
          availableQuestions[
            nextQuestionIndex
          ]?.question;
      }

      if (!nextQuestion) {
        nextQuestion =
          "Please explain a practical project example, your exact responsibility, the challenge, and the measurable result.";
      }

      return res.status(200).json({
        success: true,
        nextQuestion,
        questionsAttempted:
          attempted,
        currentQuestionIndex,
      });
    } catch (error) {
      console.error(
        "Submit interview answer error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to process the interview answer.",
      });
    }
  }
);

/* =========================================================
   COMPLETE INTERVIEW AND GENERATE GENUINE REPORT
   PATCH /api/interview-prep/sessions/:sessionId/complete
========================================================= */

router.patch(
  "/sessions/:sessionId/complete",
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      const {
        transcript = [],
        remainingSeconds,
        elapsedSeconds,
        completedAt,
      } = req.body;

      console.log(
        `✅ PATCH COMPLETE reached: ${sessionId}`
      );

      if (
        !isValidObjectId(sessionId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview session ID.",
        });
      }

      const session =
        await InterviewSession.findById(
          sessionId
        );

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Interview session not found.",
        });
      }

      const candidateAnswers =
        Array.isArray(transcript)
          ? transcript.filter(
              (message) =>
                message?.sender ===
                "candidate"
            )
          : [];

      const configuredDurationSeconds =
        Number(
          session.durationMinutes || 30
        ) * 60;

      const usedSeconds = Math.max(
        0,
        Number(
          elapsedSeconds ??
            (
              configuredDurationSeconds -
              Number(
                remainingSeconds || 0
              )
            )
        )
      );

      const totalWords =
        candidateAnswers.reduce(
          (total, message) =>
            total +
            countWords(message?.text),
          0
        );

      const averageWords =
        candidateAnswers.length > 0
          ? totalWords /
            candidateAnswers.length
          : 0;

      /*
       * Minimum evidence required before showing
       * any percentage score.
       */
      const evidenceIsSufficient =
        usedSeconds >= 5 * 60 &&
        candidateAnswers.length >= 3 &&
        totalWords >= 120;

      const improvementAreas = [];

      if (usedSeconds < 5 * 60) {
        improvementAreas.push(
          "Complete at least five minutes of the interview before ending the session."
        );
      }

      if (
        candidateAnswers.length < 3
      ) {
        improvementAreas.push(
          "Answer at least three to five questions so reliable performance patterns can be evaluated."
        );
      }

      if (averageWords < 35) {
        improvementAreas.push(
          "Give complete answers with context, personal actions, tools used, and measurable outcomes."
        );
      }

      improvementAreas.push(
        "Use the STAR structure: Situation, Task, Action, and Result.",
        "Mention project scale, data volume, latency, cost, quality, or business impact.",
        "Clearly explain your individual contribution instead of only describing the team.",
        "Use specific examples instead of giving only general definitions.",
        "Finish each answer with the final result and what you learned."
      );

      let report;

      if (!evidenceIsSufficient) {
        report = {
          evidenceStatus:
            "insufficient",

          overallScore: null,
          technicalScore: null,
          communicationScore: null,
          confidenceScore: null,

          strongAreas: [],

          improvementAreas,

          summary:
            "The interview ended before enough evidence was collected. Scores are intentionally withheld to avoid showing a misleading positive report.",

          answersSubmitted:
            candidateAnswers.length,

          durationSeconds:
            usedSeconds,

          totalWords,

          averageWordsPerAnswer:
            Math.round(averageWords),
        };
      } else {
        /*
         * Conservative evidence-based scoring.
         *
         * This does not pretend to understand the
         * semantic correctness of every technical answer.
         */
        const participationScore =
          Math.min(
            100,
            Math.round(
              42 +
                candidateAnswers.length *
                  7
            )
          );

        const detailScore =
          Math.min(
            100,
            Math.round(
              35 +
                Math.min(
                  averageWords,
                  60
                )
            )
          );

        const durationScore =
          Math.min(
            100,
            Math.round(
              40 +
                usedSeconds / 20
            )
          );

        const communicationScore =
          Math.round(
            detailScore * 0.65 +
              participationScore *
                0.35
          );

        const confidenceScore =
          Math.round(
            durationScore * 0.55 +
              participationScore *
                0.45
          );

        const technicalScore =
          session.interviewType ===
          "HR"
            ? null
            : Math.round(
                detailScore * 0.5 +
                  participationScore *
                    0.5
              );

        const availableScores = [
          technicalScore,
          communicationScore,
          confidenceScore,
        ].filter(Number.isFinite);

        const overallScore =
          availableScores.length > 0
            ? Math.round(
                availableScores.reduce(
                  (total, score) =>
                    total + score,
                  0
                ) /
                  availableScores.length
              )
            : null;

        const strongAreas = [];

        if (
          candidateAnswers.length >= 5
        ) {
          strongAreas.push(
            "Maintained participation across multiple interview questions."
          );
        }

        if (averageWords >= 45) {
          strongAreas.push(
            "Provided reasonably detailed answers."
          );
        }

        if (
          usedSeconds >= 10 * 60
        ) {
          strongAreas.push(
            "Sustained the interview for a meaningful duration."
          );
        }

        report = {
          evidenceStatus:
            "sufficient",

          overallScore,
          technicalScore,
          communicationScore,
          confidenceScore,

          strongAreas,
          improvementAreas,

          summary:
            "This report is based on interview duration, participation, answer completeness, and transcript detail. Connect a production AI evaluator for role-specific semantic technical accuracy.",

          answersSubmitted:
            candidateAnswers.length,

          durationSeconds:
            usedSeconds,

          totalWords,

          averageWordsPerAnswer:
            Math.round(averageWords),
        };
      }

      session.status =
        "completed";

      session.completedAt =
        completedAt
          ? new Date(completedAt)
          : new Date();

      session.questionsAttempted =
        candidateAnswers.length;

      if (!session.startedAt) {
        session.startedAt =
          session.createdAt ||
          new Date();
      }

      if (
        InterviewSession.schema.path(
          "remainingSeconds"
        )
      ) {
        session.remainingSeconds =
          Number(
            remainingSeconds || 0
          );
      }

      if (
        InterviewSession.schema.path(
          "transcript"
        )
      ) {
        session.transcript =
          transcript;
      }

      if (
        InterviewSession.schema.path(
          "averageScore"
        )
      ) {
        session.averageScore =
          report.overallScore;
      }

      if (
        InterviewSession.schema.path(
          "technicalScore"
        )
      ) {
        session.technicalScore =
          report.technicalScore;
      }

      if (
        InterviewSession.schema.path(
          "communicationScore"
        )
      ) {
        session.communicationScore =
          report.communicationScore;
      }

      if (
        InterviewSession.schema.path(
          "confidenceScore"
        )
      ) {
        session.confidenceScore =
          report.confidenceScore;
      }

      session.strongAreas =
        report.strongAreas || [];

      session.improvementAreas =
        report.improvementAreas || [];

      await session.save();

      return res.status(200).json({
        success: true,
        message:
          "Interview session completed successfully.",
        session,
        report,
      });
    } catch (error) {
      console.error(
        "Complete interview session error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to complete interview session.",
      });
    }
  }
);

/* =========================================================
   GET ONE INTERVIEW SESSION
   GET /api/interview-prep/sessions/:sessionId

   Keep this after /start, /answers and /complete.
========================================================= */



/* =========================================================
   GET ALL COMPLETED INTERVIEW REPORTS
   GET /api/interview-prep/reports
========================================================= */

router.get("/reports", async (req, res) => {
  try {
    const candidateId =
      getCandidateId(req);

    console.log(
      "✅ GET /api/interview-prep/reports reached"
    );

    console.log(
      "Reports candidate ID:",
      candidateId
    );

    if (!candidateId) {
      return res.status(400).json({
        success: false,
        message:
          "Candidate ID is required.",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(
        candidateId
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid candidate ID.",
      });
    }

    const sessions =
      await InterviewSession.find({
        candidateId,
        status: "completed",
      })
        .sort({
          completedAt: -1,
          updatedAt: -1,
        })
        .limit(100)
        .lean();

    const reports = sessions.map(
      (session) => ({
        _id: session._id,

        sessionId:
          session._id,

        candidateId:
          session.candidateId,

        role:
          session.role,

        experienceLevel:
          session.experienceLevel,

        interviewType:
          session.interviewType,

        status:
          session.status,

        questionCount:
          session.questionCount,

        questionsAttempted:
          session.questionsAttempted,

        averageScore:
          session.averageScore,

        overallScore:
          session.averageScore,

        technicalScore:
          session.technicalScore,

        communicationScore:
          session.communicationScore,

        confidenceScore:
          session.confidenceScore,

        strongAreas:
          session.strongAreas || [],

        improvementAreas:
          session.improvementAreas ||
          [],

        reportSummary:
          session.reportSummary || "",

        feedback:
          session.reportSummary || "",

        startedAt:
          session.startedAt,

        completedAt:
          session.completedAt,

        createdAt:
          session.createdAt,

        updatedAt:
          session.updatedAt,
      })
    );

    return res.status(200).json({
      success: true,

      count:
        reports.length,

      data: {
        reports,
      },

      reports,
    });
  } catch (error) {
    console.error(
      "Get interview reports error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        error.message ||
        "Unable to retrieve interview reports.",
    });
  }
});

/* =========================================================
   GET ONE INTERVIEW REPORT
   GET /api/interview-prep/reports/:sessionId
========================================================= */

router.get(
  "/reports/:sessionId",
  async (req, res) => {
    try {
      const candidateId =
        getCandidateId(req);

      const { sessionId } =
        req.params;

      if (!candidateId) {
        return res.status(400).json({
          success: false,
          message:
            "Candidate ID is required.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          candidateId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid candidate ID.",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          sessionId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview session ID.",
        });
      }

      const session =
        await InterviewSession.findOne({
          _id: sessionId,
          candidateId,
          status: "completed",
        }).lean();

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Completed interview report was not found.",
        });
      }

      const report = {
        _id:
          session._id,

        sessionId:
          session._id,

        candidateId:
          session.candidateId,

        role:
          session.role,

        experienceLevel:
          session.experienceLevel,

        interviewType:
          session.interviewType,

        status:
          session.status,

        questionCount:
          session.questionCount,

        questionsAttempted:
          session.questionsAttempted,

        averageScore:
          session.averageScore,

        overallScore:
          session.averageScore,

        technicalScore:
          session.technicalScore,

        communicationScore:
          session.communicationScore,

        confidenceScore:
          session.confidenceScore,

        strongAreas:
          session.strongAreas || [],

        improvementAreas:
          session.improvementAreas ||
          [],

        reportSummary:
          session.reportSummary || "",

        feedback:
          session.reportSummary || "",

        questions:
          session.questions || [],

        startedAt:
          session.startedAt,

        completedAt:
          session.completedAt,

        createdAt:
          session.createdAt,

        updatedAt:
          session.updatedAt,
      };

      return res.status(200).json({
        success: true,

        data:
          report,

        report,
      });
    } catch (error) {
      console.error(
        "Get interview report error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Unable to retrieve interview report.",
      });
    }
  }
);


router.get(
  "/sessions/:sessionId",
  async (req, res) => {
    try {
      const { sessionId } =
        req.params;

      if (
        !isValidObjectId(sessionId)
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid interview session ID.",
        });
      }

      const session =
        await InterviewSession.findById(
          sessionId
        );

      if (!session) {
        return res.status(404).json({
          success: false,
          message:
            "Interview session not found.",
        });
      }

      return res.status(200).json({
        success: true,
        session,
      });
    } catch (error) {
      console.error(
        "Get interview session error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to retrieve interview session.",
      });
    }
  }
);

router.get("/questions", async (req, res) => {
  try {
    const { role, type } = req.query;

    const questions = [
      {
        id: 1,
        question: `Explain your experience as a ${role}.`,
        category: type || "Technical",
        difficulty: "Medium",
      },
      {
        id: 2,
        question: "What are the challenges you faced in your last project?",
        category: type || "Technical",
        difficulty: "Medium",
      },
      {
        id: 3,
        question: "Explain Spark transformations and actions.",
        category: type || "Technical",
        difficulty: "Hard",
      },
    ];

    return res.json({
      success: true,
      questions,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;