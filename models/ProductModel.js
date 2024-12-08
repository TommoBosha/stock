// const { Schema, model, models, default: mongoose } = require("mongoose");

// const ProductSchema = new Schema({
//     name: { type: String, required: true },
//     components: [{
//         item: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' }, // Переименовано на `item`
//         name: { type: String },
//         quantity: { type: Number },
//     }],
//     products: {
//         type: [{
//             item: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Переименовано на `item`
//             name: { type: String },
//             quantity: { type: Number },
//         }],
//         default: [] // Указано значение по умолчанию
//     },
//     agent: { type: String },
//     assemblyPrice: { type: Number },
//     images: { type: String },
// }, 


//     timestamps: true,
//     strictPopulate: false,
// });

// export const Product = models.Product || model('Product', ProductSchema);


const { Schema, model, models, default: mongoose } = require("mongoose");

const ProductSchema = new Schema(
    {
        name: { type: String, required: true }, // Название изделия (выбирается из технологической карты)
        components: [
            {
                item: { type: mongoose.Schema.Types.ObjectId, ref: 'Component' }, // Ссылка на комплектующую
                name: { type: String }, // Название комплектующей
                quantity: { type: Number }, // Количество комплектующих
                totalPrice: { type: Number }, // Итоговая стоимость комплектующей (quantity * unitPrice)
            },
        ],
        assemblyPrice: { type: String }, // Цена сборки
        salePrice: { type: String }, // Цена реализации
        manufacturingTime: { type: String }, // Срок изготовления
        images: { type: String }, // Ссылка на изображение
    },
    {
        timestamps: true,
        strictPopulate: false, // Для корректной работы `populate`
    }
);

export const Product = models.Product || model("Product", ProductSchema);