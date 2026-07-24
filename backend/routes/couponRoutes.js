const express = require("express");

const {
  applyCoupon,
  validateCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.get("/validate", validateCoupon);
router.post("/apply", applyCoupon);
router.post("/redeem", applyCoupon);

module.exports = router;
