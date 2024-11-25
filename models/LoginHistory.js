import mongoose from "mongoose";

const LoginHistorySchema = new mongoose.Schema({
  username: { type: String, required: true },
  loginTime: { type: Date, default: Date.now }
});

export default mongoose.models.LoginHistory || mongoose.model('LoginHistory', LoginHistorySchema);