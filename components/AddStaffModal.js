import React, { useState, useRef } from "react";
import axios from "axios";

const AddStaffModal = ({ tools, onStaffAdded }) => {
    const [formData, setFormData] = useState({
        fullName: "",
        department: "",
        duties: "",
        assignedTool: "",
    });
    const modalRef = useRef(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const resetForm = () => {
        setFormData({
            fullName: "",
            department: "",
            duties: "",
            assignedTool: "",
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post("/api/staff", formData);
            onStaffAdded();
            resetForm(); 
            modalRef.current.close();
        } catch (error) {
            console.error("Помилка додавання працівника:", error);
        }
    };

    return (
        <div>
            <button className="btn btn-accent" onClick={() => modalRef.current.showModal()}>
                Додати працівника
            </button>
            <dialog ref={modalRef} className="modal">
                <form onSubmit={handleSubmit} className="modal-box">
                    <h3 className="font-bold text-lg">Додати працівника</h3>
                    <div className="form-control">
                        <label>ПІП</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label>Цех</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-control">
                        <label>Обов&apos;язки</label>
                        <textarea
                            name="duties"
                            value={formData.duties}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>
                    <div className="form-control">
                        <label>Закріплений інструмент</label>
                        <select
                            name="assignedTool"
                            value={formData.assignedTool}
                            onChange={handleInputChange}
                        >
                            <option value="">Не вибрано</option>
                            {tools.map((tool) => (
                                <option key={tool._id} value={tool._id}>
                                    {tool.name}
                                </option>
                            ))}
                        </select>
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
                            Скасувати
                        </button>
                    </div>
                </form>
            </dialog>
        </div>
    );
};

export default AddStaffModal;

