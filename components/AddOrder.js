import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AddOrder = ({ fetchOrders }) => {
    const [formData, setFormData] = useState({
        orderNumber: "",
        data: "",
        client: "",
        products: [],

        totalPrice: "",
        isPaid: "",
    });
    const [clients, setClients] = useState([]);
    const [filteredClients, setFilteredClients] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [productOptions, setProductOptions] = useState([]);

    const inputRef = useRef(null);

    const fetchClients = async () => {
        try {
            const res = await axios.get("/api/clients");
            setClients(res.data);
        } catch (error) {
            console.error("Помилка при отриманні списку клієнтів:", error);
        }
    };

    const fetchProducts = async () => {
        try {
            const res = await axios.get("/api/products");
            console.log(res.data)
            setProductOptions(res.data.map(product => ({ id: product._id, name: product.name })));
        } catch (error) {
            console.error("Помилка при отриманні списку продуктів:", error);
        }
    };

    useEffect(() => {
        fetchClients();
        fetchProducts();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (inputRef.current && !inputRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const handleChange = (e) => {
        setInputValue(e.target.value);
        filterClients(e.target.value);
        setShowDropdown(true);
    };

    const filterClients = (value) => {
        const filtered = clients.filter((client) =>
            client.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredClients(filtered);
    };

    const handleClientSelect = (clientId, clientName) => {
        setInputValue(clientName);
        setFormData(prevState => ({
            ...prevState,
            client: clientId
        }));
        setShowDropdown(false);
    };

    const handleAddProduct = () => {
        const newProduct = {
            name: '',
            quantity: 0,
        };
        console.log(newProduct)
        setFormData({ ...formData, products: [...formData.products, newProduct] });
    };

    const handleCancelProduct = () => {
        const updatedProducts = [...formData.products];
        updatedProducts.pop();
        setFormData({ ...formData, products: updatedProducts });
    };

    const handleProductChange = (index, field, value, productId) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index][field] = value;
        console.log(updatedProducts)
        if (field === 'name') {
            updatedProducts[index].product = productId; // Переконайтеся, що productId встановлюється правильно
        }
        setFormData({ ...formData, products: updatedProducts });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log(formData.products)
        // if (formData.products.some(product => !product.product)) {
        //     console.error("Не всі продукти мають коректний ID");
        //     return; // Припиніть відправку форми, якщо який-небудь продукт не має ID
        // }

        try {
            const dataToSend = {
                ...formData,
                data: formData.data,
                products: formData.products.map(product => ({
                    // product: product.product,
                    name: product.name,
                    quantity: product.quantity,
                })),
            };

            const res = await axios.post("/api/orders", dataToSend);

            if (res.status === 200) {
                fetchOrders();
                setFormData({
                    orderNumber: "",
                    client: "",
                    products: [],
                    data: "",
                    totalPrice: "",
                    isPaid: "",
                });
                setInputValue('');

                document.getElementById("order_modal").close();
            }
        } catch (error) {
            console.error("Помилка при додаванні замовлення:", error);
        }
    };

    return (
        <div className="py-8">
            <button
                className="btn"
                onClick={() => document.getElementById("order_modal").showModal()}
            >
                Додати замовлення
            </button>
            <dialog id="order_modal" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box p-6 bg-white shadow-xl rounded-md">
                    <h3 className="font-bold text-lg mb-4">Додати замовлення</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="orderNumber"
                            placeholder="Номер замовлення"
                            value={formData.orderNumber}
                            className="input input-bordered w-full"
                            onChange={(e) => setFormData({ ...formData, orderNumber: e.target.value })}
                            required
                        />
                        <div ref={inputRef} className="relative">
                            <input
                                type="text"
                                name="client"
                                placeholder="Назва клієнта"
                                className="input input-bordered w-full"
                                value={inputValue}
                                onChange={handleChange}
                                required
                            />
                            {showDropdown && filteredClients.length > 0 && (
                                <div className="absolute z-10 bg-white w-full border border-gray-300 rounded-b-none rounded-t-md">
                                    {filteredClients.map((client) => (
                                        <div
                                            key={client._id}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleClientSelect(client._id, client.name)}
                                        >
                                            {client.name}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <input
                            type="date"
                            name="data"
                            className="input input-bordered w-full"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            required
                        />

                        {formData.products.map((product, index) => (
                            <div key={index} className="grid grid-cols-3 gap-4">
                                <input
                                    type="text"
                                    placeholder="Назва продукту"
                                    value={product.name}
                                    onChange={(e) => handleProductChange(index, 'name', e.target.value)}
                                    list="productOptions"
                                    className="input input-bordered w-full"
                                />
                                <datalist id="productOptions">
                                    {productOptions.map((option) => (
                                        <option key={option.id} value={option.name} />
                                    ))}
                                </datalist>
                                <input
                                    type="text"
                                    placeholder="Кількість"
                                    value={product.quantity}
                                    onChange={(e) => handleProductChange(index, 'quantity', e.target.value)}
                                    className="input input-bordered w-full"
                                />
                            </div>
                        ))}
                        <button type="button" className="btn btn-outline mr-1" onClick={handleAddProduct}>
                            Додати продукт
                        </button>

                        <button type="button" className="btn btn-outline" onClick={handleCancelProduct}>
                            Скасувати додавання продукту
                        </button>

                        <input
                            type="text"
                            name="totalPrice"
                            placeholder="Загальна ціна"
                            className="input input-bordered w-full mt-4"
                            value={formData.totalPrice}
                            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                            required
                        />

                        <select
                            name="isPaid"
                            className="select select-bordered w-full mt-4"
                            value={formData.isPaid}
                            onChange={(e) => setFormData({ ...formData, isPaid: e.target.value })}
                            required
                        >
                            <option value="">Статус оплати</option>
                            <option value="Paid">Оплачено</option>
                            <option value="NotPaid">Не оплачено</option>
                            <option value="PartlyPaid">Частково оплачено</option>
                        </select>

                        <button type="submit" className="btn btn-primary mt-4">
                            Додати
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default AddOrder;