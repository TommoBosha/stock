/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const EditProduct = ({ product, onUpdate, onCancel, fetchCompany }) => {
    const [formData, setFormData] = useState({
        name: product.name,
        components: product.components,
        agent: product.agent,
        assemblyPrice: product.assemblyPrice,
        images: product.images,
    });

    const [allComponents, setAllComponents] = useState([]);
    const [imageLoading, setImageLoading] = useState(false);

    useEffect(() => {
        axios.get('/api/components')
            .then(response => setAllComponents(response.data))
            .catch(error => console.error('Error fetching components:', error));
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleComponentsChange = (index, field, value) => {
        const newComponents = formData.components.map((component, i) => {
            if (i === index) {
                return { ...component, [field]: value };
            }
            return component;
        });
        setFormData({ ...formData, components: newComponents });
    };

    const handleAddComponent = () => {
        const newComponent = { name: "", quantity: 0 };
        setFormData({ ...formData, components: [...formData.components, newComponent] });
    };

    const handleRemoveComponent = (index) => {
        const filteredComponents = formData.components.filter((_, i) => i !== index);
        setFormData({ ...formData, components: filteredComponents });
    };

    const handleImageUpload = async (e) => {
        setImageLoading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('file', file);


        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.links && data.links.length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    images: data.links[0],
                }));
            } else {
                console.error('Failed to upload image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        } finally {
            setImageLoading(false);
        }
    };



    const handleSubmit = async () => {
        const dataToSend = {
            name: formData.name,
            components: formData.components.map(component => ({
                name: component.name,
                quantity: component.quantity,
                _id: allComponents.find(c => c.name === component.name)?._id
            })),
            agent: formData.agent,
            assemblyPrice: formData.assemblyPrice,
            images: formData.images
        };
        console.log("Отправка данных на сервер:", JSON.stringify(dataToSend, null, 2));

        try {
            const response = await fetch(`/api/products`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...dataToSend, _id: product._id })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const updatedProduct = await response.json();
            onUpdate(updatedProduct);
            onCancel();
            fetchCompany();
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto my-4 p-5 bg-white shadow-md rounded-lg">
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Назва продукту
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Введіть назву продукту"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            {formData.components.map((component, index) => (
                <div key={index} className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor={`component-${index}`}>
                        Компонент #{index + 1}
                    </label>
                    <input
                        type="text"
                        id={`component-${index}`}
                        value={component.name}
                        onChange={(e) => handleComponentsChange(index, 'name', e.target.value)}
                        placeholder="Назва компонента"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        list={`component-suggestions-${index}`}
                    />
                    <datalist id={`component-suggestions-${index}`}>
                        {allComponents.map(c => (
                            <option key={c._id} value={c.name} />
                        ))}
                    </datalist>
                    <input
                        type="text"
                        value={component.quantity}
                        onChange={(e) => handleComponentsChange(index, 'quantity', e.target.value)}
                        placeholder="Кількість"
                        className="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button onClick={() => handleRemoveComponent(index)} className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded-[0.125rem] focus:outline-none focus:shadow-outline">
                        Видалити компонент
                    </button>
                </div>
            ))}

            <button onClick={handleAddComponent} className="btn-primary font-bold ">
                Додати компонент
            </button>

            <div className="my-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Послуги посередництва
                </label>
                <input
                    type="text"
                    id="agent"
                    name="agent"
                    value={formData.agent}
                    onChange={handleInputChange}
                    placeholder="Введіть посередника чи комментар"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                    Ціна за зборку
                </label>
                <input
                    type="text"
                    id="assemblyPrice"
                    name="assemblyPrice"
                    value={formData.assemblyPrice}
                    onChange={handleInputChange}
                    placeholder="Введіть ціну за зборку"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            <div className="my-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="imageUpload">
                    Зображення продукту
                </label>
                <input
                    type="file"
                    id="images"
                    accept="image/*"

                    onChange={handleImageUpload}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {imageLoading && <p>Завантаження...</p>}
                {formData.images && <img src={formData.images} alt="Product" className="mt-2 w-48" />}
            </div>

            <div className="flex items-center justify-between">
                <button onClick={handleSubmit} className="btn-primary font-bold py-2">
                    Зберегти
                </button>
                <button onClick={onCancel} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-[0.125rem] focus:outline-none focus:shadow-outline">
                    Скасувати
                </button>
            </div>
        </div>
    );
};

export default EditProduct;