import React, { useState } from "react";
import axios from "axios";

const EditStaffModal = ({ staffMember, tools, onClose, onStaffUpdated }) => {
    const [formData, setFormData] = useState({
        fullName: staffMember.fullName,
        department: staffMember.department,
        duties: staffMember.duties,
        assignedTool: staffMember.assignedTool?._id || "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.put("/api/staff", { ...formData, _id: staffMember._id }); 
            onStaffUpdated(); 
            onClose(); 
        } catch (error) {
            console.error("Ошибка редактирования сотрудника:", error);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white w-full max-w-2xl h-full md:h-auto p-6 overflow-y-auto shadow-lg">
                <h3 className="font-bold text-lg mb-4">Редагувати працівника</h3>
                <form onSubmit={handleSubmit}>
                    <div className="form-control mb-4">
                        <label>ПІП</label>
                        <input
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="form-control mb-4">
                        <label>Цех</label>
                        <input
                            type="text"
                            name="department"
                            value={formData.department}
                            onChange={handleInputChange}
                            required
                            className="input input-bordered w-full"
                        />
                    </div>
                    <div className="form-control mb-4">
                        <label>Обов&apos;язки</label>
                        <textarea
                            name="duties"
                            value={formData.duties}
                            onChange={handleInputChange}
                            required
                            className="textarea textarea-bordered w-full"
                        ></textarea>
                    </div>
                    <div className="form-control mb-4">
                        <label>Закріплений інструмент</label>
                        <select
                            name="assignedTool"
                            value={formData.assignedTool}
                            onChange={handleInputChange}
                            className="select select-bordered w-full"
                        >
                            <option value="">Не вибрано</option>
                            {tools.map((tool) => (
                                <option key={tool._id} value={tool._id}>
                                    {tool.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={onClose} className="btn btn-secondary">
                            Скасувати
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Зберегти
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditStaffModal;
