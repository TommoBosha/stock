import { model, models, Schema } from "mongoose";

const CurrencySchema = new Schema({
    currency: { type: String, required: true },
    date: { type: Date, required: true },

},
    {
        timestamps: true,
    }
);

export const Currency = models?.Currency || model('Currency', CurrencySchema);