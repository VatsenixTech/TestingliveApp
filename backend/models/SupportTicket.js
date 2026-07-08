const mongoose = require("mongoose");

const ticketReplySchema = new mongoose.Schema(
  {
    senderType: {
      type: String,
      enum: ["candidate", "support", "system"],
      required: true,
    },

    senderId: {
      type: String,
      default: "",
    },

    senderName: {
      type: String,
      default: "",
      trim: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
    _id: true,
  }
);

const supportTicketSchema = new mongoose.Schema(
  {
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },

    userId: {
      type: String,
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HelpCategory",
      required: true,
      index: true,
    },

    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10000,
    },

    status: {
      type: String,
      enum: [
        "Open",
        "In Progress",
        "Waiting for Customer",
        "Resolved",
        "Closed",
      ],
      default: "Open",
      index: true,
    },

    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },

    assignedTo: {
      type: String,
      default: "",
    },

    replies: {
      type: [ticketReplySchema],
      default: [],
    },

    resolvedAt: {
      type: Date,
      default: null,
    },

    closedAt: {
      type: Date,
      default: null,
    },

    lastActivityAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

/*
Generate a human-readable ticket number.

Example:
NPJ-1751673456789-4821
*/
supportTicketSchema.pre("validate", function (next) {
  if (!this.ticketNumber) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);

    this.ticketNumber = `NPJ-${Date.now()}-${randomNumber}`;
  }

  next();
});

/*
Automatically update ticket timestamps when status changes.
*/
supportTicketSchema.pre("save", function (next) {
  this.lastActivityAt = new Date();

  if (this.isModified("status")) {
    if (this.status === "Resolved" && !this.resolvedAt) {
      this.resolvedAt = new Date();
    }

    if (this.status === "Closed" && !this.closedAt) {
      this.closedAt = new Date();
    }
  }

  next();
});

/*
Useful indexes for My Tickets and support dashboard.
*/
supportTicketSchema.index({
  userId: 1,
  createdAt: -1,
});

supportTicketSchema.index({
  status: 1,
  priority: 1,
  createdAt: -1,
});

module.exports = mongoose.model(
  "SupportTicket",
  supportTicketSchema
);