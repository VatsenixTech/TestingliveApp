const express =
  require("express");

const {
  generateAlerts,
  getCandidateAlerts,
  markAlertRead,
  toggleSavedAlert,
  dismissAlert,
} = require(
  "../controllers/jobAlertsController"
);

const router =
  express.Router();


router.get(
  "/test",
  (req, res) => {
    res.json({
      success: true,
      message:
        "Job alerts API is working",
    });
  }
);


router.post(
  "/generate/:candidateId",
  generateAlerts
);


router.get(
  "/candidate/:candidateId",
  getCandidateAlerts
);


router.patch(
  "/:alertId/read",
  markAlertRead
);


router.patch(
  "/:alertId/save",
  toggleSavedAlert
);


router.patch(
  "/:alertId/dismiss",
  dismissAlert
);


module.exports =
  router;