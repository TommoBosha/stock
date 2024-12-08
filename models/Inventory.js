import mongoose, { Schema, model, models } from "mongoose";

const InventorySchema = new Schema({
    name: { type: String, required: true },
    serialNumber: { type: String, required: true },
    quantity: { type: Number, required: true },
    image: { type: String },
    comment: { type: String },
}, { timestamps: true });

export const Inventory = models.Inventory || model("Inventory", InventorySchema);