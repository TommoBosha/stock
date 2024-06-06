import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { withSwal } from "react-sweetalert2";

const WorkTable = ({ swal, onUpdate, fetchWorkDays, workDays }) => {
    const [editingWorkDayId, setEditingWorkDayId] = useState(null);
    const [availableOrders, setAvailableOrders] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [formData, setFormData] = useState({
        date: '',
        serialNumber: '',
        orders: [],
        products: [],
        contractor: '',
        comment: ''
    });

    const contractorMap = {
        Alex: "Олексій",
        Den: "Денис",
        VolodyaDzed: "Володимир",
        Mykola: "Микола",
        VolodyaKharkiv: "Володимир Харків"
    };

    useEffect(() => {
        const fetchOrdersAndProducts = async () => {
            try {
                const [ordersRes, productsRes] = await Promise.all([
                    axios.get('/api/orders'),
                    axios.get('/api/products')
                ]);
                setAvailableOrders(ordersRes.data);
                setAvailableProducts(productsRes.data);
            } catch (error) {
                console.error("Failed to fetch orders or products:", error);
            }
        };

        fetchOrdersAndProducts();
    }, []);

    const handleEdit = (workDay) => {
        setEditingWorkDayId(workDay._id);
        setFormData({
            date: new Date(workDay.date).toISOString().substring(0, 10),
            serialNumber: workDay.serialNumber,
            orders: workDay.orders,
            products: workDay.products,
            contractor: workDay.contractor,
            comment: workDay.comment
        });
    };

    const handleInputChange = (e, field) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [field]: e.target.value,
        }));
    };

    const handleSelectChange = (index, value, arrayName, field) => {
        setFormData((prevFormData) => ({
            ...prevFormData,
            [arrayName]: prevFormData[arrayName].map((item, idx) => idx === index ? { ...item, [field]: value } : item)
        }));
    };

    const handleProductChange = (index, field, value) => {
        setFormData(prevFormData => ({
            ...prevFormData,
            products: prevFormData.products.map((product, idx) => idx === index ? { ...product, [field]: value } : product)
        }));
    };

    const handleUpdate = async () => {
        try {
            const updatedWorkDay = await axios.put(`/api/atwork`, {
                ...formData,
                _id: editingWorkDayId
            }).then((res) => res.data);

            onUpdate(updatedWorkDay);
            setEditingWorkDayId(null);
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
        setEditingWorkDayId(null);
    };

    return (
        <div className="overflow-x-auto">
            <table className="table w-full">
                <thead>
                    <tr>
                        <th>Дата</th>
                        <th>Серійний номер</th>
                        <th>Замовлення</th>
                        <th>Продукти</th>
                        <th>Підрядник</th>
                        <th>Коментар</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {workDays.map((workDay) => (
                        <tr key={workDay._id}>
                            <td>{editingWorkDayId === workDay._id ? (
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => handleInputChange(e, 'date')}
                                />
                            ) : (
                                new Date(workDay.date).toLocaleDateString()
                            )}</td>
                            <td>{editingWorkDayId === workDay._id ? (
                                <input
                                    type="text"
                                    value={formData.serialNumber}
                                    onChange={(e) => handleInputChange(e, 'serialNumber')}
                                />
                            ) : (
                                workDay.serialNumber
                            )}</td>
                            <td>
                                {editingWorkDayId === workDay._id ? (
                                    <div>
                                        {formData.orders.map((order, index) => (
                                            <select key={index} value={order.orderNumber} onChange={(e) => handleSelectChange(index, e.target.value, 'orders', 'orderNumber')}>
                                                {availableOrders.map(o => (
                                                    <option key={o._id} value={o.orderNumber}>{o.orderNumber}</option>
                                                ))}
                                            </select>
                                        ))}
                                    </div>
                                ) : (
                                    workDay.orders.map((order, index) => (
                                        <div key={index}>{order.orderNumber}</div>
                                    ))
                                )}
                            </td>
                            <td>
                                {editingWorkDayId === workDay._id ? (
                                    <div>
                                        {formData.products.map((product, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <select
                                                    value={product.name}
                                                    onChange={(e) => handleSelectChange(index, e.target.value, 'products', 'name')}
                                                >
                                                    {availableProducts.map(p => (
                                                        <option key={p._id} value={p.name}>{p.name}</option>
                                                    ))}
                                                </select>
                                                <input
                                                    type="number"
                                                    value={product.quantity}
                                                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                                    className="input input-bordered w-20"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    workDay.products.map((product, index) => (
                                        <div key={index}>{product.name} ({product.quantity})</div>
                                    ))
                                )}
                            </td>
                            <td>{editingWorkDayId === workDay._id ? (
                                <select
                                    value={formData.contractor}
                                    onChange={(e) => handleInputChange(e, 'contractor')}
                                >
                                    {Object.entries(contractorMap).map(([key, name]) => (
                                        <option key={key} value={key}>{name}</option>
                                    ))}
                                </select>
                            ) : (
                                contractorMap[workDay.contractor]
                            )}</td>
                            <td>{editingWorkDayId === workDay._id ? (
                                <input
                                    type="text"
                                    value={formData.comment}
                                    onChange={(e) => handleInputChange(e, 'comment')}
                                />
                            ) : (
                                workDay.comment
                            )}</td>
                            <td>
                                {editingWorkDayId === workDay._id ? (
                                    <div className=" flex flex-row gap-2">
                                        <button
                                            className="btn-primary"
                                            onClick={handleUpdate}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth={1.5}
                                                stroke="currentColor"
                                                className="w-5 h-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                                                />
                                            </svg>
                                        </button>
                                        <button
                                            className="btn-primary"
                                            onClick={handleCancelEdit}>

                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                            </svg>

                                        </button>
                                    </div>
                                ) : (
                                    <div className=" flex flex-row gap-2">
                                        <button
                                            className="btn-primary"
                                            onClick={() => handleEdit(workDay)}>

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
                                            onClick={() => handleDelete(workDay._id)}>
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                aria-hidden="true"
                                                role="img"
                                                fontSize="16"
                                                width="1em"
                                                height="1em"
                                                viewBox="0 0 24 24"
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
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default withSwal(WorkTable);