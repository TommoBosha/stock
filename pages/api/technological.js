import { mongooseConnect } from "@/lib/mongoose";

import { Components } from "@/models/Components";
import { TechProcess } from "@/models/TechnologicalItem";

async function convertNamesToIds(items, model) {
    const itemIds = [];
    for (const item of items) {
        const { name, quantity } = item;
        const itemInfo = await model.findOne({ name });
        if (itemInfo) {
            itemIds.push({
                item: itemInfo._id,
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

    if (method === "GET") {
        const { id } = req.query;
        if (id) {

            const techProcess = await TechProcess.findById(id).populate('components.item');
            res.json(techProcess);
        } else {
            const techProcesses = await TechProcess.find().populate('components.item');
            res.json(techProcesses);
        }
    }

    if (method === "POST") {
        const { name, components } = req.body;
        const componentIds = await convertNamesToIds(components, Components);
        const techProcess = await TechProcess.create({ name, components: componentIds });
        res.json(techProcess);
    }

    if (method === "PUT") {
        const { _id, name, components } = req.body;
        const componentIds = await convertNamesToIds(components, Components);
        const updatedTechProcess = await TechProcess.findByIdAndUpdate(
            _id,
            { name, components: componentIds },
            { new: true }
        ).populate('components.item');
        res.json(updatedTechProcess);
    }

    if (method === "DELETE") {
        const { id } = req.query;
        await TechProcess.deleteOne({ _id: id });
        res.json({ success: true });
    }
}