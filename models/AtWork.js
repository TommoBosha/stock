import mongoose from "mongoose";

const atWorkSchema = new mongoose.Schema(
    {
      orders: [
        {
          order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
          orderNumber: { type: String },
        }
      ],
      date: { type: Date }, // Це можна залишити, якщо вона потрібна окремо
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      serialNumber: { type: String },
      products: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
          name: { type: String },
          quantity: { type: Number },
          _id: { type: String },
        }
      ],
      contractors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Staff' }], 
      comment: { type: String },
      status: { type: String, enum: ['inWork', 'done'], default: 'inWork' }
    },
    {
      timestamps: true,
    }
  );

const AtWork = mongoose.models.AtWork || mongoose.model("AtWork", atWorkSchema);
export default AtWork;