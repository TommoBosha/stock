import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const EditInvoice = ({ invoice, onUpdate, onCancel }) => {
    const [invoceNumber, setInvoiceNumber] = useState(invoice.invoceNumber);
    const [setCompany] = useState(invoice.company.name);
    const [components, setComponents] = useState(invoice.components);
    const [data, setData] = useState(new Date(invoice.data));
    const [totalPrice, setTotalPrice] = useState(invoice.totalPrice);
    const [withVAT, setWithVAT] = useState(invoice.withVAT);
    const [priceWithoutVAT, setPriceWithoutVAT] = useState(invoice.priceWithoutVAT);
    const [VAT, setVAT] = useState(invoice.VAT);
    const [totalPriceWithVAT, setTotalPriceWithVAT] = useState(invoice.totalPriceWithVAT);
    const [discount, setDiscount] = useState(invoice.discount);
    const [discountValue, setDiscountValue] = useState(invoice.discountValue);
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState(invoice.company);
    const [allComponents, setAllComponents] = useState([]);

    useEffect(() => {
        async function fetchCompanies() {
            try {
                const response = await axios.get('/api/companies');
                setCompanies(response.data);
            } catch (error) {
                console.error("Error fetching companies:", error);
            }
        }

        async function fetchComponents() {
            try {
                const response = await axios.get('/api/components');
                setAllComponents(response.data);
            } catch (error) {
                console.error("Error fetching components:", error);
            }
        }

        fetchCompanies();
        fetchComponents();
    }, []);

    const handleCompanyChange = (value) => {
        const company = companies.find((c) => c.name.toLowerCase() === value.toLowerCase());
        if (company) {
            setSelectedCompany(company);
        } else {
            setSelectedCompany({ name: value });
        }
        setCompany(value);
        if (value) {
            const filtered = companies.filter((c) => c.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredCompanies(filtered);
        } else {
            setFilteredCompanies([]);
        }
    };

    const handleCompanySelect = (company) => {
        setCompany(company.name);
        setSelectedCompany(company);
        setFilteredCompanies([]);
    };

    const handleComponentChange = (index, field, value) => {
        const newComponents = [...components];
        newComponents[index][field] = value;
        setComponents(newComponents);
    };

    const handleComponentNameChange = (index, value) => {
        const newComponents = components.map((component, i) => {
            if (i === index) {
                return { ...component, name: value };
            }
            return component;
        });
        setComponents(newComponents);
    };

    const getFilteredComponents = (name) => {
        return allComponents.filter(c => c.name.toLowerCase().includes(name.toLowerCase()));
    };

    const handleSave = async () => {
        try {
            const updatedInvoice = {
                _id: invoice._id,
                invoceNumber,
                company: selectedCompany,
                components,
                data,
                totalPrice,
                withVAT,
                priceWithoutVAT,
                VAT,
                totalPriceWithVAT,
                discount,
                discountValue,
            };
            const response = await axios.put('/api/invoices', updatedInvoice);
            if (response.status === 200) {
                onUpdate();
            } else {
                console.error("Failed to update invoice:", response);
            }
        } catch (error) {
            console.error("Error saving invoice:", error);
        }
    };

    const addNewComponent = () => {
        const newComponent = {
            name: '',
            quantity: 0,
            unitPrice: 0
        };
        setComponents([...components, newComponent]);
    };

    const removeComponent = (index) => {
        setComponents(components.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-4xl mx-auto my-4 p-5 bg-white shadow-md rounded-lg">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Редагувати накладну</h2>
            <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="invoiceNumber">
                    Номер накладної
                </label>
                <input
                    type="text"
                    id="invoiceNumber"
                    value={invoceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Номер накладної"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
            </div>

            <div className="relative mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="company">
                    Компанія
                </label>
                <input
                    type="text"
                    id="company"
                    value={selectedCompany.name}
                    onChange={(e) => handleCompanyChange(e.target.value)}
                    placeholder="Компанія"
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {filteredCompanies.length > 0 && (
                    <ul className="absolute w-full bg-white shadow-md z-10">
                        {filteredCompanies.map((c, index) => (
                            <li
                                key={index}
                                onClick={() => handleCompanySelect(c)}
                                className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                            >
                                {c.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {components.map((component, index) => (
                <div key={index} className="mb-4 bg-gray-50 p-3 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Назва компонента
                            </label>
                            <input
                                type="text"
                                value={component.name}
                                onChange={e => handleComponentNameChange(index, e.target.value)}
                                placeholder="Назва компонента"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                list={`component-suggestions-${index}`}
                            />
                            <datalist id={`component-suggestions-${index}`}>
                                {getFilteredComponents(component.name).map(c => (
                                    <option key={c._id} value={c.name} />
                                ))}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Кількість
                            </label>
                            <input
                                type="number"
                                value={component.quantity}
                                onChange={e => handleComponentChange(index, 'quantity', e.target.value)}
                                placeholder="Кількість"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 text-sm font-bold mb-2">
                                Ціна за одиницю
                            </label>
                            <input
                                type="number"
                                value={component.unitPrice}
                                onChange={e => handleComponentChange(index, 'unitPrice', e.target.value)}
                                placeholder="Ціна за одиницю"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    </div>
                    <div className="mt-2">
                        <button
                            onClick={() => removeComponent(index)}
                            className=" btn-delete"
                        >
                            Видалити
                        </button>
                    </div>
                </div>
            ))}


            <button
                onClick={addNewComponent}
                className=" btn-primary ml-3 mr-8"
            >
                Додати компонент
            </button>

            <DatePicker className="my-4" selected={data} onChange={date => setData(date)} />



            <div className="flex flex-wrap mb-4">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0 flex flex-col">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            checked={withVAT}
                            onChange={(e) => setWithVAT(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-gray-600"
                        />
                        <label className="ml-2 text-gray-700 text-sm mt-1">
                            З ПДВ
                        </label>
                    </div>
                    {withVAT && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={priceWithoutVAT}
                                onChange={(e) => setPriceWithoutVAT(e.target.value)}
                                placeholder="Ціна без ПДВ"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                            <input
                                type="text"
                                value={VAT}
                                onChange={(e) => setVAT(e.target.value)}
                                placeholder="ПДВ"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                            />
                            <input
                                type="text"
                                value={totalPriceWithVAT}
                                onChange={(e) => setTotalPriceWithVAT(e.target.value)}
                                placeholder="Загальна сума з ПДВ"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline mt-2"
                            />
                        </div>
                    )}
                </div>

                <div className="w-full md:w-1/2 px-3 flex flex-col">
                    <div className="form-check">
                        <input
                            type="checkbox"
                            checked={discount}
                            onChange={(e) => setDiscount(e.target.checked)}
                            className="form-checkbox h-5 w-5 text-gray-600"
                        />
                        <label className="ml-2 text-gray-700 text-sm mt-1">
                            Знижка
                        </label>
                    </div>
                    {discount && (
                        <div className="mt-2">
                            <input
                                type="text"
                                value={discountValue}
                                onChange={(e) => setDiscountValue(e.target.value)}
                                placeholder="Знижка"
                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            />
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-wrap -mx-3 mb-2">
                <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                    <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="totalPrice">
                        Загальна сума
                    </label>
                    <input
                        type="text"
                        id="totalPrice"
                        value={totalPrice}
                        onChange={(e) => setTotalPrice(e.target.value)}
                        placeholder="Загальна сума"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                </div>
            </div>

            <div className='mt-4 flex flex-row justify-center gap-4'>
                <button className=" btn-save" onClick={handleSave}>Зберегти</button>
                <button className=" btn-default" onClick={onCancel}>Скасувати</button>
            </div>
        </div>
    );
};

export default EditInvoice;