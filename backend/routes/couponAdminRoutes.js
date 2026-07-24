const express = require("express");

const {
  listCoupons,
  createCoupon,
  updateCoupon,
  setCouponStatus,
  deleteCoupon,
  getCouponAnalytics,
} = require("../controllers/couponAdminController");

const {
  requireCouponAdmin,
} = require("../middleware/requireCouponAdmin");

const router = express.Router();

router.use(requireCouponAdmin);

router.get("/", listCoupons);
router.post("/", createCoupon);
router.get("/analytics", getCouponAnalytics);
router.put("/:id", updateCoupon);
router.patch("/:id/status", setCouponStatus);
router.delete("/:id", deleteCoupon);

module.exports = router;
