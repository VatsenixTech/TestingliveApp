export const calculateProfileStrength = (candidate = {}) => {
  let score = 0;

  const hasBasicInformation =
    Boolean(candidate.name || candidate.fullName) &&
    Boolean(candidate.email) &&
    Boolean(candidate.mobile || candidate.phone);

  const hasSkills =
    Array.isArray(candidate.skills) && candidate.skills.length > 0;

  const hasExperience =
    Boolean(candidate.currentRole) ||
    Boolean(candidate.currentCompany) ||
    Boolean(candidate.company) ||
    Boolean(candidate.role) ||
    Boolean(candidate.experience) ||
    (Array.isArray(candidate.experiences) && candidate.experiences.length > 0);

  const hasProjects =
    Array.isArray(candidate.projects) && candidate.projects.length > 0;

  const hasIntroVideo =
    Boolean(candidate.selfIntroVideoUrl) ||
    Boolean(candidate.introVideoUrl) ||
    Boolean(candidate.videoUrl);

  if (hasBasicInformation) score += 20;
  if (hasSkills && hasExperience) score += 20;
  if (hasProjects) score += 20;
  if (hasIntroVideo) score += 20;

  return Math.min(score, 100);
};