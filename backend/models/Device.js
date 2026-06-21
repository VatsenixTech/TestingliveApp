import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    deviceId: {
      type: String,
      required: true,
    },
    deviceType: {
      type: String,
      enum: ["laptop", "mobile"],
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Device", deviceSchema);