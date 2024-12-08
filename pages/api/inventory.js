import { mongooseConnect } from "@/lib/mongoose";
import { Inventory } from "@/models/Inventory";

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();

    if (method === "GET") {
        const items = await Inventory.find();
        res.json(items);
    }

    if (method === "POST") {
        const newItem = await Inventory.create(req.body);
        res.json(newItem);
    }

    if (method === "PUT") {
        const { _id, ...updates } = req.body;
        const updatedItem = await Inventory.findByIdAndUpdate(_id, updates, { new: true });
        res.json(updatedItem);
    }

    if (method === "DELETE") {
        const { id } = req.query;
        await Inventory.findByIdAndDelete(id);
        res.json({ success: true });
    }
}
