import { mongooseConnect } from "@/lib/mongoose";
import { Currency } from "@/models/Currency";


export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();


    if (method === 'GET') {
        res.json(await Currency.find());
    }

    if (method === 'POST') {
        const { date, currency } = req.body;
        const currencyDoc = await Currency.create({
            date: new Date(date),
            currency
        });
        res.json(currencyDoc);
    }


}