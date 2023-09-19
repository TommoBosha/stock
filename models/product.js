const { Schema, model, models, default: mongoose } = require("mongoose");

const ProductSchema = new Schema({
    title: { type: String, required: true },
    description: String,
    productIndex: { type: Number, required: true, unique: true, index: true },
    price: { type: Number, required: true },
    images: [{ type: String }],
    category: { type: mongoose.Types.ObjectId, ref: 'Category' },
    properties: { type: Object },
    tag: { type: Object },
},
    {
        timestamps: true,
    });

export const Product = models.Product || model('Product', ProductSchema);