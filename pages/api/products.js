import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";

import { Components } from "@/models/Components";
import { Product } from "@/models/Product";

async function convertComponentNamesToIds(components) {
    const componentIds = [];
    if (!Array.isArray(components)) {
        return componentIds;
    }
    for (const component of components) {
        const { _id, name, quantity } = component;
        const componentInfo = await Components.findOne({ name });
        if (componentInfo) {
            componentIds.push({ _id: componentInfo._id, name, quantity });
        }
    }
    return componentIds;
}

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(res, req);

    if (method === "GET") {
        if (req.query?.id) {
            res.json(await Product.findOne({ _id: req.query.id }));
        } else {
            res.json(await Product.find());
        }
    }

    if (method === "POST") {
        const {
            name,
            components,
            agent,
            assemblyPrice,
            images
        } = req.body;

        const componentIds = await convertComponentNamesToIds(components);

        const productDoc = await Product.create({
            name,
            components: componentIds,
            agent,
            assemblyPrice,
            images
        });
        res.json(productDoc);
    }

    if (method === "PUT") {
        try {
            const {
                name,
                components,
                agent,
                assemblyPrice,
                images,

                _id,
            } = req.body;

            const productDoc = await Product.findOneAndUpdate(

                { _id },
                {
                    name,
                    components,
                    agent,
                    assemblyPrice,
                    images,
                },
                { new: true }
            );
            res.json(productDoc);
        } catch (error) {
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