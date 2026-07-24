const express = require("express");

const {
  getMyReferral,
  registerReferral,
} = require("../controllers/referralController");

const router = express.Router();

/*
   GET /api/referrals/me?candidateId=xxxxx
*/
router.get("/me", getMyReferral);

/*
   POST /api/referrals/register
*/
router.post("/register", registerReferral);

module.exports = router;