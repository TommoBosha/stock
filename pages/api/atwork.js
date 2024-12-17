import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
import AtWork from "@/models/AtWork";
import { Product } from "@/models/ProductModel";
import { Components } from "@/models/Components";
import { Staff } from "@/models/Staff";
import mongoose from "mongoose";

async function checkComponentAvailability(session, products) {
    let shortage = [];
    for (const product of products) {
        console.log(`Processing product: ${product.name} (ID: ${product._id}) with quantity: ${product.quantity}`);
        const productInfo = await Product.findById(product._id).session(session);
        if (!productInfo) {
            console.error(`Product not found: ${product.name}`);
            continue;
        }
        for (const component of productInfo.components) {
            console.log(`  Checking component: ${component.name} (ID: ${component.item}) with required quantity per product: ${component.quantity}`);
            const totalNeededQuantity = component.quantity * product.quantity;
            const componentInfo = await Components.findById(component.item).session(session);
            if (!componentInfo) {
                console.error(`  Component not found: ID ${component.item}`);
                continue;
            }

            console.log(`    Available quantity: ${componentInfo.quantity}, Required quantity: ${totalNeededQuantity}`);

            if (componentInfo.quantity < totalNeededQuantity) {
                shortage.push({
                    component: componentInfo.name,
                    required: totalNeededQuantity,
                    available: componentInfo.quantity
                });
                console.log(`    Shortage detected for component: ${componentInfo.name}`);
            } else {
                // Віднімання кількості компонентів
                const updateResult = await Components.updateOne(
                    { _id: component.item },
                    { $inc: { quantity: -totalNeededQuantity } }
                ).session(session);
                console.log(`    Component ${componentInfo.name} updated. Modified count: ${updateResult.nModified}`);
            }
        }
    }
    console.log(`Shortage after checking all products:`, shortage);
    return shortage;
}

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(res, req);

    if (method === "GET") {
        if (req.query?.id) {
            const workDay = await AtWork.findById(req.query.id).populate('contractors');
            res.json(workDay);
        } else {
            const workDays = await AtWork.find().populate('contractors');
            res.json(workDays);
        }
    }

    if (method === "POST") {
        const {
            orders,
            startDate,
            endDate, // Тепер приймаємо endDate від клієнта
            serialNumber,
            products,
            contractors,
            comment
        } = req.body;

        const session = await mongoose.startSession();
        session.startTransaction();
        try {
            // Використовуємо надану endDate
            const start = new Date(startDate);
            const end = new Date(endDate);

            // Валідація: endDate не може бути раніше startDate
            if (end < start) {
                throw new Error("Дата завершення не може бути раніше дати початку.");
            }

            const shortage = await checkComponentAvailability(session, products);
            // Якщо є нестача - повертаємо помилку
            if (shortage && shortage.length > 0) {
                await session.abortTransaction();
                session.endSession();
                return res.status(400).json({ shortage });
            }

            const atWorkDoc = await AtWork.create([{
                orders,
                startDate: start,
                endDate: end, // Використовуємо надану endDate
                serialNumber,
                products,
                contractors,
                comment,
                 status: 'inWork'
            }], { session });

            await session.commitTransaction();
            session.endSession();

            // Поповнення поля 'contractors'
            const populatedWorkDay = await AtWork.findById(atWorkDoc[0]._id).populate('contractors');

            res.status(201).json({ atWork: populatedWorkDay });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            console.error("Error in creating work entry:", error);
            res.status(500).json({ error: error.message });
        }
    }

    if (method === "PUT") {
        const { _id } = req.body;
        try {
            const existingWorkDay = await AtWork.findById(_id);
            if (!existingWorkDay) {
                res.status(404).json({ error: "Робочий день не знайдено." });
                return;
            }

            const {
                orders,
                startDate,
                endDate, // Якщо ви хочете дозволити оновлення endDate
                serialNumber,
                products,
                contractors,
                comment,
                status
            } = req.body;

            // Якщо потрібно, додайте логіку для коригування кількості компонентів

            // Валідація: endDate не може бути раніше startDate
            if (new Date(endDate) < new Date(startDate)) {
                throw new Error("Дата завершення не може бути раніше дати початку.");
            }

            const updatedWorkDay = await AtWork.findByIdAndUpdate(
                _id,
                { orders, startDate, endDate, serialNumber, products, contractors, comment,  status },
                { new: true }
            ).populate('contractors');

            res.json({ success: true, workDay: updatedWorkDay });
        } catch (error) {
            console.error("Error in updating work entry:", error);
            res.status(500).json({ error: "Помилка при оновленні запису" });
        }
    }

    if (method === "DELETE") {
        if (req.query.id) {
            try {
                const workDay = await AtWork.findById(req.query.id).populate('products.product');
                if (!workDay) {
                    return res.status(404).json({ error: "Запис не знайдено" });
                }

                // Повертаємо комплектуючі назад
                for (const product of workDay.products) {
                    const prodDoc = await Product.findById(product._id).populate('components.item');
                    if (prodDoc && prodDoc.components) {
                        for (const comp of prodDoc.components) {
                            const restoreQty = comp.quantity * product.quantity;
                            await Components.updateOne(
                                { _id: comp.item._id },
                                { $inc: { quantity: restoreQty } }
                            );
                            console.log(`Component ${comp.name} restored by ${restoreQty}`);
                        }
                    }
                }

                // Тепер видаляємо запис
                await AtWork.deleteOne({ _id: req.query.id });
                res.json(true);
            } catch (error) {
                console.error("Помилка при видаленні запису:", error);
                res.status(500).json({ error: "Помилка при видаленні запису" });
            }
        } else {
            res.status(400).json({ error: "Не вказано ID запису для видалення" });
        }
    }
}