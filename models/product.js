const { Schema, model, models, default: mongoose } = require("mongoose");

const ProductSchema = new Schema({
    name: { type: String },
    components: [{
        component: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' },
        name: { type: String },
        quantity: { type: Number },

    }],
    agent: { type: String },
    assemblyPrice: { type: Number },
    images: { type: String },

},
    {
        timestamps: true,
    });

export const Product = models.Product || model('Product', ProductSchema);
