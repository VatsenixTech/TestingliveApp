export const calculateProfileStrength = (candidate = {}) => {
  /*
    IMPORTANT:

    Put the EXACT calculation currently used by
    CandidateProfilePage here.

    Both CandidateProfilePage and CandidateDashboard
    will call this function.
  */

  let score = 0;

  const hasBasicInformation =
    Boolean(candidate.name) &&
    Boolean(candidate.email) &&
    Boolean(candidate.mobile || candidate.phone);

  const hasSkills =
    Array.isArray(candidate.skills) &&
    candidate.skills.length > 0;

  const hasExperience =
    Boolean(candidate.currentRole) ||
    Boolean(candidate.currentCompany) ||
    (Array.isArray(candidate.experiences) &&
      candidate.experiences.length > 0);

  const hasProjects =
    Array.isArray(candidate.projects) &&
    candidate.projects.length > 0;

  const hasResume =
    Boolean(candidate.resumeUrl);

  /*
    These weights MUST be the same weights
    currently used by CandidateProfilePage.
  */

  if (hasBasicInformation) score += 20;

  if (hasSkills && hasExperience) score += 20;

  if (hasProjects) score += 20;

  if (hasResume) score += 20;

  return Math.min(score, 100);
};