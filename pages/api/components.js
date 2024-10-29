import { mongooseConnect } from "@/lib/mongoose";
import { Components } from "@/models/Components";
import { isAdminRequest } from "./auth/[...nextauth]";
import mongoose from 'mongoose';

export default async function handle(req, res) {
  const { method } = req;

  // Подключение к базе данных
  await mongooseConnect();
  await isAdminRequest(res, req);

  if (method === 'GET') {
    const { id } = req.query;

    try {
      if (id) {
        // Проверка валидности ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
          return res.status(400).json({ error: 'Невірний формат ідентифікатора' });
        }

        // Поиск конкретного компонента по ID
        const component = await Components.findById(id);
        if (!component) {
          return res.status(404).json({ error: 'Комплектуюча не знайдена' });
        }

        res.json(component);
      } else {
        // Если ID нет, возвращаем все комплектующие
        const components = await Components.find();
        res.json(components);
      }
    } catch (error) {
      console.error("Помилка при отриманні комплектуючих:", error.message);
      res.status(500).json({ error: "Помилка при отриманні комплектуючих" });
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

      // Создание нового документа в базе данных
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
        _id
      } = req.body;

      // Проверка валидности ID
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: 'Невірний формат ідентифікатора' });
      }

      // Обновление существующего компонента
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

      if (!componentDoc) {
        return res.status(404).json({ error: 'Комплектуюча не знайдена' });
      }

      res.json(componentDoc);
    } catch (error) {
      res.status(500).json({ error: "Помилка при оновленні компонента" });
    }
  }

  if (method === "DELETE") {
    try {
      const { _id } = req.query;

      // Проверка валидности ID
      if (!mongoose.Types.ObjectId.isValid(_id)) {
        return res.status(400).json({ error: 'Невірний формат ідентифікатора' });
      }

      // Удаление компонента
      const deleteResult = await Components.deleteOne({ _id });

      if (deleteResult.deletedCount === 0) {
        return res.status(404).json({ error: 'Комплектуюча не знайдена' });
      }

      res.json({ message: "Комплектуюча видалена успішно." });
    } catch (error) {
      res.status(500).json({ error: "Помилка при видаленні компонента" });
    }
  }
}