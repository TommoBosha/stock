
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
import { Product } from "@/models/ProductModel";
import { TechProcess } from "@/models/TechnologicalItem";
import { Components } from "@/models/Components";

async function convertTechComponentsToIds(techComponents) {
    const results = [];
    for (const comp of techComponents) {
      
        const componentDoc = await Components.findOne({ name: comp.item.name });
        if (componentDoc) {
            results.push({
                item: componentDoc._id,
                name: componentDoc.name,
                quantity: comp.quantity,
                totalPrice: comp.quantity * componentDoc.unitPrice,
            });
        }
    }
    return results;
}

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(res, req);

    if (method === "POST") {
        try {
            const { technology, assemblyPrice, salePrice, manufacturingTime, images } = req.body;

            // Находим технологическую карту
            const techCard = await TechProcess.findById(technology).populate('components.item');
            if (!techCard) {
                return res.status(404).json({ error: "Технологічна карта не знайдена" });
            }

            // Конвертируем компоненты из технологической карты в нужный формат
            const componentsData = await convertTechComponentsToIds(techCard.components);

            // Создаем новый продукт на основе данных технологической карты
            const newProduct = await Product.create({
                name: techCard.name,
                components: componentsData,
                assemblyPrice,
                salePrice,
                manufacturingTime,
                images,
            });

            return res.status(201).json({ success: true, product: newProduct });
        } catch (error) {
            console.error("Помилка при створенні виробу:", error);
            return res.status(500).json({ error: "Помилка при створенні виробу." });
        }
    }

    if (method === "PUT") {
        try {
            const { _id, technology, assemblyPrice, salePrice, manufacturingTime, images } = req.body;
    
            const techCard = await TechProcess.findById(technology).populate('components.item');
            if (!techCard) {
                return res.status(404).json({ error: "Технологічна карта не знайдена." });
            }
    
            // Конвертируем компоненты для обновления
            const componentsData = await convertTechComponentsToIds(techCard.components);
    
            const updatedProduct = await Product.findByIdAndUpdate(
                _id,
                {
                    name: techCard.name,
                    components: componentsData,
                    assemblyPrice,
                    salePrice,
                    manufacturingTime,
                    images, // Обновляем изображение
                },
                { new: true }
            ).populate('components.item');
    
            res.status(200).json(updatedProduct);
        } catch (error) {
            console.error("Помилка при оновленні виробу:", error);
            res.status(500).json({ error: "Помилка при оновленні виробу." });
        }
    }

    if (method === "GET") {
        try {
            if (req.query.id) {
                const product = await Product.findById(req.query.id)
                    .populate('components.item');
                if (!product) {
                    return res.status(404).json({ error: "Продукт не знайдено" });
                }
                res.status(200).json(product);
            } else {
                const products = await Product.find()
                    .populate('components.item');
                res.status(200).json(products);
            }
        } catch (error) {
            console.error("Помилка при отриманні виробів:", error);
            res.status(500).json({ error: "Помилка сервера" });
        }
    }

    if (method === "DELETE") {
        if (req.query.id) {
            try {
                await Product.deleteOne({ _id: req.query.id });
                res.status(200).json({ success: true });
            } catch (error) {
                console.error("Помилка при видаленні виробу:", error);
                res.status(500).json({ error: "Помилка при видаленні виробу." });
            }
        } else {
            res.status(400).json({ error: "ID виробу не вказано." });
        }
    }
}