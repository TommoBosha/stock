import { mongooseConnect } from "@/lib/mongoose";
import { Client } from "@/models/Clients";
import { Company } from "@/models/Company";
import { Components } from "@/models/Components";
import { Product } from "@/models/ProductModel";
import mongoose from "mongoose";


export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Метод не дозволений' });
    }

    const { query } = req.query;

    if (!query) {
        return res.status(400).json({ error: 'Запит не може бути пустим' });
    }

    await mongooseConnect();
    mongoose.model('Client').ensureIndexes();
    mongoose.model('Company').ensureIndexes();
    mongoose.model('Component').ensureIndexes();
    mongoose.model('Product').ensureIndexes();
    // mongoose.model('Order').ensureIndexes();

    try {
        const clientsPromise = Client.find({ $text: { $search: query } });
        const companiesPromise = Company.find({ $text: { $search: query } });
        const componentsPromise = Components.find({ $text: { $search: query } });
        const productsPromise = Product.find({ $text: { $search: query } });
        // const ordersPromise = Order.find({ $text: { $search: query } });

        const [clients, companies, components, products] = await Promise.all([
            clientsPromise,
            companiesPromise,
            componentsPromise,
            productsPromise,
            // ordersPromise
        ]);

        res.status(200).json({ clients, companies, components, products });
    } catch (error) {
        console.error('Помилка при виконанні глобального пошуку:', error);
        res.status(500).json({ error: 'Помилка сервера' });
    }
}