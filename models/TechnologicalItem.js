const { Schema, model, models, default: mongoose } = require("mongoose");

const TechProcessSchema = new Schema({
    name: { type: String, required: true }, 
    components: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' }, 
        name: { type: String },
        quantity: { type: Number },
    }],
    createdBy: { type: String }, 
}, {
    timestamps: true,
    strictPopulate: false,
});

export const TechProcess = models.TechProcess || model('TechProcess', TechProcessSchema);