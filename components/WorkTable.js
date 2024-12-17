import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { withSwal } from "react-sweetalert2";
import EditWorkDay from './EditAtWork';

const WorkTable = ({ swal, onUpdate, fetchWorkDays, workDays }) => {
    const [editingWorkDay, setEditingWorkDay] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [availableStaff, setAvailableStaff] = useState([]);

    const [activeTab, setActiveTab] = useState('inWork'); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersRes, productsRes, staffRes] = await Promise.all([
                    axios.get('/api/orders'),
                    axios.get('/api/products'),
                    axios.get('/api/staff')
                ]);
                setAvailableOrders(ordersRes.data);
                setAvailableProducts(productsRes.data);
                setAvailableStaff(staffRes.data);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };

        fetchData();
    }, []);

    const handleEdit = (workDay) => {
        setEditingWorkDay({
            _id: workDay._id,
            startDate: new Date(workDay.startDate).toISOString().substring(0, 10),
            endDate: new Date(workDay.endDate).toISOString().substring(0, 10),
            serialNumber: workDay.serialNumber,
            orders: workDay.orders,
            products: workDay.products,
            contractors: workDay.contractors.map(contractor => contractor._id),
            comment: workDay.comment
        });
    };

    const handleUpdate = async (updatedData) => {
        try {
            const updatedWorkDay = await axios.put(`/api/atwork`, {
                ...updatedData,
                _id: updatedData._id
            }).then((res) => res.data);

            onUpdate(updatedWorkDay);
            setEditingWorkDay(null);
            fetchWorkDays();
        } catch (error) {
            console.error("Error updating work day:", error);
        }
    };

    const handleDelete = (workDayId) => {
        swal.fire({
            title: "Ви впевнені?",
            text: "Ви дійсно хочете видалити цей робочий день?",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Так, видалити!',
            cancelButtonText: 'Скасувати'
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await axios.delete(`/api/atwork?id=${workDayId}`);
                    onUpdate(workDays.filter(workDay => workDay._id !== workDayId));
                    swal.fire("Видалено!", "Робочий день було видалено.", "success");
                } catch (error) {
                    console.error("Помилка при видаленні робочого дня:", error);
                    swal.fire("Помилка", "Не вдалося видалити робочий день.", "error");
                }
                fetchWorkDays();
            }
        });
    };

    const handleCancelEdit = () => {
        setEditingWorkDay(null);
    };

    const handleMarkAsDone = async (workDay) => {
        try {
            await axios.put('/api/atwork', {
                _id: workDay._id,
                orders: workDay.orders,
                startDate: workDay.startDate,
                endDate: workDay.endDate,
                serialNumber: workDay.serialNumber,
                products: workDay.products,
                contractors: workDay.contractors.map(c => c._id), 
                comment: workDay.comment,
                status: 'done' 
            });
            fetchWorkDays(); 
        } catch (error) {
            console.error("Error marking work day as done:", error);
        }
    };

    const filteredWorkDays = workDays.filter(workDay => {
        if (activeTab === 'inWork') {
            return workDay.status === 'inWork';
        } else {
            return workDay.status === 'done';
        }
    });

    return (
        <div className="overflow-x-auto">
            <div className="mb-4 flex gap-4 justify-center">
                <button
                    className={`btn ${activeTab === 'inWork' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('inWork')}
                >
                    В роботі
                </button>
                <button
                    className={`btn ${activeTab === 'done' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('done')}
                >
                    Виконані
                </button>
            </div>

            <table className="table w-full">
                <thead>
                    <tr>
                        <th>Початкова дата</th>
                        <th>Дата завершення</th>
                        <th>Серійний номер</th>
                        <th>Замовлення</th>
                        <th>Продукти</th>
                        <th>Виконавці</th>
                        <th>Коментар</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredWorkDays.map((workDay) => {
                        const endDateObj = new Date(workDay.endDate);
                        const currentDate = new Date();
                        const isOverdue = endDateObj < currentDate && workDay.status === 'inWork';

                        return (
                            <tr key={workDay._id} className={isOverdue ? 'bg-red-100' : ''}>
                                <td>{new Date(workDay.startDate).toLocaleDateString()}</td>
                                <td>{endDateObj.toLocaleDateString()}</td>
                                <td>{workDay.serialNumber}</td>
                                <td>
                                    {workDay.orders.map((order, index) => (
                                        <div key={index}>{order.orderNumber}</div>
                                    ))}
                                </td>
                                <td>
                                    {workDay.products.map((product, index) => (
                                        <div key={index}>{product.name} ({product.quantity})</div>
                                    ))}
                                </td>
                                <td>
                                    {Array.isArray(workDay.contractors) && workDay.contractors.length > 0
                                        ? (
                                            <div className="flex flex-col gap-1">
                                                {workDay.contractors.map((contractor) => (
                                                    <Link key={contractor._id} href={`/staff/${contractor._id}`}>
                                                        {contractor.fullName}
                                                    </Link>
                                                ))}
                                            </div>
                                        )
                                        : '—'}
                                </td>
                                <td>{workDay.comment}</td>
                                <td className="flex flex-row gap-2">
                                    {workDay.status === 'inWork' && (
                                        <button
                                            className="btn bg-green-500 text-white"
                                            onClick={() => handleMarkAsDone(workDay)}
                                        >
                                            Виконано
                                        </button>
                                    )}
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleEdit(workDay)}
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
                                    <button
                                        className="btn-primary"
                                        onClick={() => handleDelete(workDay._id)}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            aria-hidden="true"
                                            role="img"
                                            fontSize="16"
                                            width="1em"
                                            height="1em"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                fill="none"
                                                stroke="currentColor"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                            ></path>
                                        </svg>
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>

            {editingWorkDay && (
                <EditWorkDay
                    initialData={editingWorkDay}
                    availableOrders={availableOrders}
                    availableProducts={availableProducts}
                    availableStaff={availableStaff}
                    onSave={handleUpdate}
                    onCancel={handleCancelEdit}
                />
            )}
        </div>
    );
};

export default withSwal(WorkTable);

