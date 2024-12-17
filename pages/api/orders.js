import { mongooseConnect } from "@/lib/mongoose";

import { isAdminRequest } from "./auth/[...nextauth]";
import Order from "@/models/Order";
import { Client } from "@/models/Clients";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(res, req);

  if (method === 'GET') {
    const { orderId } = req.query;
    try {
      if (orderId) {
        const order = await Order.findById(orderId).populate('client products.product');
        res.json(order);
        if (!order) {
          return res.status(404).json({ error: "Замовлення не знайдено." });
        }
        res.json(order);
      } else {
        const orders = await Order.find().populate('client products.product');
        res.json(orders);
      }
    } catch (error) {
      console.error('Помилка при отриманні замовлень:', error);
      res.status(500).json({ error: "Помилка при отриманні замовлень з бази даних." });
    }
  }


  else if (method === 'POST') {
    const { client, data, products, totalPrice, isPaid, comment, orderNumber } = req.body;
    console.log('Дата получена:', data);

    try {
      const newOrder = new Order({
        client,
      data,
      products: products.map((product) => ({
        product: product.product,
        name: product.name,
        quantity: product.quantity,
        salePrice: product.salePrice, // Збереження ціни реалізації
      })),
      totalPrice,
      isPaid,
      comment,
      orderNumber,
      });

      const savedOrder = await Order.create(newOrder).then(savedOrder => {

        res.json(savedOrder);
      }).catch(error => {
        console.error('Ошибка при сохранении заказа:', error);
        res.status(500).json({ error: error.message });
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Помилка при створенні замовлення" });
    }

  }


  else if (method === "PUT") {
    try {
      const { client, data, products, totalPrice, isPaid, comment, orderNumber, orderId } = req.body;

      const orderDoc = await Order.findByIdAndUpdate(
        orderId, // Використовуйте orderId як _id для пошуку
        { client, data, products, totalPrice, isPaid, comment, orderNumber },
        { new: true }
      );

      if (!orderDoc) {
        return res.status(404).json({ error: "Замовлення не знайдено." });
      }

      res.json(orderDoc);
    } catch (error) {
      res.status(500).json({ error: "Помилка при оновленні замовлення." });
    }
  }


  else if (method === "DELETE") {
    const { _id } = req.query;
    try {
      const result = await Order.findByIdAndDelete(_id);
      if (!result) {
        return res.status(404).json({ error: "Замовлення не знайдено." });
      }
      res.json({ message: "Замовлення видалено успішно." });
    } catch (error) {
      res.status(500).json({ error: "Помилка при видаленні замовлення." });
    }
  } else {
    res.status(405).json({ error: "Метод не дозволений" });
  }
}