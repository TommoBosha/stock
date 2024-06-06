import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "./auth/[...nextauth]";
import AtWork from "@/models/AtWork";
import { Product } from "@/models/ProductModel";
import { Components } from "@/models/Components";

// Перетворює імена продуктів на ідентифікатори
async function convertProductNamesToIds(products) {
    return Promise.all(products.map(async (product) => {
        const productInfo = await Product.findOne({ name: product.name });
        if (!productInfo) {
            throw new Error(`Product not found: ${product.name}`);
        }
        return { ...product, _id: productInfo._id };
    }));
}

// Перевіряє наявність і віднімає необхідні компоненти
async function checkComponentAvailability(products) {
    let shortage = [];
    for (const product of products) {
        const productInfo = await Product.findById(product._id);
        if (!productInfo) {
            console.error("Product not found for ID:", product);
            continue;
        }
        for (const component of productInfo.components) {
            const totalNeededQuantity = component.quantity * product.quantity;
            const componentInfo = await Components.findById(component._id);
            if (!componentInfo) {
                console.error("Component not found for ID:", component._id);
                continue;
            }

            await Components.updateOne(
                { _id: component._id },
                { $inc: { quantity: -totalNeededQuantity } }
            );

            if (componentInfo.quantity < totalNeededQuantity) {
                shortage.push({
                    component: componentInfo.name,
                    required: totalNeededQuantity,
                    available: componentInfo.quantity - totalNeededQuantity
                });
            }
        }
    }
    return shortage;
}

async function adjustComponentQuantities(originalProducts, updatedProducts) {
    for (let i = 0; i < originalProducts.length; i++) {
        const originalProduct = originalProducts[i];
        const updatedProduct = updatedProducts.find(p => p._id === originalProduct._id);
        if (updatedProduct) {
            const quantityChange = updatedProduct.quantity - originalProduct.quantity;
            const productInfo = await Product.findById(originalProduct._id);
            if (productInfo && quantityChange !== 0) {
                for (const component of productInfo.components) {
                    await Components.updateOne(
                        { _id: component._id },
                        { $inc: { quantity: -component.quantity * quantityChange } }
                    );
                }
            }
        }
    }
}

export default async function handler(req, res) {
    const { method } = req;
    await mongooseConnect();
    await isAdminRequest(res, req);

    if (method === "GET") {
        if (req.query?.id) {
            res.json(await AtWork.findById(req.query.id));
        } else {
            res.json(await AtWork.find());
        }
    }

    if (method === "POST") {
        const {
            orders,
            date,
            serialNumber,
            products,
            contractor,
            comment
        } = req.body;

        try {
            const shortage = await checkComponentAvailability(products);
            const atWorkDoc = await AtWork.create({
                orders,
                date,
                serialNumber,
                products,
                contractor,
                comment
            });

            res.status(201).json({ atWork: atWorkDoc, shortage });
        } catch (error) {
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
                date,
                serialNumber,
                products,
                contractor,
                comment,
            } = req.body;

            // Розрахунок різниці та віднімання компонентів
            await adjustComponentQuantities(existingWorkDay.products, products);

            // Оновлення запису
            const updatedWorkDay = await AtWork.findByIdAndUpdate(
                _id,
                { orders, date, serialNumber, products, contractor, comment },
                { new: true }
            );

            res.json({ success: true, workDay: updatedWorkDay });
        } catch (error) {
            console.error("Error in updating work entry:", error);
            res.status(500).json({ error: "Помилка при оновленні запису" });
        }
    }


    if (method === "DELETE") {
        if (req.query.id) {
            try {
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