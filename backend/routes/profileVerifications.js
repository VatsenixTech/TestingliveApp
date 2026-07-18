const express = require("express");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const Candidate = require("../models/Candidate");
const CandidateProfile = require("../models/CandidateProfile");
const VerificationOtp = require("../models/VerificationOtp");

const { requireCandidateAuth } = require("../middleware/candidateAuth");
const { sendProfileEmailOtp } = require("../services/profileMailer");
const {
  sendMobileOtp,
  checkMobileOtp,
} = require("../services/twilioVerify");

const router = express.Router();

router.use(requireCandidateAuth);

function createOtp() {
  return crypto.randomInt(100000, 1000000).toString();
}

/* SEND EMAIL OTP TO LOGGED-IN CANDIDATE */
router.post("/email/send", async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.candidate._id);

    if (candidate.isEmailVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const code = createOtp();
    const codeHash = await bcrypt.hash(code, 12);

    await VerificationOtp.deleteMany({
      candidateId: candidate._id,
      purpose: "profile_email",
    });

    await VerificationOtp.create({
      candidateId: candidate._id,
      purpose: "profile_email",
      destination: candidate.email,
      codeHash,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    await sendProfileEmailOtp({
      email: candidate.email,
      code,
      name: candidate.name,
    });

    return res.json({
      success: true,
      message: `OTP sent to ${candidate.email}`,
    });
  } catch (error) {
    console.error("PROFILE EMAIL OTP SEND ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not send email OTP",
    });
  }
});

/* VERIFY EMAIL OTP */
router.post("/email/verify", async (req, res) => {
  try {
    const code = String(req.body.code || "").trim();

    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 6-digit OTP",
      });
    }

    const otpRecord = await VerificationOtp.findOne({
      candidateId: req.candidate._id,
      purpose: "profile_email",
    });

    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Request a new OTP.",
      });
    }

    if (otpRecord.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Request a new OTP.",
      });
    }

    const matched = await bcrypt.compare(code, otpRecord.codeHash);

    if (!matched) {
      otpRecord.attempts += 1;
      await otpRecord.save();

      return res.status(400).json({
        success: false,
        message: "Incorrect OTP",
      });
    }

    const now = new Date();

    await Candidate.findByIdAndUpdate(req.candidate._id, {
      $set: {
        isEmailVerified: true,
        emailVerifiedAt: now,
      },
    });

    await CandidateProfile.findOneAndUpdate(
      { candidateId: req.candidate._id },
      {
        $set: {
          "verification.emailVerified": true,
          "verification.emailVerifiedAt": now,
        },
      },
      { upsert: true, new: true }
    );

    await VerificationOtp.deleteOne({ _id: otpRecord._id });

    return res.json({
      success: true,
      message: "Email verified successfully",
      verifiedAt: now,
    });
  } catch (error) {
    console.error("PROFILE EMAIL OTP VERIFY ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Could not verify email OTP",
    });
  }
});

/* SEND MOBILE OTP THROUGH TWILIO VERIFY */
router.post("/mobile/send", async (req, res) => {
  try {
    const phone = String(req.body.phone || "").trim();

    /*
      Use E.164 format, for example +919876543210.
    */
    if (!/^\+[1-9]\d{7,14}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message:
          "Enter the phone in international format, for example +919876543210",
      });
    }

    const candidate = await Candidate.findById(req.candidate._id);

    if (candidate.phone !== phone) {
      candidate.phone = phone;
      candidate.isMobileVerified = false;
      candidate.mobileVerifiedAt = null;
      await candidate.save();

      await CandidateProfile.findOneAndUpdate(
        { candidateId: candidate._id },
        {
          $set: {
            phone,
            "verification.mobileVerified": false,
            "verification.mobileVerifiedAt": null,
          },
        },
        { upsert: true }
      );
    }

    await sendMobileOtp(phone);

    return res.json({
      success: true,
      message: `OTP sent to ${phone}`,
    });
  } catch (error) {
    console.error("MOBILE OTP SEND ERROR:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Could not send mobile OTP",
    });
  }
});

/* CHECK MOBILE OTP THROUGH TWILIO VERIFY */
router.post("/mobile/verify", async (req, res) => {
  try {
    const code = String(req.body.code || "").trim();
    const candidate = await Candidate.findById(req.candidate._id);

    if (!candidate.phone) {
      return res.status(400).json({
        success: false,
        message: "Add your mobile number first",
      });
    }

    if (!/^\d{4,10}$/.test(code)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid OTP",
      });
    }

    const result = await checkMobileOtp(candidate.phone, code);

    if (result.status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Incorrect or expired OTP",
      });
    }

    const now = new Date();

    candidate.isMobileVerified = true;
    candidate.mobileVerifiedAt = now;
    await candidate.save();

    await CandidateProfile.findOneAndUpdate(
      { candidateId: candidate._id },
      {
        $set: {
          phone: candidate.phone,
          "verification.mobileVerified": true,
          "verification.mobileVerifiedAt": now,
        },
      },
      { upsert: true, new: true }
    );

    return res.json({
      success: true,
      message: "Mobile number verified successfully",
      verifiedAt: now,
    });
  } catch (error) {
    console.error("MOBILE OTP VERIFY ERROR:", error);
    return res.status(400).json({
      success: false,
      message: error.message || "Incorrect or expired OTP",
    });
  }
});

module.exports = router;
