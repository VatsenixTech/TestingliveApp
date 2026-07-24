const mongoose = require("mongoose");
const QRCode = require("qrcode");

const Candidate = require("../models/Candidate");
const ManualUpiPayment = require("../models/ManualUpiPayment");

const PLAN_CONFIG = {
  pro: {
    planName: "Pro",
    amount: Number(process.env.PRO_PLAN_PRICE || 899),
  },

  ultimate: {
    planName: "Ultimate",
    amount: Number(process.env.ULTIMATE_PLAN_PRICE || 1999),
  },
};

const getBusinessUpiId = () =>
  String(process.env.BUSINESS_UPI_ID || "").trim();

const getBusinessName = () =>
  String(process.env.BUSINESS_NAME || "NoPromptJobs").trim();

const buildUpiIntentUrl = ({
  upiId,
  businessName,
  amount,
  transactionNote,
}) => {
  const params = new URLSearchParams({
    pa: upiId,
    pn: businessName,
    am: Number(amount).toFixed(2),
    cu: "INR",
    tn: transactionNote,
  });

  return `upi://pay?${params.toString()}`;
};

const createPayment = async (req, res, next) => {
  try {
    const candidateId = String(req.body.candidateId || "").trim();

    const planKey = String(req.body.planKey || "")
      .trim()
      .toLowerCase();

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "A valid candidate ID is required.",
      });
    }

    const plan = PLAN_CONFIG[planKey];

    if (!plan) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid subscription plan.",
      });
    }

    const businessUpiId = getBusinessUpiId();

    if (!businessUpiId) {
      return res.status(500).json({
        success: false,
        message:
          "BUSINESS_UPI_ID is missing in the backend .env file.",
      });
    }

    const candidate = await Candidate.findById(candidateId);

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account was not found.",
      });
    }

    if (
      candidate.subscriptionStatus === "active" &&
      candidate.activePlan === plan.planName
    ) {
      return res.status(200).json({
        success: true,
        alreadyActive: true,
        redirectUrl:
          planKey === "ultimate"
            ? "/ultimate-dashboard"
            : `/dashboard/${candidate._id}`,
      });
    }

    const businessName = getBusinessName();

    const payment = await ManualUpiPayment.create({
      candidate: candidate._id,
      planKey,
      planName: plan.planName,
      amount: plan.amount,
      currency: "INR",
      businessName,
      businessUpiId,
      status: "created",
    });

    const intentUrl = buildUpiIntentUrl({
      upiId: businessUpiId,
      businessName,
      amount: plan.amount,
      transactionNote: `NoPromptJobs ${plan.planName} subscription`,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(intentUrl, {
      width: 320,
      margin: 2,
      errorCorrectionLevel: "M",
    });

    return res.status(201).json({
      success: true,
      message: "UPI payment request created successfully.",

      order: {
        paymentId: payment._id,
        planKey,
        planName: plan.planName,
        amount: plan.amount,
        currency: "INR",
      },

      upi: {
        businessName,
        upiId: businessUpiId,
        intentUrl,
        qrCodeDataUrl,
      },
    });
  } catch (error) {
    return next(error);
  }
};

const submitPayment = async (req, res, next) => {
  try {
    const candidateId = String(req.body.candidateId || "").trim();

    const planKey = String(req.body.planKey || "")
      .trim()
      .toLowerCase();

    const paymentReference = String(
      req.body.paymentReference || ""
    )
      .trim()
      .toUpperCase();

    const payerName = String(req.body.payerName || "").trim();

    const payerUpiId = String(req.body.payerUpiId || "")
      .trim()
      .toLowerCase();

    const paymentDateValue = String(
      req.body.paymentDate || ""
    ).trim();

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "A valid candidate ID is required.",
      });
    }

    if (!PLAN_CONFIG[planKey]) {
      return res.status(400).json({
        success: false,
        message: "Please select a valid subscription plan.",
      });
    }

    if (paymentReference.length < 8) {
      return res.status(400).json({
        success: false,
        message:
          "Enter a valid UPI transaction reference or UTR.",
      });
    }

    const duplicatePayment = await ManualUpiPayment.findOne({
      paymentReference,
    });

    if (duplicatePayment) {
      return res.status(409).json({
        success: false,
        message:
          "This UPI transaction reference has already been submitted.",
      });
    }

    const payment = await ManualUpiPayment.findOne({
      candidate: candidateId,
      planKey,
      status: "created",
    }).sort({ createdAt: -1 });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message:
          "Start the UPI payment again before submitting payment details.",
      });
    }

    payment.paymentReference = paymentReference;
    payment.payerName = payerName;
    payment.payerUpiId = payerUpiId;

    payment.paymentDate = paymentDateValue
      ? new Date(`${paymentDateValue}T00:00:00.000Z`)
      : new Date();

    payment.status = "pending";
    payment.submittedAt = new Date();

    const testAutoApproveEnabled =
      String(process.env.UPI_TEST_AUTO_APPROVE || "")
        .trim()
        .toLowerCase() === "true";

    const isOneRupeeTestPayment =
      Number(payment.amount) === 1;

    if (testAutoApproveEnabled && isOneRupeeTestPayment) {
      payment.status = "approved";
      payment.reviewedAt = new Date();

      const subscriptionStartedAt = new Date();
      const subscriptionExpiresAt = new Date(
        subscriptionStartedAt.getTime() +
          30 * 24 * 60 * 60 * 1000
      );

      await Candidate.findByIdAndUpdate(
        candidateId,
        {
          plan: payment.planName,
          activePlan: payment.planName,
          subscriptionStatus: "active",
          subscriptionActivatedAt: subscriptionStartedAt,
          subscriptionExpiresAt,
          subscriptionSource: "upi_test_auto_approval",
        },
        {
          runValidators: true,
        }
      );
    }

    await payment.save();

    return res.status(200).json({
      success: true,
      message:
        payment.status === "approved"
          ? "Test payment approved successfully. Opening your dashboard..."
          : "UPI payment submitted successfully. Your plan will be activated after verification.",
      paymentId: payment._id,
      status: payment.status,
      autoApproved: payment.status === "approved",
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({
        success: false,
        message:
          "This UPI transaction reference has already been submitted.",
      });
    }

    return next(error);
  }
};

const getPaymentStatus = async (req, res, next) => {
  try {
    const candidateId = String(
      req.params.candidateId || ""
    ).trim();

    if (!mongoose.Types.ObjectId.isValid(candidateId)) {
      return res.status(400).json({
        success: false,
        message: "A valid candidate ID is required.",
      });
    }

    const candidate = await Candidate.findById(candidateId).select(
      "plan activePlan subscriptionStatus subscriptionActivatedAt subscriptionExpiresAt"
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate account was not found.",
      });
    }

    const payment = await ManualUpiPayment.findOne({
      candidate: candidate._id,
    })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,

      subscription: {
        plan:
          candidate.activePlan ||
          candidate.plan ||
          "Basic",

        status:
          candidate.subscriptionStatus ||
          "inactive",

        startsAt:
          candidate.subscriptionActivatedAt ||
          null,

        expiresAt:
          candidate.subscriptionExpiresAt ||
          null,
      },

      payment: payment
        ? {
            id: payment._id,
            planKey: payment.planKey,
            planName: payment.planName,
            amount: payment.amount,
            status: payment.status,
            rejectionReason:
              payment.rejectionReason || "",
            submittedAt: payment.submittedAt,
          }
        : null,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createPayment,
  submitPayment,
  getPaymentStatus,
};
