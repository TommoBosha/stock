import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
import { Components } from "@/models/Components";
import { Product } from "@/models/ProductModel";

async function convertNamesToIds(items, model) {
    const itemIds = [];
    if (!Array.isArray(items)) {
        return itemIds;
    }
    for (const item of items) {
        const { name, quantity } = item;
        const itemInfo = await model.findOne({ name });
        if (itemInfo) {
            itemIds.push({
                item: itemInfo._id, // Используем `item` для соответствия схеме
                name,
                quantity,
            });
        }
    }
    return itemIds;
}

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(res, req);

    if (method === "GET") {
        const { type } = req.query;
        
        if (type === 'all') {
            const components = await Components.find();
            const products = await Product.find();
            res.json({ components, products });
        } else if (req.query?.id) {
            const product = await Product.findOne({ _id: req.query.id });
            if (product && product.products && product.products.length > 0) {
                await product.populate('components.component').populate('products.product');
            } else {
                await product.populate('components.component');
            }
            res.json(product);
        } else {
            const products = await Product.find();
            for (const product of products) {
                if (product.products && product.products.length > 0) {
                    await product.populate('components.component').populate('products.product');
                } else {
                    await product.populate('components.component');
                }
            }
            res.json(products);
        }
    }

   if (method === "POST") {
        const { name, components, products, agent, assemblyPrice, images } = req.body;

        // Конвертируем имена в ObjectId для компонентов и изделий
        const componentIds = await convertNamesToIds(components, Components);
        const productIds = await convertNamesToIds(products, Product);

        console.log("Final product data to save:", {
            name,
            components: componentIds,
            products: productIds,
            agent,
            assemblyPrice,
            images
        });

        // Создаем продукт с компонентами и изделиями
        const productDoc = await Product.create({
            name,
            components: componentIds,
            products: productIds,
            agent,
            assemblyPrice,
            images
        });

        console.log("Saved product document:", productDoc); // Дополнительный отладочный вывод

        res.json(productDoc);
    }

    if (method === "PUT") {
        try {
            const { name, components, products, agent, assemblyPrice, images, _id } = req.body;

            const componentIds = await convertNamesToIds(components, Components);
            const productIds = await convertNamesToIds(products, Product);

            console.log("Updating product data:", {
                name,
                components: componentIds,
                products: productIds,
                agent,
                assemblyPrice,
                images
            });

            const productDoc = await Product.findOneAndUpdate(
                { _id },
                {
                    name,
                    components: componentIds,
                    products: productIds,
                    agent,
                    assemblyPrice,
                    images,
                },
                { new: true }
            ).populate('components.component').populate('products.product');

            res.json(productDoc);
        } catch (error) {
            console.error("Помилка при оновленні продукту:", error);
            res.status(500).json({ error: "Помилка при оновленні продукту" });
        }
    }

    if (method === "DELETE") {
        if (req.query.id) {
            try {
                await Product.deleteOne({ _id: req.query.id });
                res.json(true);
            } catch (error) {
                console.error("Помилка при видаленні продукту:", error);
                res.status(500).json({ error: "Помилка при видаленні продукту" });
            }
        } else {
            res.status(400).json({ error: "Не вказано ID продукту для видалення" });
        }
    }
}