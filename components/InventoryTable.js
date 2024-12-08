/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";
import EditInventoryModal from "./EditInventoryModal";
import { withSwal } from "react-sweetalert2";
import axios from "axios"; // Импорт axios

const InventoryTable = ({ items, onUpdate, swal }) => {
    const [editingItem, setEditingItem] = useState(null);

    const handleEdit = (item) => {
        setEditingItem(item);
    };

    const handleDelete = async (id) => {
        swal.fire({
            title: "Ви впевнені?",
            text: "Це видалить інвентар назавжди.",
            showCancelButton: true,
            confirmButtonText: "Так, видалити!",
            cancelButtonText: "Скасувати",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/inventory?id=${id}`);
                    onUpdate();
                    swal.fire("Видалено!", "Інвентар був видалений.", "success");
                } catch (error) {
                    console.error("Помилка при видаленні інвентаря:", error);
                    swal.fire("Помилка", "Не вдалося видалити інвентар.", "error");
                }
            }
        });
    };

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Фото</th>
                        <th>Назва</th>
                        <th>Серійний номер</th>
                        <th>Кількість</th>
                        <th>Коментар</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item) => (
                        <tr key={item._id} className="hover">
                            <td>
                                <img
                                    src={item.image || "/placeholder.png"}
                                    alt={item.name}
                                    className="w-16 h-16 object-cover rounded"
                                />
                            </td>
                            <td>{item.name}</td>
                            <td>{item.serialNumber}</td>
                            <td>{item.quantity}</td>
                            <td>{item.comment}</td>
                            <td className="flex flex-row gap-2">
                                <button
                                    className="btn btn-primary"
                                    onClick={() => handleEdit(item)}
                                >
                                    Редагувати
                                </button>
                                <button
                                    className="btn btn-danger"
                                    onClick={() => handleDelete(item._id)}
                                >
                                    Видалити
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {editingItem && (
                <EditInventoryModal
                    item={editingItem}
                    onClose={() => setEditingItem(null)}
                    onUpdate={onUpdate}
                />
            )}
        </div>
    );
};

export default withSwal(InventoryTable);

