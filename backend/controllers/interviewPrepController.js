const mongoose = require("mongoose");
const InterviewSession = require("../models/InterviewSession");

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
  "What are your salary expectations?",
  "Why do you want to join our company?",
  "Describe a time when you made a mistake.",
  "How do you respond to constructive feedback?",
  "What motivates you at work?",
  "Do you prefer working independently or in a team?",
  "Tell me about your biggest professional achievement.",
  "How do you handle pressure?",
  "What type of work environment do you prefer?",
  "Why did you choose your current career path?",
  "Do you have any questions for us?",
];

const questionBank = {
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
      "Describe a machine learning project you completed.",
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
      "How do you deploy a machine learning model?",
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
      "How do you implement authentication in a React application?",
      "What is code splitting?",
      "How do you make an application responsive?",
      "How do you improve web accessibility?",
      "How do you prevent unnecessary component rendering?",
      "Explain event bubbling and event capturing.",
      "What is the difference between local storage and session storage?",
      "How do you test frontend components?",
      "How do you protect frontend routes?",
      "Describe a difficult frontend problem you solved.",
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
      "How do you handle errors in a Node.js application?",
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
      "How do you handle transactions?",
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

/* =========================================================
   HELPERS
========================================================= */

function normalizeInterviewType(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase();

  if (normalized === "hr") {
    return "HR";
  }

  if (normalized === "mixed") {
    return "Mixed";
  }

  return "Technical";
}

function validateObjectId(value, label) {
  if (!value) {
    return `${label} is required.`;
  }

  if (!mongoose.Types.ObjectId.isValid(value)) {
    return `Invalid ${label.toLowerCase()}.`;
  }

  return null;
}

function getDifficulty(index, total) {
  if (!total) {
    return "Medium";
  }

  const percentage = (index + 1) / total;

  if (percentage <= 0.3) {
    return "Easy";
  }

  if (percentage <= 0.75) {
    return "Medium";
  }

  return "Advanced";
}

function formatQuestions(questions, category) {
  return questions.map((question, index) => ({
    question,
    category,
    difficulty: getDifficulty(index, questions.length),
  }));
}

function getRoleQuestionBank(role) {
  const normalizedRole = String(role || "")
    .trim()
    .toLowerCase();

  return (
    questionBank[normalizedRole] ||
    questionBank["data engineer"]
  );
}

function generateQuestions(
  role,
  interviewType,
  questionCount
) {
  const selectedBank = getRoleQuestionBank(role);

  if (interviewType === "HR") {
    return formatQuestions(
      selectedBank.hr.slice(0, questionCount),
      "HR"
    );
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
          difficulty: getDifficulty(
            index,
            technicalCount
          ),
        }));

    const hrQuestions = selectedBank.hr
      .slice(0, hrCount)
      .map((question, index) => ({
        question,
        category: "HR",
        difficulty: getDifficulty(
          index,
          hrCount
        ),
      }));

    return [
      ...technicalQuestions,
      ...hrQuestions,
    ];
  }

  return formatQuestions(
    selectedBank.technical.slice(
      0,
      questionCount
    ),
    "Technical"
  );
}

function countWords(text) {
  return String(text || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function createFollowUpQuestion(answer) {
  const normalizedAnswer = String(answer || "")
    .trim()
    .toLowerCase();

  if (
    normalizedAnswer.includes("team") &&
    !normalizedAnswer.includes("my role")
  ) {
    return "What was your individual responsibility in that project, separate from the work completed by the team?";
  }

  if (
    !normalizedAnswer.includes("result") &&
    !normalizedAnswer.includes("%") &&
    !normalizedAnswer.includes("improved") &&
    !normalizedAnswer.includes("reduced")
  ) {
    return "What measurable result did you achieve, such as time saved, cost reduced, performance improved, or quality increased?";
  }

  if (
    normalizedAnswer.includes("spark") ||
    normalizedAnswer.includes("pipeline") ||
    normalizedAnswer.includes("react") ||
    normalizedAnswer.includes("api")
  ) {
    return "What technical challenge did you face during that work, and how did you resolve it?";
  }

  return null;
}

/* =========================================================
   CREATE INTERVIEW SESSION
   POST /api/interview-prep/sessions
========================================================= */

exports.createInterviewSession = async (
  req,
  res
) => {
  try {
    const {
      candidateId,
      role,
      interviewRole,
      experienceLevel,
      experience,
      interviewType,
      type,
      questionCount,
      numberOfQuestions,
      durationMinutes,
    } = req.body;

    const selectedCandidateId =
      candidateId ||
      req.user?.candidateId ||
      req.user?._id ||
      req.user?.id;

    const candidateIdError =
      validateObjectId(
        selectedCandidateId,
        "Candidate ID"
      );

    if (candidateIdError) {
      return res.status(400).json({
        success: false,
        message: candidateIdError,
      });
    }

    const selectedRole =
      role || interviewRole;

    const selectedExperience =
      experienceLevel || experience;

    if (!selectedRole?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Interview role is required.",
      });
    }

    if (!selectedExperience?.trim()) {
      return res.status(400).json({
        success: false,
        message:
          "Experience level is required.",
      });
    }

    const selectedInterviewType =
      normalizeInterviewType(
        interviewType || type
      );

    const selectedQuestionCount = Number(
      questionCount ||
        numberOfQuestions ||
        20
    );

    const selectedDurationMinutes = Number(
      durationMinutes || 30
    );

    if (
      ![5, 10, 15, 20].includes(
        selectedQuestionCount
      )
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Question count must be 5, 10, 15, or 20.",
      });
    }

    if (
      !Number.isFinite(
        selectedDurationMinutes
      ) ||
      selectedDurationMinutes < 1 ||
      selectedDurationMinutes > 120
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Interview duration must be between 1 and 120 minutes.",
      });
    }

    const questions = generateQuestions(
      selectedRole,
      selectedInterviewType,
      selectedQuestionCount
    );

    if (
      questions.length !==
      selectedQuestionCount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Not enough interview questions are available.",
      });
    }

    const createPayload = {
      candidateId: selectedCandidateId,
      role: selectedRole.trim(),
      experienceLevel:
        selectedExperience.trim(),
      interviewType:
        selectedInterviewType,
      questionCount:
        selectedQuestionCount,
      status: "created",
      questionsAttempted: 0,
      startedAt: null,
      completedAt: null,
    };

    if (
      InterviewSession.schema.path(
        "currentQuestionIndex"
      )
    ) {
      createPayload.currentQuestionIndex = 0;
    }

    if (
      InterviewSession.schema.path(
        "questions"
      )
    ) {
      createPayload.questions = questions;
    }

    if (
      InterviewSession.schema.path(
        "durationMinutes"
      )
    ) {
      createPayload.durationMinutes =
        selectedDurationMinutes;
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
        id: session._id,
        sessionId: session._id,
        candidateId:
          session.candidateId,
        role: session.role,
        experienceLevel:
          session.experienceLevel,
        interviewType:
          session.interviewType,
        durationMinutes:
          session.durationMinutes ||
          selectedDurationMinutes,
        questionCount:
          session.questionCount,
        status: session.status,
        questions:
          session.questions || questions,
        createdAt: session.createdAt,
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
        message:
          "Interview session validation failed.",
        errors: Object.values(
          error.errors
        ).map(
          (validationError) =>
            validationError.message
        ),
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Unable to create interview session.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   GET ONE SESSION
   GET /api/interview-prep/sessions/:sessionId
========================================================= */

exports.getInterviewSession = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const validationError =
      validateObjectId(
        sessionId,
        "Interview session ID"
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
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
};

/* =========================================================
   GET INTERVIEW HISTORY
   GET /api/interview-prep/sessions
========================================================= */

exports.getInterviewHistory = async (
  req,
  res
) => {
  try {
    const candidateId =
      req.query.candidateId ||
      req.user?.candidateId ||
      req.user?._id ||
      req.user?.id;

    const validationError =
      validateObjectId(
        candidateId,
        "Candidate ID"
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
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
      "Get interview history error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve interview history.",
    });
  }
};

/* =========================================================
   GET INTERVIEW STATISTICS
   GET /api/interview-prep/stats
========================================================= */

exports.getInterviewStats = async (
  req,
  res
) => {
  try {
    const candidateId =
      req.query.candidateId ||
      req.user?.candidateId ||
      req.user?._id ||
      req.user?.id;

    const validationError =
      validateObjectId(
        candidateId,
        "Candidate ID"
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
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

    const totalQuestions =
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
            (sum, score) => sum + score,
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
      questionsAttempted:
        totalQuestions,
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
      "Get interview statistics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve interview statistics.",
    });
  }
};

/* =========================================================
   START SESSION
   PATCH /api/interview-prep/sessions/:sessionId/start
========================================================= */

exports.startInterviewSession = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const validationError =
      validateObjectId(
        sessionId,
        "Interview session ID"
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
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
          "This interview session is already completed.",
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

    session.status = "in-progress";

    if (!session.startedAt) {
      session.startedAt = new Date();
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
        "Unable to start interview session.",
    });
  }
};

/* =========================================================
   SUBMIT ANSWER AND RETURN NEXT QUESTION
   POST /api/interview-prep/sessions/:sessionId/answers
========================================================= */

exports.submitInterviewAnswer = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const {
      answer,
      transcript = [],
    } = req.body;

    const validationError =
      validateObjectId(
        sessionId,
        "Interview session ID"
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
      });
    }

    const cleanedAnswer = String(
      answer || ""
    ).trim();

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
          "This interview session is already completed.",
      });
    }

    if (
      session.status === "created"
    ) {
      session.status = "in-progress";

      if (!session.startedAt) {
        session.startedAt = new Date();
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

    let currentQuestionIndex = Number(
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

    const directFollowUp =
      createFollowUpQuestion(
        cleanedAnswer
      );

    let nextQuestion =
      directFollowUp;

    if (!nextQuestion) {
      const questions =
        session.questions?.length
          ? session.questions
          : generateQuestions(
              session.role,
              session.interviewType,
              session.questionCount || 20
            );

      const nextQuestionIndex =
        currentQuestionIndex %
        questions.length;

      nextQuestion =
        questions[nextQuestionIndex]
          ?.question;
    }

    if (!nextQuestion) {
      nextQuestion =
        "Please explain a practical project example, your exact responsibility, the challenge, and the measurable result.";
    }

    return res.status(200).json({
      success: true,
      nextQuestion,
      questionsAttempted: attempted,
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
        "Unable to process the interview answer.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};

/* =========================================================
   COMPLETE SESSION AND GENERATE REPORT
   PATCH /api/interview-prep/sessions/:sessionId/complete
========================================================= */

exports.completeInterviewSession = async (
  req,
  res
) => {
  try {
    const { sessionId } = req.params;

    const {
      transcript = [],
      remainingSeconds,
      elapsedSeconds,
      completedAt,
    } = req.body;

    const validationError =
      validateObjectId(
        sessionId,
        "Interview session ID"
      );

    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError,
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
          (configuredDurationSeconds -
            Number(
              remainingSeconds || 0
            ))
      )
    );

    const answerWordCounts =
      candidateAnswers.map(
        (message) =>
          countWords(message?.text)
      );

    const totalWords =
      answerWordCounts.reduce(
        (sum, count) =>
          sum + count,
        0
      );

    const averageWords =
      candidateAnswers.length > 0
        ? totalWords /
          candidateAnswers.length
        : 0;

    /*
     * Do not produce positive percentages from
     * one short answer or a very short session.
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
        "Answer at least three to five questions so the system can identify reliable performance patterns."
      );
    }

    if (averageWords < 35) {
      improvementAreas.push(
        "Give more complete answers with context, personal actions, tools used, and measurable outcomes."
      );
    }

    improvementAreas.push(
      "Use the STAR structure: Situation, Task, Action, and Result.",
      "Mention project scale, data volume, latency, cost, quality, or business impact.",
      "Clearly separate your individual contribution from the work performed by the team.",
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
          "The interview ended before enough evidence was collected. Scores are intentionally withheld to prevent a misleading positive report.",

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
       * Conservative transcript-evidence scoring.
       *
       * For genuine semantic technical evaluation,
       * replace this block with your production AI model.
       */
      const participationScore =
        Math.min(
          100,
          Math.round(
            42 +
              candidateAnswers.length * 7
          )
        );

      const detailScore = Math.min(
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
            participationScore * 0.35
        );

      const confidenceScore =
        Math.round(
          durationScore * 0.55 +
            participationScore * 0.45
        );

      const technicalScore =
        session.interviewType === "HR"
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
                (sum, score) =>
                  sum + score,
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
          "Maintained consistent participation across multiple interview questions."
        );
      }

      if (averageWords >= 45) {
        strongAreas.push(
          "Provided reasonably detailed answers."
        );
      }

      if (usedSeconds >= 10 * 60) {
        strongAreas.push(
          "Sustained the interview for a meaningful duration."
        );
      }

      report = {
        evidenceStatus: "sufficient",

        overallScore,
        technicalScore,
        communicationScore,
        confidenceScore,

        strongAreas,

        improvementAreas,

        summary:
          "This report is based on interview duration, answer completeness, participation, and transcript detail. Connect this endpoint to your production AI evaluator for role-specific semantic accuracy.",

        answersSubmitted:
          candidateAnswers.length,

        durationSeconds:
          usedSeconds,

        totalWords,

        averageWordsPerAnswer:
          Math.round(averageWords),
      };
    }

    session.status = "completed";

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
        "Unable to complete interview session.",
      error:
        process.env.NODE_ENV ===
        "development"
          ? error.message
          : undefined,
    });
  }
};