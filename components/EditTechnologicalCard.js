/* eslint-disable @next/next/no-img-element */
import React, { useState, useEffect } from "react";
import axios from "axios";

const EditTechnologicalCard = ({ item, onUpdate, onCancel }) => {
    const [formData, setFormData] = useState({
        name: item.name,
        components: item.components || [],
    });

    const [allComponents, setAllComponents] = useState([]);

    useEffect(() => {
        axios
            .get("/api/components")
            .then((response) => setAllComponents(response.data))
            .catch((error) => console.error("Error fetching components:", error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleComponentsChange = (index, field, value) => {
        const updatedComponents = formData.components.map((component, i) =>
            i === index ? { ...component, [field]: value } : component
        );
        setFormData((prev) => ({ ...prev, components: updatedComponents }));
    };

    const handleAddComponent = () => {
        setFormData((prev) => ({
            ...prev,
            components: [...prev.components, { name: "", quantity: 0 }],
        }));
    };

    const handleRemoveComponent = (index) => {
        const filteredComponents = formData.components.filter((_, i) => i !== index);
        setFormData((prev) => ({ ...prev, components: filteredComponents }));
    };

    const handleSubmit = async () => {
        try {
            const response = await axios.put("/api/technological", {
                ...formData,
                _id: item._id,
            });
            onUpdate(response.data); // Передаем обновленные данные в родительский компонент
            onCancel(); // Закрываем редактор
        } catch (error) {
            console.error("Error updating technological card:", error);
        }
    };

    return (
        <div className="p-4 bg-white shadow rounded">
            <h2 className="text-lg font-bold mb-4">Редагувати технологічку</h2>

            <div className="mb-4">
                <label className="block text-gray-700 mb-2">Назва технологічки</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                />
            </div>

            {formData.components.map((component, index) => (
                <div key={index} className="mb-4">
                    <label className="block text-gray-700 mb-2">Компонент #{index + 1}</label>
                    <input
                        type="text"
                        value={component.name}
                        onChange={(e) => handleComponentsChange(index, "name", e.target.value)}
                        placeholder="Назва компонента"
                        list={`components-suggestions-${index}`}
                        className="w-full border rounded p-2"
                    />
                    <datalist id={`components-suggestions-${index}`}>
                        {allComponents.map((comp) => (
                            <option key={comp._id} value={comp.name} />
                        ))}
                    </datalist>
                    <input
                        type="text"
                        value={component.quantity}
                        onChange={(e) => handleComponentsChange(index, "quantity", e.target.value)}
                        placeholder="Кількість"
                        className="w-full border rounded p-2 mt-2"
                    />
                    <button
                        onClick={() => handleRemoveComponent(index)}
                        className="mt-2 bg-red-500 text-white px-4 py-1 rounded"
                    >
                        Видалити компонент
                    </button>
                </div>
            ))}

            <button
                onClick={handleAddComponent}
                className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
            >
                Додати компонент
            </button>

            <div className="flex justify-between">
                <button
                    onClick={handleSubmit}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                >
                    Зберегти
                </button>
                <button
                    onClick={onCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                    Скасувати
                </button>
            </div>
        </div>
    );
};

export default EditTechnologicalCard;
