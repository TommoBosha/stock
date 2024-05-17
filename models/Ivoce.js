import mongoose, { model, models, Schema } from "mongoose";

const InvociesSchema = new Schema({
  invoceNumber: { type: String },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  IBAN: { type: String },
  components: [{
    component: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' },
    name: { type: String },
    quantity: { type: Number },
    unitPrice: { type: Number },
    totalPrice: { type: Number }
  }],
  data: { type: Date },
  discount: { type: Boolean, default: false },
  discountValue: { type: String },
  totalPrice: { type: String },
  withVAT: { type: Boolean, default: false },
  priceWithoutVAT: { type: String },
  VAT: { type: String },
  totalPriceWithVAT: { type: String },
  comments: { type: String }
});

export const Invoice = models?.Invoice || model("Invoice", InvociesSchema);
