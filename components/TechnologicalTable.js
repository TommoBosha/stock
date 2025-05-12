import React, { useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { withSwal } from 'react-sweetalert2';
import EditTechnologicalCard from './EditTechnologicalCard';

const TechnologicalTable = ({ items, fetchItems, swal }) => {
    const [editingItem, setEditingItem] = useState(null);

    const handleDelete = async (itemId) => {
        swal.fire({
            title: "Ви впевнені?",
            text: "Це видалить виріб назавжди.",
            showCancelButton: true,
            confirmButtonText: "Так, видалити!",
            cancelButtonText: "Скасувати",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/technological?id=${itemId}`);
                    fetchItems();
                    swal.fire("Видалено!", "Виріб був видалений.", "success");
                } catch (error) {
                    console.error("Помилка при видаленні виробу:", error);
                    swal.fire("Помилка", "Не вдалося видалити виріб.", "error");
                }
            }
        });
    };

    const handleUpdate = (updatedItem) => {
        fetchItems();
        setEditingItem(null);
    };


    return (
        <>
            {editingItem && (
                <EditTechnologicalCard
                    item={editingItem}
                    onUpdate={handleUpdate}
                    onCancel={() => setEditingItem(null)}
                />
            )}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6 ${editingItem ? 'hidden' : ''}`}>
                {items.map((item) => (
                    <div key={item._id} className="relative">
                        <Link href={`/technological/${item._id}`}>
                            <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200 cursor-pointer">
                                <h2 className="text-lg font-bold mb-4">{item.name}</h2>
                            </div>
                        </Link>
                        <div className="absolute top-2 right-2 flex gap-2">
                            <button
                                className="btn btn-primary"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingItem(item);
                                }}
                            >
                                Редагувати
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleDelete(item._id);
                                }}
                            >
                                Видалити
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default withSwal(TechnologicalTable);