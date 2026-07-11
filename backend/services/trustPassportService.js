const TrustPassport = require("../models/TrustPassport");

const clamp = (value, minimum = 0, maximum = 100) => {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) {
    return minimum;
  }

  return Math.min(maximum, Math.max(minimum, numericValue));
};

const calculateProfileCompleteness = (candidate) => {
  const checks = [
    candidate.firstName || candidate.name,
    candidate.lastName || candidate.name,
    candidate.email,
    candidate.phone,
    candidate.profileImage || candidate.photo,
    candidate.headline || candidate.currentRole,
    candidate.location,
    candidate.summary || candidate.about,
    candidate.resumeUrl || candidate.resume,
    Array.isArray(candidate.skills) && candidate.skills.length > 0,
    Array.isArray(candidate.experience) && candidate.experience.length > 0,
    Array.isArray(candidate.education) && candidate.education.length > 0,
  ];

  const completed = checks.filter(Boolean).length;

  return clamp((completed / checks.length) * 100);
};

const calculateSkillsScore = (candidate) => {
  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];

  if (skills.length === 0) {
    return 0;
  }

  const baseScore = Math.min(skills.length * 8, 64);

  const endorsedSkills = skills.filter(
    (skill) =>
      skill.endorsements > 0 ||
      skill.verified === true ||
      skill.assessmentPassed === true
  ).length;

  const endorsementScore =
    skills.length > 0 ? (endorsedSkills / skills.length) * 36 : 0;

  return clamp(baseScore + endorsementScore);
};

const calculateExperienceScore = (candidate) => {
  const experience = Array.isArray(candidate.experience)
    ? candidate.experience
    : [];

  if (experience.length === 0) {
    return 0;
  }

  const completeEntries = experience.filter(
    (item) =>
      item.company &&
      item.role &&
      (item.startDate || item.from) &&
      (item.endDate || item.currentlyWorking)
  ).length;

  const verifiedEntries = experience.filter(
    (item) => item.verified === true
  ).length;

  const completenessScore =
    experience.length > 0
      ? (completeEntries / experience.length) * 70
      : 0;

  const verificationScore =
    experience.length > 0
      ? (verifiedEntries / experience.length) * 30
      : 0;

  return clamp(completenessScore + verificationScore);
};

const calculateEngagementScore = (candidate) => {
  const profileViews = Number(candidate.profileViews || 0);
  const loginCount = Number(candidate.loginCount || 0);
  const applicationsCount = Number(candidate.applicationsCount || 0);
  const interviewCount = Number(candidate.interviewCount || 0);

  return clamp(
    Math.min(profileViews * 0.5, 25) +
      Math.min(loginCount * 1.5, 25) +
      Math.min(applicationsCount * 2, 30) +
      Math.min(interviewCount * 5, 20)
  );
};

const calculateActivityScore = (candidate) => {
  const lastActiveAt =
    candidate.lastActiveAt ||
    candidate.lastLoginAt ||
    candidate.updatedAt;

  if (!lastActiveAt) {
    return 0;
  }

  const daysSinceActivity =
    (Date.now() - new Date(lastActiveAt).getTime()) /
    (1000 * 60 * 60 * 24);

  if (daysSinceActivity <= 1) {
    return 100;
  }

  if (daysSinceActivity <= 3) {
    return 90;
  }

  if (daysSinceActivity <= 7) {
    return 75;
  }

  if (daysSinceActivity <= 14) {
    return 55;
  }

  if (daysSinceActivity <= 30) {
    return 35;
  }

  return 15;
};

const buildVerificationSignals = (candidate) => {
  const resumeVerified = Boolean(
    candidate.resumeVerified ||
      candidate.resumeUrl ||
      candidate.resume
  );

  const profileImageVerified = Boolean(
    candidate.profileImageVerified ||
      candidate.profileImage ||
      candidate.photo
  );

  const videoVerified = Boolean(
    candidate.selfIntroVideoVerified ||
      candidate.selfIntroVideo ||
      candidate.videoProfile
  );

  const experience = Array.isArray(candidate.experience)
    ? candidate.experience
    : [];

  const education = Array.isArray(candidate.education)
    ? candidate.education
    : [];

  const skills = Array.isArray(candidate.skills) ? candidate.skills : [];

  const employmentVerified =
    experience.length > 0 &&
    experience.some((item) => item.verified === true);

  const educationVerified =
    education.length > 0 &&
    education.some((item) => item.verified === true);

  const skillsVerified =
    skills.length > 0 &&
    skills.some(
      (item) =>
        item.verified === true ||
        item.assessmentPassed === true ||
        item.endorsements > 0
    );

  const onlinePresenceVerified = Boolean(
    candidate.linkedinUrl ||
      candidate.githubUrl ||
      candidate.portfolioUrl
  );

  const backgroundVerified = Boolean(
    candidate.backgroundCheckVerified ||
      candidate.identityVerified ||
      candidate.isVerified
  );

  const signals = [
    {
      key: "resume",
      label: "Resume Verification",
      description: "AI reviewed your resume authenticity",
      verified: resumeVerified,
    },
    {
      key: "profileImage",
      label: "Profile Image",
      description: "Professional profile image detected",
      verified: profileImageVerified,
    },
    {
      key: "selfIntroVideo",
      label: "Self Intro Video",
      description: "Candidate introduction video verified",
      verified: videoVerified,
    },
    {
      key: "employmentHistory",
      label: "Employment History",
      description: "Employment experience verified",
      verified: employmentVerified,
    },
    {
      key: "education",
      label: "Education Details",
      description: "Education credentials verified",
      verified: educationVerified,
    },
    {
      key: "skills",
      label: "Skills & Endorsements",
      description: "Skills validated through profile signals",
      verified: skillsVerified,
    },
    {
      key: "onlinePresence",
      label: "Online Presence",
      description: "Professional online presence available",
      verified: onlinePresenceVerified,
    },
    {
      key: "background",
      label: "Identity & Background",
      description: "Identity verification status",
      verified: backgroundVerified,
    },
  ];

  return signals.map((signal) => ({
    key: signal.key,
    label: signal.label,
    description: signal.description,
    status: signal.verified ? "verified" : "pending",
    score: signal.verified ? 100 : 0,
    verifiedAt: signal.verified ? new Date() : null,
  }));
};

const calculateVerificationLevel = (signals) => {
  if (!signals.length) {
    return 0;
  }

  const verifiedSignals = signals.filter(
    (signal) => signal.status === "verified"
  ).length;

  return clamp((verifiedSignals / signals.length) * 100);
};

const buildInsights = ({
  profileCompleteness,
  skillsMatch,
  experienceQuality,
  engagement,
  verificationLevel,
}) => {
  const insights = [];

  if (profileCompleteness >= 85) {
    insights.push({
      title: "Strong profile completion",
      message:
        "Your profile contains enough information to build recruiter confidence.",
      type: "positive",
    });
  } else {
    insights.push({
      title: "Complete your profile",
      message:
        "Add missing profile details to improve your Trust Passport score.",
      type: "recommendation",
    });
  }

  if (skillsMatch >= 75) {
    insights.push({
      title: "Competitive skill profile",
      message:
        "Your verified skills create a strong foundation for relevant job matching.",
      type: "positive",
    });
  } else {
    insights.push({
      title: "Verify more skills",
      message:
        "Add assessments, endorsements and project evidence for your important skills.",
      type: "recommendation",
    });
  }

  if (experienceQuality < 70) {
    insights.push({
      title: "Improve experience evidence",
      message:
        "Add complete dates, responsibilities and verification evidence for employment entries.",
      type: "recommendation",
    });
  }

  if (verificationLevel < 80) {
    insights.push({
      title: "Complete pending verification",
      message:
        "Upload your introduction video and verify missing credentials.",
      type: "warning",
    });
  }

  if (engagement < 60) {
    insights.push({
      title: "Stay active",
      message:
        "Apply for relevant jobs and keep your profile updated to improve engagement.",
      type: "information",
    });
  }

  return insights.slice(0, 4);
};

const getStatus = (score) => {
  if (score >= 90) {
    return "Exceptional";
  }

  if (score >= 80) {
    return "Excellent";
  }

  if (score >= 70) {
    return "Strong";
  }

  if (score >= 55) {
    return "Good";
  }

  return "Needs Improvement";
};

const calculateRankPercentile = async (candidateScore) => {
  const totalCandidates = await TrustPassport.countDocuments({
    score: { $gt: 0 },
  });

  if (totalCandidates === 0) {
    return null;
  }

  const candidatesBelow = await TrustPassport.countDocuments({
    score: { $lt: candidateScore },
  });

  return clamp((candidatesBelow / totalCandidates) * 100);
};

const calculateTrustPassport = async (candidate) => {
  const verificationSignals = buildVerificationSignals(candidate);

  const profileCompleteness =
    calculateProfileCompleteness(candidate);

  const skillsMatch = calculateSkillsScore(candidate);

  const experienceQuality =
    calculateExperienceScore(candidate);

  const engagement = calculateEngagementScore(candidate);

  const activityScore = calculateActivityScore(candidate);

  const verificationLevel =
    calculateVerificationLevel(verificationSignals);

  /*
   * Weighted Trust Passport score:
   *
   * Profile completeness: 20%
   * Skills:              20%
   * Experience:          20%
   * Verification:        25%
   * Engagement:          10%
   * Activity:             5%
   */

  const score = clamp(
    profileCompleteness * 0.2 +
      skillsMatch * 0.2 +
      experienceQuality * 0.2 +
      verificationLevel * 0.25 +
      engagement * 0.1 +
      activityScore * 0.05
  );

  const roundedScore = Number(score.toFixed(1));
  const rating = Number((roundedScore / 10).toFixed(1));
  const rankPercentile = await calculateRankPercentile(roundedScore);

  const breakdown = {
    profileCompleteness: Number(profileCompleteness.toFixed(1)),
    skillsMatch: Number(skillsMatch.toFixed(1)),
    experienceQuality: Number(experienceQuality.toFixed(1)),
    engagement: Number(engagement.toFixed(1)),
    verificationLevel: Number(verificationLevel.toFixed(1)),
    activityScore: Number(activityScore.toFixed(1)),
  };

  const insights = buildInsights(breakdown);

  const existingPassport = await TrustPassport.findOne({
    candidateId: candidate._id,
  }).lean();

  const previousSignals = new Map(
    (existingPassport?.verificationSignals || []).map((signal) => [
      signal.key,
      signal.status,
    ])
  );

  const newActivities = verificationSignals
    .filter(
      (signal) =>
        signal.status === "verified" &&
        previousSignals.get(signal.key) !== "verified"
    )
    .map((signal) => ({
      type: signal.key,
      title: `${signal.label} verified`,
      description: signal.description,
      createdAt: new Date(),
    }));

  const previousActivities =
    existingPassport?.recentActivity || [];

  const recentActivity = [
    ...newActivities,
    ...previousActivities,
  ]
    .sort(
      (first, second) =>
        new Date(second.createdAt) -
        new Date(first.createdAt)
    )
    .slice(0, 20);

  const nextRefreshAt = new Date(
    Date.now() + 24 * 60 * 60 * 1000
  );

  return TrustPassport.findOneAndUpdate(
    {
      candidateId: candidate._id,
    },
    {
      $set: {
        score: roundedScore,
        rating,
        rankPercentile,
        status: getStatus(roundedScore),
        breakdown,
        verificationSignals,
        insights,
        recentActivity,
        lastCalculatedAt: new Date(),
        nextRefreshAt,
      },
    },
    {
      new: true,
      upsert: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );
};

module.exports = {
  calculateTrustPassport,
};