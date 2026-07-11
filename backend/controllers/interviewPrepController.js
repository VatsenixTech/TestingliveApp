const InterviewSession = require(
  "../models/InterviewSession"
);

function getCandidateId(req) {
  return (
    req.user?._id ||
    req.user?.id ||
    req.candidate?._id ||
    req.candidate?.id
  );
}

async function createInterviewSession(req, res) {
  try {
    const candidateId = getCandidateId(req);

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const {
      role,
      experienceLevel,
      interviewType,
      questionCount,
    } = req.body;

    if (!role || !String(role).trim()) {
      return res.status(400).json({
        success: false,
        message: "Interview role is required.",
      });
    }

    if (!experienceLevel) {
      return res.status(400).json({
        success: false,
        message: "Experience level is required.",
      });
    }

    const allowedTypes = [
      "Technical",
      "HR",
      "Mixed",
    ];

    if (!allowedTypes.includes(interviewType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid interview type.",
      });
    }

    const allowedCounts = [5, 10, 15, 20];

    const normalizedCount = Number(questionCount);

    if (!allowedCounts.includes(normalizedCount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid question count.",
      });
    }

    const session =
      await InterviewSession.create({
        candidateId,
        role: String(role).trim(),
        experienceLevel,
        interviewType,
        questionCount: normalizedCount,
        status: "created",
      });

    return res.status(201).json({
      success: true,
      message: "Interview session created successfully.",
      data: {
        sessionId: session._id,
        role: session.role,
        experienceLevel: session.experienceLevel,
        interviewType: session.interviewType,
        questionCount: session.questionCount,
        status: session.status,
        createdAt: session.createdAt,
      },
    });
  } catch (error) {
    console.error(
      "Create interview session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to create interview session.",
    });
  }
}

async function getInterviewPrepStats(req, res) {
  try {
    const candidateId = getCandidateId(req);

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const sessions =
      await InterviewSession.find({
        candidateId,
      })
        .sort({
          createdAt: -1,
        })
        .lean();

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

    const scoredSessions =
      completedSessions.filter(
        (session) =>
          Number.isFinite(
            Number(session.averageScore)
          )
      );

    const averageScore =
      scoredSessions.length > 0
        ? scoredSessions.reduce(
            (total, session) =>
              total +
              Number(
                session.averageScore || 0
              ),
            0
          ) / scoredSessions.length
        : null;

    const strongAreasSet = new Set();

    const improvementAreasSet = new Set();

    completedSessions.forEach((session) => {
      (session.strongAreas || []).forEach(
        (item) => strongAreasSet.add(item)
      );

      (
        session.improvementAreas || []
      ).forEach((item) =>
        improvementAreasSet.add(item)
      );
    });

    const totalPlannedQuestions =
      sessions.reduce(
        (total, session) =>
          total +
          Number(
            session.questionCount || 0
          ),
        0
      );

    const completionPercent =
      totalPlannedQuestions > 0
        ? Math.min(
            100,
            Math.round(
              (questionsAttempted /
                totalPlannedQuestions) *
                100
            )
          )
        : 0;

    return res.status(200).json({
      success: true,
      data: {
        completedSessions:
          completedSessions.length,
        questionsAttempted,
        averageScore,
        strongAreas: strongAreasSet.size,
        needsImprovement:
          improvementAreasSet.size,
        completionPercent,
      },
    });
  } catch (error) {
    console.error(
      "Interview stats error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load interview progress.",
    });
  }
}

async function getInterviewSession(req, res) {
  try {
    const candidateId = getCandidateId(req);

    if (!candidateId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
    }

    const session =
      await InterviewSession.findOne({
        _id: req.params.sessionId,
        candidateId,
      });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Interview session not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error(
      "Get interview session error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to load interview session.",
    });
  }
}

module.exports = {
  createInterviewSession,
  getInterviewPrepStats,
  getInterviewSession,
};