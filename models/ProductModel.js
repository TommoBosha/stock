const { Schema, model, models, default: mongoose } = require("mongoose");

const ProductSchema = new Schema({
    name: { type: String, required: true },
    components: [{
        item: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' }, // Переименовано на `item`
        name: { type: String },
        quantity: { type: Number },
    }],
    products: {
        type: [{
            item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Переименовано на `item`
            name: { type: String },
            quantity: { type: Number },
        }],
        default: [] // Указано значение по умолчанию
    },
    agent: { type: String },
    assemblyPrice: { type: Number },
    images: { type: String },
}, {
    timestamps: true,
    strictPopulate: false,
});

export const Product = models.Product || model('Product', ProductSchema);