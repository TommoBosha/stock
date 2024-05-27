import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    client: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
    data: { type: Date },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        name: { type: String },
        quantity: { type: Number },
      }
    ],

    totalPrice: { type: Number },
    isPaid: { type: String, enum: ["Paid", "NotPaid", "PartlyPaid"] },
    comment: { type: String },
    orderNumber: { type: String },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;