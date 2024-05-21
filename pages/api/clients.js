import { mongooseConnect } from "@/lib/mongoose";

import { isAdminRequest } from "./auth/[...nextauth]";
import mongoose from 'mongoose';
import { Client } from "@/models/Clients";

export default async function handle(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(res, req);




    if (method === "GET") {
        if (req.query.ibans && req.query.name) {
            try {
                const client = await Client.findOne({ name: req.query.name });

                if (!client) {
                    throw new Error('Клієнта не знайдено за ім\'ям');
                }
                const ibans = client.requisites.map(requisite => requisite.IBAN);
                res.json(ibans);
            } catch (error) {
                console.error("Помилка при отриманні IBAN клієнта:", error);
                res.status(500).json({ error: error.message });
            }

        } else if (req.query?.id) {
            try {
                if (!mongoose.Types.ObjectId.isValid(req.query.id)) {
                    throw new Error('Невірний формат ідентифікатора');
                }
                const client = await Client.findOne({ _id: req.query.id });
                if (!client) {
                    throw new Error('Клієнта не знайдено');
                }
                res.json(client);
            } catch (error) {
                console.error("Помилка при отриманні клієнта:", error);
                res.status(500).json({ error: "Помилка при отриманні клієнта" });
            }
        } else {
            try {
                const clients = await Client.find();
                res.json(clients);
            } catch (error) {
                console.error("Помилка при отриманні списку клієнтів:", error);
                res.status(500).json({ error: "Помилка при отриманні списку клієнтів" });
            }
        }
    }


    if (method === "POST") {
        try {
            const {
                name,
                address,
                site,
                orders,
                requisites,
                tel,
            } = req.body;

            const formattedRequisites = requisites.map(requisite => ({
                MFO: requisite.MFO,
                IBAN: requisite.IBAN,
                EDRPOU: requisite.EDRPOU,
                IPN: requisite.IPN,
                address: requisite.address
            }));

            const clientDoc = await Client.create({
                name,
                address,
                site,
                orders,
                requisites: formattedRequisites,
                tel,
            });

            res.json(clientDoc);
        } catch (error) {
            res.status(500).json({ error: "Помилка при створенні клієнта." });
        }
    }

    if (method === "PUT") {
        try {
            const {
                name,
                address,
                site,
                orders,
                requisites,
                tel,
                _id
            } = req.body;
            const formattedRequisites = requisites.map(requisite => ({
                MFO: requisite.MFO,
                IBAN: requisite.IBAN,
                EDRPOU: requisite.EDRPOU,
                IPN: requisite.IPN,
                address: requisite.address
            }));

            const clientDoc = await Client.findOneAndUpdate(
                { _id },
                {
                    name,
                    address,
                    site,
                    orders,
                    requisites: formattedRequisites,
                    tel,
                },
                { new: true }
            );
            res.json(clientDoc);
        } catch (error) {
            res.status(500).json({ error: "Помилка при оновленні клієнта." });
        }
    }

    if (method === "DELETE") {
        try {
            const { _id } = req.query;
            await Client.deleteOne({ _id });
            res.json({ message: "Клієнт видален успішно." });
        } catch (error) {
            res.status(500).json({ error: "Помилка при видаленні клієнта." });
        }
    }
}