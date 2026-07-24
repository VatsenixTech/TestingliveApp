const express = require("express");

const {
  createPayment,
  submitPayment,
  getPaymentStatus,
} = require("../controllers/manualUpiController");

const router = express.Router();

router.post("/create", createPayment);
router.post("/submit", submitPayment);
router.get("/status/:candidateId", getPaymentStatus);

module.exports = router;
