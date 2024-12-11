import { model, models, Schema } from "mongoose";

const ComponentsSchema = new Schema({
    name: { type: String, required: true, index: true },
    unitPrice: { type: String, required: true },
    company: [{ type: Schema.Types.ObjectId, ref: 'Company' }],
    invoice: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    quantity: { type: Number },
    minQuantity: { type: Number },
    images: { type: String },
    comments: { type: String }

},
    {
        timestamps: true,
    }
);
ComponentsSchema.index({ name: 'text' });
export const Components = models?.Component || model('Component', ComponentsSchema);