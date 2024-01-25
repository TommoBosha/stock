import { mongooseConnect } from "@/lib/mongoose";
import Order from "@/models/Order";


export default async function handler(req,res) {
  await mongooseConnect();

  if (req.method === 'PUT') {
    const { orderId, updateFields } = req.body;
    try {
      const updatedOrder = await Order.findByIdAndUpdate(orderId, updateFields, { new: true });
      res.json(updatedOrder);
    } catch (error) {
      res.status(500).json({ message: "Помилка оновлення даних" });
    }
  } else {
   
    res.json(await Order.find().sort({createdAt: -1}));
  }
}
