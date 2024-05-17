import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function ProductForm({
    _id,
    name: existingName,
    components: existingComponents,
    agent: existingAgent,
    assemblyPrice: existingAssemblyPrice,
    images: existingImages,
}) {
    const [name, setName] = useState(existingName || "");
    const [components, setComponents] = useState(existingComponents || [{ _id: "", name: "", quantity: "" }]);
    const [agent, setAgent] = useState(existingAgent || "");
    const [assemblyPrice, setAssemblyPrice] = useState(existingAssemblyPrice || "");
    const [images, setImages] = useState(existingImages || []);
    const [isUploading, setIsUploading] = useState(false);
    const [availableComponents, setAvailableComponents] = useState([]);

    const router = useRouter();

    useEffect(() => {
        axios.get('/api/components').then(result => {
            setAvailableComponents(result.data.map(comp => comp.name));
        });
    }, []);

    async function saveProduct(e) {
        e.preventDefault();
        const data = {
            name,
            components,
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

    async function uploadImage(e) {
        const files = e.target?.files;
        if (files?.length > 0) {
            setIsUploading(true);
            const data = new FormData();
            for (const file of files) {
                data.append("file", file);
            }
            try {
                const res = await axios.post("/api/upload", data);
                setImages((oldImages) => [...oldImages, ...res.data.links]);
            } catch (error) {
                console.error('Помилка завантаження файлів:', error);
            } finally {
                setIsUploading(false);
            }
        }
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
                        type="text"
                        placeholder="Кількість"
                        value={component.quantity}
                        onChange={(e) => updateComponent(index, "quantity", +e.target.value)}
                    />

                    <div className="flex flex-row gap-4 py-4">
                        <button className="btn-default" type="button" onClick={() => removeComponent(index)}>Видалити</button>
                        <button className="btn-default" type="button" onClick={addComponent}>Додати компонент</button>
                    </div>
                </div>
            ))}




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

            <button className="btn-default" type="submit">Зберегти</button>
        </form>
    );
}