/* eslint-disable @next/next/no-img-element */
import React, { useState, useRef } from "react";
import axios from "axios";

const AddInventoryModal = ({ onItemAdded }) => {
    const [formData, setFormData] = useState({
        name: "",
        serialNumber: "",
        quantity: "",
        image: "",
        comment: "",
    });
    const modalRef = useRef(null);
    const fileInputRef = useRef(null); 

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            name: "",
            serialNumber: "",
            quantity: 1, 
            image: "",
            comment: "",
        });
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
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
            await axios.post("/api/inventory", formData);
            onItemAdded();
            resetForm(); 
            modalRef.current.close(); 
        } catch (error) {
            console.error("Помилка додавання інвентарю:", error);
        }
    };

    return (
        <div>
            <button className="btn btn-accent" onClick={() => modalRef.current.showModal()}>
                Додати інвентар
            </button>
            <dialog ref={modalRef} className="modal">
                <form onSubmit={handleSubmit} className="modal-box">
                    <h3 className="font-bold text-lg">Додати інвентар</h3>
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
                            ref={fileInputRef} 
                        />
                        {formData.image && (
                            <img
                                src={formData.image}
                                alt="Завантажене зображення"
                                className="w-16 h-16 mt-2 object-cover"
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
                        <button
                            type="button"
                            className="btn"
                            onClick={() => {
                                resetForm(); 
                                modalRef.current.close();
                            }}
                        >
                            Закрити
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
};

export default AddInventoryModal;


