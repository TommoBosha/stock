const { Schema, model, models, default: mongoose } = require("mongoose");

const TechProcessSchema = new Schema({
    name: { type: String, required: true }, // Назва технологічки
    components: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' }, // Посилання на компонент
        name: { type: String },
        quantity: { type: Number },
    }],
    createdBy: { type: String }, // Хто створив технологічку
}, {
    timestamps: true,
    strictPopulate: false,
});

export const TechProcess = models.TechProcess || model('TechProcess', TechProcessSchema);