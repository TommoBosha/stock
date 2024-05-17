import { mongooseConnect } from "@/lib/mongoose";
import { Components } from "@/models/Components";
import { isAdminRequest } from "./auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(res, req);

  if (method === 'GET') {
    try {
      const components = await Components.find();
      res.json(components);
    } catch (error) {
      res.status(500).json({ error: "Помилка при отриманні комплектуючих з бази даних." });
    }
  }

  if (method === 'POST') {
    try {
      const {
        name,
        price,
        company,
        invoice,
        countInStock,
        images
      } = req.body;
      const componentDoc = await Components.create({
        name,
        price,
        company,
        invoice,
        countInStock,
        images
      });
      res.json(componentDoc);
    } catch (error) {
      res.status(500).json({ error: "Помилка при створенні компонента" });
    }
  }

  if (method === "PUT") {
    try {
      const {
        name,
        unitPrice,
        company,
        invoice,
        quantity,
        images,
        _id,
      } = req.body;
      const componentDoc = await Components.findOneAndUpdate(
        { _id },
        {
          name,
          unitPrice,
          company,
          invoice,
          quantity,
          images,
        },
        { new: true }
      );
      res.json(componentDoc);
    } catch (error) {
      res.status(500).json({ error: "Помилка при оновленні компонента" });
    }
  }

  if (method === "DELETE") {
    try {
      const { _id } = req.query;
      await Components.deleteOne({ _id });
      res.json({ message: "Компонент видалена успішно." });
    } catch (error) {
      res.status(500).json({ error: "Помилка при видаленні компонента." });
    }
  }
}
