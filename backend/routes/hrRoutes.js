const express = require("express");
const nodemailer = require("nodemailer");
const path = require("path");
const OfferLetter = require("../models/OfferLetter");
const generatePremiumOfferPdf = require("../utils/generatePremiumOfferPdf");

const router = express.Router();

router.post("/offer-letters/create-and-send", async (req, res) => {
  try {
    const {
      candidateName,
      candidateEmail,
      candidatePhone,
      candidateAddress,
      designation,
      department,
      reportingManager,
      joiningDate,
      workLocation,
      ctc,
      employmentType,
      grade,
      probation,
      workingModel,
      officeHours,
      salary,
      sendEmail,
    } = req.body;

    console.log("================================");
    console.log("Candidate:", candidateName);
    console.log("Address:", candidateAddress);
    console.log("Salary Object:", salary);
    console.log("Send Email:", sendEmail);
    console.log("================================");

    if (!candidateName || !candidateEmail || !designation) {
      return res.status(400).json({
        success: false,
        message: "Candidate name, email, and designation are required",
      });
    }

    const count = await OfferLetter.countDocuments();

    const offer = await OfferLetter.create({
      offerRefNo: `VSPL/HR/2026/${String(count + 1).padStart(3, "0")}`,

      candidateName,
      candidateEmail,
      candidatePhone,
      candidateAddress,

      designation,
      department,
      reportingManager,

      joiningDate,
      workLocation,
      ctc,

      employmentType,
      grade,
      probation,
      workingModel,
      officeHours,

      salary: salary || {},

      status: "Generated",
    });

    const pdfPath = await generatePremiumOfferPdf(offer);

    offer.pdfPath = pdfPath;
    await offer.save();

    if (sendEmail && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: `"Vatsenix HR" <${process.env.EMAIL_USER}>`,
        to: candidateEmail,
        subject: `Offer Letter - ${designation} - Vatsenix Software Private Limited`,
        html: `
          <p>Dear ${candidateName},</p>

          <p>Congratulations!</p>

          <p>
            We are pleased to offer you the position of 
            <b>${designation}</b> at <b>Vatsenix Software Private Limited</b>.
          </p>

          <p>Please find your official offer letter attached.</p>

          <p>Kindly review the offer letter and confirm your acceptance.</p>

          <br/>

          <p>Warm Regards,</p>
          <p>
            <b>HR Team</b><br/>
            Vatsenix Software Private Limited
          </p>
        `,
        attachments: [
          {
            filename: `Offer_Letter_${candidateName.replace(/\s+/g, "_")}.pdf`,
            path: pdfPath,
          },
        ],
      });

      offer.status = "Sent";
      offer.sentAt = new Date();
      await offer.save();
    }

    res.status(201).json({
      success: true,
      message: sendEmail
        ? "Offer letter generated and sent successfully"
        : "Offer letter generated successfully",
      offer,
    });
  } catch (error) {
    console.log("CREATE OFFER ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.get("/offer-letters/:id/pdf", async (req, res) => {
  try {
    const offer = await OfferLetter.findById(req.params.id);

    if (!offer || !offer.pdfPath) {
      return res.status(404).json({ message: "PDF not found" });
    }

    res.sendFile(path.resolve(offer.pdfPath));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offer-letters/:id", async (req, res) => {
  try {
    const offer = await OfferLetter.findById(req.params.id);

    if (!offer) {
      return res.status(404).json({ message: "Offer letter not found" });
    }

    res.json({
      success: true,
      offer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/offer-letters", async (req, res) => {
  try {
    const offers = await OfferLetter.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      offers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;