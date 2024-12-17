import React, { useState } from "react";
import EditStaffModal from "./EditStaffModal";
import { withSwal } from "react-sweetalert2";
import axios from "axios";
import Link from "next/link";

const StaffCards = ({ staff, tools, onUpdate, swal }) => {
    const [editingStaff, setEditingStaff] = useState(null);

    const handleDelete = async (staffId) => {
        swal.fire({
            title: "Ви впевнені?",
            text: "Це видалить працівника назавжди.",
            showCancelButton: true,
            confirmButtonText: "Так, видалити!",
            cancelButtonText: "Скасувати",
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/staff?id=${staffId}`);
                    onUpdate();
                    swal.fire("Видалено!", "Працівника було видалено.", "success");
                } catch (error) {
                    console.error("Помилка при видаленні працівника:", error);
                    swal.fire("Помилка", "Не вдалося видалити працівника.", "error");
                }
            }
        });
    };

    return (
        <>
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${editingStaff ? 'hidden' : ''}`}>
                {staff.map((worker) => (
                    <Link key={worker._id} href={`/staff/${worker._id}`}>
                       
                        <div className="card shadow-lg cursor-pointer">
                            <div className="card-body bg-white rounded-lg">
                                <h2 className="card-title">{worker.fullName}</h2>
                                <p>Цех: {worker.department}</p>
                                <p>Обов&apos;язки: {worker.duties}</p>
                                <p>Закріплений інструмент: {worker.assignedTool?.name || "Немає"}</p>
                                <div className="card-actions justify-end mt-3">
                                    <button
                                        className="btn btn-primary"
                                        onClick={(e) => {
                                            e.stopPropagation(); 
                                            e.preventDefault(); 
                                            setEditingStaff(worker);
                                        }}
                                    >
                                        Редагувати
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            e.preventDefault();
                                            handleDelete(worker._id);
                                        }}
                                    >
                                        Видалити
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
            {editingStaff && (
                <EditStaffModal
                    staffMember={editingStaff}
                    tools={tools}
                    onClose={() => setEditingStaff(null)}
                    onStaffUpdated={onUpdate}
                />
            )}
        </>
    );
};

export default withSwal(StaffCards);


