import React, { useState, useEffect } from 'react';

const EditWorkDay = ({
    initialData,
    availableOrders,
    availableProducts,
    availableStaff,
    onSave,
    onCancel
}) => {
    const [formData, setFormData] = useState(initialData);

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

    // Функція для додавання/видалення вибраного працівника
    const toggleContractor = (id, checked) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                contractors: [...prev.contractors, id]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                contractors: prev.contractors.filter(c => c !== id)
            }));
        }
    };

    const handleSave = () => {
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 p-4">
            <div className="bg-white p-6 rounded-md w-full max-w-3xl overflow-auto max-h-[90vh]">
                <h2 className="text-xl font-bold mb-4">Редагувати робочий день</h2>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Початкова дата</label>
                    <input
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange(e, 'startDate')}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Дата завершення</label>
                    <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange(e, 'endDate')}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Серійний номер</label>
                    <input
                        type="text"
                        value={formData.serialNumber}
                        onChange={(e) => handleInputChange(e, 'serialNumber')}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Замовлення</label>
                    {formData.orders.map((order, index) => (
                        <select
                            key={index}
                            value={order.orderNumber}
                            onChange={(e) => handleSelectChange(index, e.target.value, 'orders', 'orderNumber')}
                            className="border p-2 w-full mb-2"
                        >
                            {availableOrders.map(o => (
                                <option key={o._id} value={o.orderNumber}>{o.orderNumber}</option>
                            ))}
                        </select>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Продукти</label>
                    {formData.products.map((product, index) => (
                        <div key={index} className="flex items-center gap-2 mb-2">
                            <select
                                value={product.name}
                                onChange={(e) => handleSelectChange(index, e.target.value, 'products', 'name')}
                                className="border p-2"
                            >
                                {availableProducts.map(p => (
                                    <option key={p._id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={product.quantity}
                                onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                className="border p-2 w-20"
                            />
                        </div>
                    ))}
                </div>

                <h3 className="font-semibold mb-2">Виконавці (персонал):</h3>
                <div className="flex flex-col gap-2 mb-4">
                    {availableStaff.map(staff => (
                        <label key={staff._id} className="flex flex-row-reverse justify-between align-baseline font-medium text-base">
                            <input
                            className="w-[30%]"
                                type="checkbox"
                                value={staff._id}
                                checked={formData.contractors.includes(staff._id)}
                                onChange={e => toggleContractor(staff._id, e.target.checked)}
                            />
                            <span>{staff.fullName}</span>
                        </label>
                    ))}
                </div>

                <div className="mb-4">
                    <label className="block font-semibold mb-1">Коментар</label>
                    <input
                        type="text"
                        value={formData.comment}
                        onChange={(e) => handleInputChange(e, 'comment')}
                        className="border p-2 w-full"
                    />
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        className="btn-primary"
                        onClick={handleSave}
                    >
                        Зберегти
                    </button>
                    <button
                        className="btn-secondary"
                        onClick={onCancel}
                    >
                        Скасувати
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditWorkDay;
