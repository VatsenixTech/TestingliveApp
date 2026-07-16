const RoleSkillProfile =
  require("../models/RoleSkillProfile");


function normalizeText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9+#.\s-]/g, "")
    .replace(/\s+/g, " ");
}


function escapeRegex(value) {
  return String(value).replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
}


async function findRoleProfile(role) {
  const normalizedRole =
    normalizeText(role);

  if (!normalizedRole) {
    return null;
  }


  /*
   * 1. EXACT ROLE
   */

  let profile =
    await RoleSkillProfile.findOne({
      normalizedRole,

      isActive: true,

      verificationStatus: {
        $in: [
          "VERIFIED",
          "PENDING_REVIEW",
        ],
      },
    }).lean();

  if (profile) {
    return {
      profile,

      matchType: "EXACT",
    };
  }


  /*
   * 2. ALIAS
   */

  profile =
    await RoleSkillProfile.findOne({
      aliases: normalizedRole,

      isActive: true,

      verificationStatus: {
        $in: [
          "VERIFIED",
          "PENDING_REVIEW",
        ],
      },
    }).lean();

  if (profile) {
    return {
      profile,

      matchType: "ALIAS",
    };
  }


  /*
   * 3. LEGACY CASE-INSENSITIVE ROLE
   */

  profile =
    await RoleSkillProfile.findOne({
      role: {
        $regex:
          `^${escapeRegex(role.trim())}$`,

        $options: "i",
      },

      isActive: true,
    }).lean();

  if (profile) {
    return {
      profile,

      matchType: "LEGACY",
    };
  }


  /*
   * IMPORTANT:
   *
   * Do not automatically use a partially
   * matching role profile.
   *
   * Example:
   *
   * Data Analyst
   * Business Analyst
   *
   * These are different occupations.
   */

  return null;
}


async function getRoleSuggestions(
  role,
  limit = 8
) {
  const normalizedRole =
    normalizeText(role);

  const words =
    normalizedRole
      .split(" ")
      .filter(
        (word) =>
          word.length >= 3
      );

  if (!words.length) {
    return [];
  }


  const expressions =
    words.map(
      (word) =>
        new RegExp(
          escapeRegex(word),
          "i"
        )
    );


  return RoleSkillProfile.find({
    isActive: true,

    $or: [
      {
        normalizedRole: {
          $in: expressions,
        },
      },

      {
        aliases: {
          $in: expressions,
        },
      },

      {
        jobFamily: {
          $in: expressions,
        },
      },
    ],
  })
    .select(
      "role department jobFamily confidenceScore verificationStatus"
    )
    .limit(limit)
    .lean();
}


async function getAllRoles({
  department,
  search,
  page = 1,
  limit = 50,
}) {
  const query = {
    isActive: true,
  };


  if (department) {
    query.department = {
      $regex:
        `^${escapeRegex(
          department
        )}$`,

      $options: "i",
    };
  }


  if (search) {
    const regex =
      new RegExp(
        escapeRegex(search),
        "i"
      );

    query.$or = [
      {
        role: regex,
      },

      {
        aliases: regex,
      },

      {
        department: regex,
      },

      {
        jobFamily: regex,
      },
    ];
  }


  const safePage =
    Math.max(
      Number(page) || 1,
      1
    );

  const safeLimit =
    Math.min(
      Math.max(
        Number(limit) || 50,
        1
      ),
      100
    );


  const [
    roles,
    total,
  ] = await Promise.all([
    RoleSkillProfile.find(query)

      .select(
        "role department industry jobFamily aliases confidenceScore verificationStatus"
      )

      .sort({
        department: 1,
        role: 1,
      })

      .skip(
        (safePage - 1) *
          safeLimit
      )

      .limit(safeLimit)

      .lean(),

    RoleSkillProfile.countDocuments(
      query
    ),
  ]);


  return {
    roles,

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
  };
}


module.exports = {
  normalizeText,

  findRoleProfile,

  getRoleSuggestions,

  getAllRoles,
};