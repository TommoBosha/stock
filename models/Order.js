import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: String, ref: "User", required: true },
    orderItems: [
      {
        title: { type: String, required: true },
        quantity: { type: Number, required: true },
        images: { type: Array, required: true },
        price: { type: Number, required: true },
        slug: { type: String, required: true },
        productIndex: { type: String, required: true },
      },
    ],
    shippingAddress: {
      fullName: { type: String, required: true },
      address: { type: String },
      city: { type: String },
      postCode: { type: String },
      country: { type: String },
      phone: { type: String, required: true },
      warehouses: { type: String },
      cityName: { type: String },
      deliveryMethod: { type: String, required: true },
    },

    paymentMethod: { type: String, required: true },
    itemsPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    isPaid: { type: Boolean, required: true, default: false },
    isDelivered: { type: Boolean, required: true, default: false },
    paidAt: { type: Date },
    deliveredAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);
export default Order;