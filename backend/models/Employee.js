import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    designation: String,
    department: String,
    manager: String,
    employmentType: { type: String, default: "Full-Time" },
    workLocation: String,
    joiningDate: String,
    status: { type: String, default: "Active" },
  },
  { timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);