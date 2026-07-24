const requireCouponAdmin = (req, res, next) => {
  const configuredAdminKey = String(
    process.env.COUPON_ADMIN_KEY || ""
  ).trim();

  const suppliedAdminKey = String(
    req.headers["x-admin-key"] || ""
  ).trim();

  const authenticatedAdmin =
    req.user &&
    ["admin", "superadmin"].includes(
      String(req.user.role || "").toLowerCase()
    );

  if (authenticatedAdmin) {
    return next();
  }

  if (
    configuredAdminKey &&
    suppliedAdminKey &&
    suppliedAdminKey === configuredAdminKey
  ) {
    return next();
  }

  return res.status(401).json({
    success: false,
    message:
      "Admin authorization is required to manage coupons.",
  });
};

module.exports = {
  requireCouponAdmin,
};
