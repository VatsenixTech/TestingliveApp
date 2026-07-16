const RoleSkillProfile =
  require("../models/RoleSkillProfile");

const {
  normalizeText,
} = require(
  "./roleIntelligenceService"
);


/*
 * Replace this import with your existing
 * OpenAI/Gemini AI service.
 *
 * Expected method:
 *
 * generateStructuredJSON({
 *   systemPrompt,
 *   userPrompt
 * })
 */

const {
  generateStructuredJSON,
} = require("./aiService");


function validateSkill(skill) {
  return (
    skill &&
    typeof skill.name === "string" &&
    skill.name.trim() &&
    typeof skill.category === "string" &&
    skill.category.trim() &&
    Number.isFinite(
      Number(skill.weight)
    ) &&
    Number(skill.weight) >= 1 &&
    Number(skill.weight) <= 10
  );
}


function sanitizeSkill(skill) {
  return {
    name:
      String(skill.name)
        .trim(),

    normalizedName:
      normalizeText(skill.name),

    category:
      String(skill.category)
        .trim(),

    weight:
      Math.min(
        Math.max(
          Number(skill.weight),
          1
        ),
        10
      ),

    priority:
      [
        "Critical",
        "High",
        "Medium",
        "Low",
      ].includes(
        skill.priority
      )
        ? skill.priority
        : "Medium",

    aliases:
      [
        ...new Set(
          (
            skill.aliases || []
          )
            .map(normalizeText)
            .filter(Boolean)
        ),
      ],

    description:
      String(
        skill.description ||
          ""
      ).trim(),
  };
}


async function generateRoleProfile(
  requestedRole
) {
  const normalizedRole =
    normalizeText(requestedRole);


  /*
   * Prevent duplicate generation
   * caused by simultaneous requests.
   */

  const existing =
    await RoleSkillProfile.findOne({
      normalizedRole,
      isActive: true,
    });

  if (existing) {
    return existing.toObject();
  }


  const systemPrompt = `
You are the occupation intelligence engine for
NoPromptJobs.

Create a professional role skill profile.

The system supports occupations across:

Information Technology
Human Resources
Finance and Accounting
Administration
Sales
Marketing
Operations
Supply Chain
Procurement
Legal
Healthcare
Engineering
Manufacturing
Customer Service
Product Management
Project Management
Consulting
Education
Design

RULES:

1. Identify the canonical occupation title.

2. Identify the department.

3. Identify the industry or use "General".

4. Identify the job family.

5. Generate 8 to 18 required skills.

6. Generate 3 to 10 preferred skills.

7. Skills must be realistic for the occupation.

8. Do not invent certifications, technologies,
or regulatory requirements.

9. Avoid duplicate skills.

10. Every skill must have:

name
category
weight between 1 and 10
priority
aliases
description

11. Return JSON only.

JSON SCHEMA:

{
  "role": "Canonical Role",
  "aliases": [],
  "department": "",
  "industry": "",
  "jobFamily": "",
  "seniorityLevels": [],
  "description": "",
  "requiredSkills": [
    {
      "name": "",
      "category": "",
      "weight": 1,
      "priority": "Critical",
      "aliases": [],
      "description": ""
    }
  ],
  "preferredSkills": []
}
`;


  const generated =
    await generateStructuredJSON({
      systemPrompt,

      userPrompt:
        `Create the occupation profile for: ${requestedRole}`,
    });


  if (
    !generated ||
    !generated.role ||
    !generated.department ||
    !Array.isArray(
      generated.requiredSkills
    )
  ) {
    throw new Error(
      "AI returned an invalid role profile."
    );
  }


  const requiredSkills =
    generated.requiredSkills
      .filter(validateSkill)
      .map(sanitizeSkill);


  const preferredSkills =
    (
      generated.preferredSkills ||
      []
    )
      .filter(validateSkill)
      .map(sanitizeSkill);


  if (
    requiredSkills.length < 5
  ) {
    throw new Error(
      "Generated role profile does not contain enough valid skills."
    );
  }


  const canonicalRole =
    String(
      generated.role
    ).trim();


  const profileData = {
    role:
      canonicalRole,

    normalizedRole:
      normalizeText(
        canonicalRole
      ),

    aliases: [
      ...new Set([
        normalizedRole,

        ...(
          generated.aliases ||
          []
        ).map(
          normalizeText
        ),
      ]),
    ].filter(Boolean),

    department:
      String(
        generated.department
      ).trim(),

    industry:
      String(
        generated.industry ||
          "General"
      ).trim(),

    jobFamily:
      String(
        generated.jobFamily ||
          ""
      ).trim(),

    seniorityLevels:
      (
        generated.seniorityLevels ||
        []
      )
        .map(String)
        .map(
          (value) =>
            value.trim()
        )
        .filter(Boolean),

    description:
      String(
        generated.description ||
          ""
      ).trim(),

    requiredSkills,

    preferredSkills,

    sourceType:
      "AI_GENERATED",

    /*
     * AI generated profiles should not
     * immediately become VERIFIED.
     */

    verificationStatus:
      "PENDING_REVIEW",

    confidenceScore: 70,

    isActive: true,
  };


  /*
   * Use upsert to handle concurrent
   * generation requests safely.
   */

  const profile =
    await RoleSkillProfile.findOneAndUpdate(
      {
        normalizedRole:
          profileData.normalizedRole,
      },

      {
        $setOnInsert:
          profileData,
      },

      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );


  /*
   * Store requested role as an alias
   * if AI canonicalized the title.
   */

  await RoleSkillProfile.updateOne(
    {
      _id:
        profile._id,
    },

    {
      $addToSet: {
        aliases:
          normalizedRole,
      },
    }
  );


  return RoleSkillProfile.findById(
    profile._id
  ).lean();
}


module.exports = {
  generateRoleProfile,
};