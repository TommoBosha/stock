import { model, models, Schema } from "mongoose";

const ClientsSchema = new Schema({
    name: { type: String, required: true, index: true },
    address: { type: String },
    site: { type: String },
    orders: [{ type: Schema.Types.ObjectId, ref: 'Order' }],
    requisites: [{
        MFO: { type: String },
        IBAN: { type: String },
        EDRPOU: { type: String },
        IPN: { type: String },
        address: { type: String }
    }],
    tel: { type: String },
    comments: { type: String }
});
ClientsSchema.index({ name: 'text' });
export const Client = models?.Client || model('Client', ClientsSchema);