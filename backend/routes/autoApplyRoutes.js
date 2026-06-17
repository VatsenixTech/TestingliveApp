const express = require("express");
const router = express.Router();

router.post("/run/:candidateId", async (req, res) => {
  try {
    const { candidateId } = req.params;

    return res.json({
      success: true,
      message: "Auto Apply completed successfully for testing.",
      candidateId,
      appliedCount: 5,
      totalMatchedJobs: 8,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Auto Apply failed",
    });
  }
});

module.exports = router;