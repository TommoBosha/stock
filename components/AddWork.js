import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const AddWork = ({ fetchWorkDays }) => {
    
    const [startDate, setStartDate] = useState(new Date().toISOString().substring(0, 10));
   
    const [endDate, setEndDate] = useState(new Date().toISOString().substring(0, 10));
    const [serialNumber, setSerialNumber] = useState("");
    const [orders, setOrders] = useState([{ orderNumber: "" }]);
    const [products, setProducts] = useState([{ name: "", quantity: 1, _id: "" }]);
    const [comment, setComment] = useState("");

   
    const [availableOrders, setAvailableOrders] = useState([]);
    const [availableProducts, setAvailableProducts] = useState([]);
    const [staffList, setStaffList] = useState([]);

    
    const [contractors, setContractors] = useState([]);

    const modalRef = useRef(null);

    useEffect(() => {
        
        const fetchOrders = async () => {
            const response = await axios.get("/api/orders");
            setAvailableOrders(response.data);
        };
        
        const fetchProducts = async () => {
            const response = await axios.get("/api/products");
            setAvailableProducts(response.data);
        };
        
        const fetchStaff = async () => {
            try {
                const response = await axios.get("/api/staff");
                console.log("Staff data:", response.data);
                setStaffList(response.data);
            } catch (error) {
                console.error("Error fetching staff:", error);
            }
        };

        fetchOrders();
        fetchProducts();
        fetchStaff();
    }, []);

  
    async function saveWorkDay(e) {
        e.preventDefault();
        const data = {
            startDate,
            endDate, 
            serialNumber,
            orders,
            products,
            contractors,
            comment,
            status: 'inWork'
        };

        try {
            const response = await axios.post("/api/atwork", data);
            if (response.data.shortage && response.data.shortage.length > 0) {
                alert(`Увага: Нестача компонентів: ${response.data.shortage.map(s => `${s.component} (потрібно: ${s.required}, доступно: ${s.available})`).join(", ")}`);
            } else {
                fetchWorkDays();
                clearForm();
                modalRef.current.close();
            }
        } catch (error) {
            console.error('Помилка при додаванні робочого дня:', error);
            if (error.response && error.response.data && error.response.data.shortage) {
                alert(`Увага: Нестача компонентів: ${error.response.data.shortage.map(s => `${s.component} (потрібно: ${s.required}, доступно: ${s.available})`).join(", ")}`);
            } else {
                alert("Сталася помилка при додаванні робочого дня.");
            }
        }
    }

    function clearForm() {
        setStartDate(new Date().toISOString().substring(0, 10));
        setEndDate(new Date().toISOString().substring(0, 10)); 
        setSerialNumber("");
        setOrders([{ orderNumber: "" }]);
        setProducts([{ name: "", quantity: 1, _id: "" }]);
        setContractors([]);
        setComment("");
        
    }

    function updateOrder(index, value) {
        const updatedOrders = [...orders];
        updatedOrders[index].orderNumber = value;
        setOrders(updatedOrders);
    }

    function addProduct() {
        setProducts(prev => [...prev, { name: "", quantity: 1, _id: "" }]);
    }

    function removeProduct(index) {
        setProducts(prev => prev.filter((_, i) => i !== index));
    }

    function updateProduct(index, key, value, id = null) {
        const updatedProducts = [...products];
        const updatedProduct = { ...updatedProducts[index], [key]: value };
        if (id) updatedProduct._id = id;
        updatedProducts[index] = updatedProduct;
        setProducts(updatedProducts);
    }

    function toggleContractor(id, checked) {
        if (checked) {
            setContractors(prev => [...prev, id]);
        } else {
            setContractors(prev => prev.filter(c => c !== id));
        }
    }

    return (
        <div className="py-[8px]">
            <button
                className="btn bg-accent"
                onClick={() => {
                    clearForm();
                    modalRef.current.showModal();
                }}>
                Додати в роботу
            </button>
            <dialog ref={modalRef} id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box p-6 bg-white shadow-xl rounded-md">
                    <form onSubmit={saveWorkDay}>
                        <h3>Початкова дата робіт:</h3>
                        <input 
                            type="date" 
                            value={startDate} 
                            onChange={e => setStartDate(e.target.value)} 
                        />

                        <h3>Дата завершення робіт:</h3>
                        <input 
                            type="date" 
                            value={endDate} 
                            onChange={e => setEndDate(e.target.value)} 
                            min={startDate} 
                        />

                        <h3>Серійний номер:</h3>
                        <input 
                            type="text" 
                            value={serialNumber} 
                            onChange={e => setSerialNumber(e.target.value)} 
                        />

                        <h3>Замовлення:</h3>
                        {orders.map((order, index) => (
                            <div key={index}>
                                <input
                                    type="text"
                                    list="order-list"
                                    placeholder="Номер замовлення"
                                    value={order.orderNumber}
                                    onChange={e => updateOrder(index, e.target.value)}
                                />
                                <datalist id="order-list">
                                    {availableOrders.map(o => (
                                        <option key={o._id} value={o.orderNumber} />
                                    ))}
                                </datalist>
                            </div>
                        ))}

                        <div className="flex flex-col gap-4">
                            <h3>Продукти:</h3>
                            {products.map((product, index) => (
                                <div key={index}>
                                    <input
                                        type="text"
                                        list="product-list"
                                        placeholder="Назва продукту"
                                        value={product.name}
                                        onChange={e => {
                                            const selectedProduct = availableProducts.find(p => p.name === e.target.value);
                                            if (selectedProduct) {
                                                updateProduct(index, 'name', e.target.value, selectedProduct._id);
                                            } else {
                                                updateProduct(index, 'name', e.target.value);
                                            }
                                        }}
                                    />
                                    <datalist id="product-list">
                                        {availableProducts.map(p => (
                                            <option key={p._id} value={p.name} />
                                        ))}
                                    </datalist>
                                    <input
                                        type="number"
                                        placeholder="Кількість"
                                        value={product.quantity}
                                        onChange={e => updateProduct(index, 'quantity', parseInt(e.target.value))}
                                    />
                                    <button 
                                        className="btn-default" 
                                        type="button" 
                                        onClick={() => removeProduct(index)}>
                                        Видалити
                                    </button>
                                </div>
                            ))}
                            <button 
                                className="btn-default" 
                                type="button" 
                                onClick={addProduct}>
                                Додати продукт
                            </button>
                        </div>

                        <h3 className="font-semibold">Виконавці (персонал):</h3>
                       
                        <div className="flex flex-col gap-2 mt-3">
                            {staffList.map(staff => (
                                <label key={staff._id} className="flex flex-row-reverse justify-between align-baseline font-medium text-base">
                                    <input
                                    className="w-[30%]"
                                        type="checkbox"
                                        value={staff._id}
                                        checked={contractors.includes(staff._id)}
                                        onChange={e => toggleContractor(staff._id, e.target.checked)}
                                    /> {staff.fullName}
                                </label>
                            ))}
                        </div>

                        <h3>Коментар:</h3>
                        <textarea 
                            value={comment} 
                            onChange={e => setComment(e.target.value)} 
                        />

                        <button 
                            className="btn-default mt-4" 
                            type="submit">
                            Зберегти
                        </button>
                    </form>
                    <button
                        className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                        onClick={() => modalRef.current.close()}>
                        ✕
                    </button>
                </div>
            </dialog>
        </div>
    );
};

export default AddWork;