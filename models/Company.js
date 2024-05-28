import { model, models, Schema } from "mongoose";

const CompaniesSchema = new Schema({
    name: { type: String, required: true, index: true },
    address: { type: String },
    site: { type: String },
    invoce: [{ type: Schema.Types.ObjectId, ref: 'Invoice' }],
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
CompaniesSchema.index({ name: 'text' });
export const Company = models?.Company || model('Company', CompaniesSchema);
