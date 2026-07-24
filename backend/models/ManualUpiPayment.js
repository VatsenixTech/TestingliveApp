const mongoose = require("mongoose");

const manualUpiPaymentSchema = new mongoose.Schema(
  {
    candidate: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Candidate",
      required: true,
      index: true,
    },

    planKey: {
      type: String,
      enum: ["pro", "ultimate"],
      required: true,
    },

    planName: {
      type: String,
      enum: ["Pro", "Ultimate"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    businessName: {
      type: String,
      required: true,
      trim: true,
    },

    businessUpiId: {
      type: String,
      required: true,
      trim: true,
    },

    paymentReference: {
      type: String,
      trim: true,
      uppercase: true,
      default: undefined,
    },

    payerName: {
      type: String,
      trim: true,
      default: "",
    },

    payerUpiId: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    paymentDate: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["created", "pending", "approved", "rejected"],
      default: "created",
      index: true,
    },

    rejectionReason: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: null,
    },

    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

manualUpiPaymentSchema.index(
  { paymentReference: 1 },
  {
    unique: true,
    sparse: true,
  }
);

module.exports = mongoose.model(
  "ManualUpiPayment",
  manualUpiPaymentSchema
);
