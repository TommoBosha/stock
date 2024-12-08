import mongoose, { Schema, model, models } from "mongoose";

const StaffSchema = new Schema({
    fullName: { type: String, required: true },
    department: { type: String, required: true },
    duties: { type: String, required: true },
    assignedTool: { type: mongoose.Schema.Types.ObjectId, ref: "Inventory" },
}, { timestamps: true });

export const Staff = models.Staff || model("Staff", StaffSchema);
