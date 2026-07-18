const express = require("express");

const {
  predictSalary,
  getLatestPrediction,
  getPredictionHistory,
  getMarketMetrics,
} = require(
  "../controllers/salaryPredictorController"
);

const router = express.Router();

/*
 * POST
 * /api/salary-predictor/predict
 */
router.post(
  "/predict",
  predictSalary
);

/*
 * GET
 * /api/salary-predictor/latest?candidateId=...
 */
router.get(
  "/latest",
  getLatestPrediction
);

/*
 * GET
 * /api/salary-predictor/history?candidateId=...
 */
router.get(
  "/history",
  getPredictionHistory
);

/*
 * GET
 * /api/salary-predictor/market-metrics
 */
router.get(
  "/market-metrics",
  getMarketMetrics
);

module.exports = router;