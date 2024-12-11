/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";

// Ссылка на изображение по умолчанию
const defaultImage =
    "https://res.cloudinary.com/dzu849usg/image/upload/v1714332733/33-154-prokladka-98347104279697_drjc2p.webp";

const ComponentCard = ({ component, onUpdate }) => {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: component.name,
        unitPrice: component.unitPrice,
        quantity: component.quantity,
        images: component.images || defaultImage,
    });
    const [imagesLoading, setImagesLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleImagesChange = async (e) => {
        setImagesLoading(true);

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            // Перевірка, чи існують дані у відповіді перед отриманням першого елементу
            if (data.links && data.links.length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    images: data.links[0],
                }));
            } else {
                console.error(
                    "Помилка при завантаженні зображення: немає даних у відповіді"
                );
            }
        } catch (error) {
            console.error("Помилка при завантаженні зображення:", error);
        }

        setImagesLoading(false);
    };

    const handleUpdate = async () => {
        try {
            const updatedComponent = await fetch(`/api/components`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, _id: component._id }),
            }).then((res) => res.json());
            onUpdate(updatedComponent);
            setEditing(false);
        } catch (error) {
            console.error("Error updating component:", error);
        }
    };

    return (
        <div className="card card-compact  bg-base-100 shadow-xl my-4">
            <div className="card card-compact  bg-base-100 shadow-xl">
                <figure>
                    {imagesLoading ? (
                        <img
                            className="w-[317px] h-[189px]"
                            src={defaultImage}
                            alt={component.name}
                        />
                    ) : (
                        <img
                            className="w-[317px] h-[189px]"
                            src={formData.images}
                            alt={component.name}
                        />
                    )}
                </figure>
                <div className="card-body">
                    {editing ? (
                        <div className="form-control">
                            <label className="form-control w-full max-w-xs">

                                <span className="label-text">Назва</span>


                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="form-control w-full max-w-xs">

                                <span className="label-text">Ціна</span>


                                <input
                                    type="text"
                                    name="unitPrice"
                                    value={formData.unitPrice}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="form-control w-full max-w-xs">

                                <span className="label-text">Кількість на складі</span>


                                <input
                                    type="text"
                                    name="quantity"
                                    value={formData.quantity}
                                    onChange={handleInputChange}
                                />
                            </label>
                            <label className="form-control w-full max-w-xs">

                                <span className="label-text">Зображення</span>

                                <input
                                    className="file-input file-input-bordered w-full max-w-xs"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImagesChange}
                                />
                            </label>
                            <div className="card-actions justify-end">
                                <button className="btn " onClick={handleUpdate}>
                                    Зберігти
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="card-title">{component.name}</h2>
                            <p>Ціна: {component.unitPrice}</p>
                            <p>Кількість на складі: {component.quantity}</p>
                            <div className="card-actions justify-end">
                                <button
                                    className="btn btn-circle absolute right-2 top-2"
                                    onClick={() => setEditing(true)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth="2"
                                        stroke="currentColor"
                                        fontSize="16"
                                        className="w-4 h-4"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                        />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ComponentCard;
