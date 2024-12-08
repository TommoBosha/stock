import { mongooseConnect } from "@/lib/mongoose";
import { Staff } from "@/models/Staff";

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();

    if (method === "GET") {
        const staff = await Staff.find().populate("assignedTool");
        res.json(staff);
    }

    if (method === "POST") {
        const newStaff = await Staff.create(req.body);
        res.json(newStaff);
    }

    if (method === "PUT") {
        const { _id, ...updates } = req.body;
        const updatedStaff = await Staff.findByIdAndUpdate(_id, updates, { new: true }).populate("assignedTool");
        res.json(updatedStaff);
    }

    if (method === "DELETE") {
        const { id } = req.query;
        await Staff.findByIdAndDelete(id);
        res.json({ success: true });
    }
}