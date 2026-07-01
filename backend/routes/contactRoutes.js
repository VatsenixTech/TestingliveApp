const express = require("express");
const ContactMessage = require("../models/ContactMessage");

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { fullName, email, phone, company, subject, message } = req.body;

    if (!fullName || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, subject and message are required",
      });
    }

    const savedMessage = await ContactMessage.create({
      fullName,
      email,
      phone,
      company,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Your enquiry has been received. Our team will contact you soon.",
      data: savedMessage,
    });
  } catch (error) {
    console.error("CONTACT FORM ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit enquiry",
    });
  }
});

module.exports = router;