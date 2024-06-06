import mongoose from "mongoose";

const atWorkSchema = new mongoose.Schema(
    {
        orders: [
            {
                order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
                orderNumber: { type: String },
            }
        ],

        date: { type: Date },
        serialNumber: { type: String },
        products: [
            {
                product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
                name: { type: String },
                quantity: { type: Number },
                _id: { type: String },
            }
        ],


        contractor: { type: String, enum: ["Alex", "Den", "VolodyaDzed", "Mykola", "VolodyaKharkiv"] },
        comment: { type: String },

    },
    {
        timestamps: true,
    }
);

const AtWork = mongoose.models.AtWork || mongoose.model("AtWork", atWorkSchema);
export default AtWork;