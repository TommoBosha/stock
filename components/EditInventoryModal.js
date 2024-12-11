/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import axios from "axios";

const EditInventoryModal = ({ item, onClose, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: item.name,
        serialNumber: item.serialNumber,
        quantity: item.quantity,
        image: item.image || "",
        comment: item.comment || "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        const data = new FormData();
        data.append("file", file);

        try {
            const res = await axios.post("/api/upload", data);
            setFormData((prev) => ({ ...prev, image: res.data.links[0] }));
        } catch (error) {
            console.error("Помилка завантаження фото:", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put("/api/inventory", { ...formData, _id: item._id });
            onUpdate();
            onClose();
        } catch (error) {
            console.error("Помилка редагування інвентаря:", error);
        }
    };

    return (
        <dialog open className="modal">
            <form onSubmit={handleSubmit} className="modal-box">
                <h3 className="font-bold text-lg">Редагувати інвентар</h3>
                <div className="form-control">
                    <label>Назва</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label>Серійний номер</label>
                    <input
                        type="text"
                        name="serialNumber"
                        value={formData.serialNumber}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label>Кількість</label>
                    <input
                        type="text"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        required
                    />
                </div>
                <div className="form-control">
                    <label>Фото</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                    />
                    {formData.image && (
                        <img
                            src={formData.image}
                            alt="Preview"
                            className="w-16 h-16 object-cover mt-2"
                        />
                    )}
                </div>
                <div className="form-control">
                    <label>Коментар</label>
                    <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                    ></textarea>
                </div>
                <div className="modal-action">
                    <button type="submit" className="btn btn-primary">
                        Зберегти
                    </button>
                    <button type="button" className="btn" onClick={onClose}>
                        Скасувати
                    </button>
                </div>
            </form>
        </dialog>
    );
};

export default EditInventoryModal;
