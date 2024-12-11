/* eslint-disable @next/next/no-img-element */
import axios from "axios";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Spinner from "./Spinner";

export default function ProductForm({
    _id,
    name: existingName,
    components: existingComponents,
    assemblyPrice: existingAssemblyPrice,
    salePrice: existingSalePrice,
    manufacturingTime: existingManufacturingTime,
    images: existingImages,
    technology: existingTechnology,
}) {
    const [technologies, setTechnologies] = useState([]);
    const [selectedTechnology, setSelectedTechnology] = useState(existingTechnology || "");
    const [name, setName] = useState(existingName || "");
    const [components, setComponents] = useState(existingComponents || []);
    const [assemblyPrice, setAssemblyPrice] = useState(existingAssemblyPrice || "");
    const [salePrice, setSalePrice] = useState(existingSalePrice || "");
    const [manufacturingTime, setManufacturingTime] = useState(existingManufacturingTime || "");
    const [images, setImages] = useState(existingImages || "");
    const [isUploading, setIsUploading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        async function fetchTechnologies() {
            try {
                const response = await axios.get("/api/technological");
                setTechnologies(response.data);
            } catch (error) {
                console.error("Ошибка при загрузке технологических карт:", error);
            }
        }

        fetchTechnologies();
    }, []);

    
    useEffect(() => {
        if (selectedTechnology) {
            const tech = technologies.find((t) => t._id === selectedTechnology);
            if (tech) {
                setName(tech.name);
            }
        }
    }, [selectedTechnology, technologies]);

    const handleSave = async (e) => {
        e.preventDefault();

        const productData = {
            technology: selectedTechnology,
            components,
            assemblyPrice,
            salePrice,
            manufacturingTime,
            images,
        };

        console.log("Отправляемые данные:", productData);

        try {
            if (_id) {
                await axios.put(`/api/products`, { ...productData, _id });
            } else {
                await axios.post(`/api/products`, productData);
            }
            router.push("/products");
        } catch (error) {
            console.error("Ошибка при сохранении изделия:", error);
        }
    };

    const handleImageUpload = async (e) => {
        

        setIsUploading(true);

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.links && data.links.length > 0) {
                setImages(data.links[0]);
            } else {
                console.error(
                    "Помилка при завантаженні зображення: немає даних у відповіді"
                );
            }
        } catch (error) {
            console.error("Помилка при завантаженні зображення:", error);
        }

        setIsUploading(false);
    };

    return (
        <form onSubmit={handleSave}>
            <label>Назва виробу</label>
            <select
                className="select select-bordered w-full"
                value={selectedTechnology}
                onChange={(e) => setSelectedTechnology(e.target.value)}
                required
            >
                <option value="">Виберіть назву виробу</option>
                {technologies.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                        {tech.name}
                    </option>
                ))}
            </select>

           

            <label>Ціна зборки</label>
            <input
                type="text"
                value={assemblyPrice}
                onChange={(e) => setAssemblyPrice(Number(e.target.value))}
            />

            <label>Ціна реалізації</label>
            <input
                type="text"
                value={salePrice}
                onChange={(e) => setSalePrice(Number(e.target.value))}
            />

            <label>Термін виготовлення</label>
            <input
                type="text"
                value={manufacturingTime}
                onChange={(e) => setManufacturingTime(e.target.value)}
            />

<label>Фото товару</label>
{images && <img src={images} alt="Текущее изображение" style={{ maxWidth: "200px", marginBottom: "10px" }} />}
<input type="file" onChange={handleImageUpload} />
{isUploading && <Spinner />}
<div className="flex flex-row gap-2 mt-3">
            <button type="submit" className="btn btn-accent ">Зберегти</button>

            <button type="button" className="btn" onClick={() => router.push('/products')}>
  Назад
</button>
</div>
        </form>
    );
}



