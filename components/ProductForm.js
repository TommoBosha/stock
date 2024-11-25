import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function ProductForm({
    _id,
    name: existingName,
    components: existingComponents,
    products: existingProducts,
    agent: existingAgent,
    assemblyPrice: existingAssemblyPrice,
    images: existingImages,
}) {
    const [name, setName] = useState(existingName || "");
    const [components, setComponents] = useState(existingComponents || [{ _id: "", name: "", quantity: "" }]);
    const [products, setProducts] = useState(existingProducts || [{ _id: "", name: "", quantity: "" }]);
    const [agent, setAgent] = useState(existingAgent || "");
    const [assemblyPrice, setAssemblyPrice] = useState(existingAssemblyPrice || "");
    const [images, setImages] = useState(existingImages || []);
    const [isUploading, setIsUploading] = useState(false);
    const [availableComponents, setAvailableComponents] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);

    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const result = await axios.get('/api/products?type=all');
                setAvailableComponents(result.data.components.map(comp => comp.name));
                setAvailableProducts(result.data.products.map(prod => prod.name));
            } catch (error) {
                console.error("Ошибка при загрузке компонентов и изделий:", error);
            }
        }

        fetchData();
    }, []);

    async function saveProduct(e) {
        e.preventDefault();
        const data = {
            name,
            components,
            products,
            agent,
            assemblyPrice,
            images,
        };

        if (_id) {
            await axios.put("/api/products", { ...data, _id });
        } else {
            await axios.post("/api/products", data);
        }
        router.push("/products");
    }

    function addComponent() {
        setComponents(prevComponents => [...prevComponents, { _id: "", name: "", quantity: "" }]);
    }

    function removeComponent(index) {
        setComponents(prevComponents => prevComponents.filter((_, i) => i !== index));
    }

    function updateComponent(index, key, value) {
        setComponents(prevComponents => {
            const newComponents = [...prevComponents];
            newComponents[index][key] = value;
            return newComponents;
        });
    }

    function addProduct() {
        setProducts(prevProducts => [...prevProducts, { _id: "", name: "", quantity: "" }]);
    }

    function removeProduct(index) {
        setProducts(prevProducts => prevProducts.filter((_, i) => i !== index));
    }

    function updateProduct(index, key, value) {
        setProducts(prevProducts => {
            const newProducts = [...prevProducts];
            newProducts[index][key] = value;
            return newProducts;
        });
    }

    return (
        <form onSubmit={saveProduct}>
            <label>Назва продукту</label>
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <h2>Комплектуючі</h2>
            {components.map((component, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder="Введіть назву компонента"
                        value={component.name}
                        onChange={(e) => updateComponent(index, "name", e.target.value)}
                        list={`componentsList${index}`}
                    />
                    <datalist id={`componentsList${index}`}>
                        {availableComponents.map((comp, idx) => (
                            <option key={idx} value={comp} />
                        ))}
                    </datalist>

                    <input
                        type="number"
                        placeholder="Кількість"
                        value={component.quantity}
                        onChange={(e) => updateComponent(index, "quantity", +e.target.value)}
                    />
                    <button type="button" onClick={() => removeComponent(index)}>Видалити</button>
                </div>
            ))}
            <button type="button" onClick={addComponent}>Додати компонент</button>

            <h2>Вироби</h2>
            {products.map((product, index) => (
                <div key={index}>
                    <input
                        type="text"
                        placeholder="Введіть назву виробу"
                        value={product.name}
                        onChange={(e) => updateProduct(index, "name", e.target.value)}
                        list={`productsList${index}`}
                    />
                    <datalist id={`productsList${index}`}>
                        {availableProducts.map((prod, idx) => (
                            <option key={idx} value={prod} />
                        ))}
                    </datalist>

                    <input
                        type="number"
                        placeholder="Кількість"
                        value={product.quantity}
                        onChange={(e) => updateProduct(index, "quantity", +e.target.value)}
                    />
                    <button type="button" onClick={() => removeProduct(index)}>Видалити</button>
                </div>
            ))}
            <button type="button" onClick={addProduct}>Додати виріб</button>

            <label>Посередник</label>
            <input
                type="text"
                value={agent}
                onChange={(e) => setAgent(e.target.value)}
            />

            <label>Ціна зборки</label>
            <input
                type="text"
                value={assemblyPrice}
                onChange={(e) => setAssemblyPrice(+e.target.value)}
            />

            <label>Фото товару</label>
            <input
                type="file"
                onChange={uploadImage}
                multiple
            />

            {isUploading && <Spinner />}

            <button type="submit">Зберегти</button>
        </form>
    );
}