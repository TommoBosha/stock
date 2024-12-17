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
        comment: "",
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
            setProductOptions(
                res.data.map(product => ({
                    id: product._id,
                    name: product.name,
                    salePrice: product.salePrice,
                }))
            );
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
            salePrice: '',
        };
        setFormData({ ...formData, products: [...formData.products, newProduct] });
    };

    const handleCancelProduct = () => {
        const updatedProducts = [...formData.products];
        updatedProducts.pop();
        setFormData({ ...formData, products: updatedProducts });
    };

    const handleProductChange = (index, field, value) => {
        const updatedProducts = [...formData.products];
        updatedProducts[index][field] = value;

        if (field === 'name') {
            const selectedProduct = productOptions.find((product) => product.name === value);
            if (selectedProduct) {
                updatedProducts[index].product = selectedProduct.id;
                updatedProducts[index].salePrice = selectedProduct.salePrice;
            }
        }

        setFormData({ ...formData, products: updatedProducts });
    };

    useEffect(() => {
        const calculateTotalPrice = () => {
            const total = formData.products.reduce((sum, product) => {
                const price = parseFloat(product.salePrice) || 0;
                const quantity = parseInt(product.quantity, 10) || 0;
                return sum + price * quantity;
            }, 0);
            setFormData((prevState) => ({ ...prevState, totalPrice: total.toFixed(2) }));
        };

        calculateTotalPrice();
    }, [formData.products]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const dataToSend = {
                ...formData,
                data: formData.data,
                products: formData.products.map(product => ({
                    product: product.product,
                    name: product.name,
                    quantity: product.quantity,
                    salePrice: product.salePrice,
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
                    comment: "",
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
                className="btn btn-accent"
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
                            <div key={index} className="grid grid-cols-1  gap-4">
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
                                <input
                                    type="text"
                                    placeholder="Ціна реалізації"
                                    value={product.salePrice || ""}
                                    onChange={(e) => handleProductChange(index, 'salePrice', e.target.value)}
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

                        <textarea
                            name="comment"
                            placeholder="Коментар"
                            className="textarea textarea-bordered w-full mt-4"
                            value={formData.comment}
                            onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        />

                        <input
                            type="text"
                            name="totalPrice"
                            placeholder="Загальна ціна"
                            className="input input-bordered w-full mt-4"
                            value={formData.totalPrice}
                            readOnly
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