const express = require("express");
const router = express.Router();

const Notification = require("../models/Notification");

router.get(
  "/candidate/:candidateId",
  async (req, res) => {
    try {
      const notifications =
        await Notification.find({
          candidateId: req.params.candidateId,
        }).sort({ createdAt: -1 });

      res.json({
        success: true,
        notifications,
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Failed to load notifications",
      });
    }
  }
);

router.put(
  "/read-all/:candidateId",
  async (req, res) => {
    try {
      await Notification.updateMany(
        {
          candidateId: req.params.candidateId,
        },
        {
          read: true,
        }
      );

      res.json({
        success: true,
        message: "Marked as read",
      });
    } catch (error) {
      console.log(error);

      res.status(500).json({
        success: false,
        message: "Failed",
      });
    }
  }
);

module.exports = router;