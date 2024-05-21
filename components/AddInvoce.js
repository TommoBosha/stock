import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

const AddInvoice = ({ fetchInvoice }) => {
    const [formData, setFormData] = useState({
        invoceNumber: "",
        company: "",
        components: [],
        data: "",
        totalPrice: "",
        withVAT: false,
        priceWithoutVAT: "",
        VAT: "",
        totalPriceWithVAT: "",
        discount: false,
        discountValue: "",
    });
    const [companies, setCompanies] = useState([]);
    const [filteredCompanies, setFilteredCompanies] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [showDropdown, setShowDropdown] = useState(false);
    const [componentOptions, setComponentOptions] = useState([]);
    const [ibanOptions, setIbanOptions] = useState({});
    const [selectedIban, setSelectedIban] = useState("");

    const inputRef = useRef(null);

    const fetchCompanies = async () => {
        try {
            const res = await axios.get("/api/companies");
            setCompanies(res.data);
        } catch (error) {
            console.error("Помилка при отриманні списку компаній:", error);
        }
    };

    const fetchComponents = async () => {
        try {
            const res = await axios.get("/api/components");
            setComponentOptions(res.data.map(component => component.name));
        } catch (error) {
            console.error("Помилка при отриманні списку компонентів:", error);
        }
    };

    useEffect(() => {
        fetchCompanies();
        fetchComponents();
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

    useEffect(() => {
        const fetchCompanyIbans = async (companyName) => {
            try {
                const res = await axios.get(`/api/companies?company=${encodeURIComponent(companyName)}&ibans=true`);
                const ibans = res.data.reduce((acc, company) => {
                    if (company.requisites && company.requisites.length > 0) {
                        const companyIbans = company.requisites.map(requisite => requisite.IBAN);
                        acc[company._id] = companyIbans;
                    }
                    return acc;
                }, {});
                setIbanOptions(ibans);

                if (ibans[formData.company] && ibans[formData.company].length > 0) {
                    setSelectedIban(ibans[formData.company][0]);
                }
            } catch (error) {
                console.error("Помилка при отриманні списку IBAN компанії:", error);
            }
        };

        if (formData.company) {
            fetchCompanyIbans(formData.company);
        }
    }, [formData.company]);

    const handleIbanChange = (e) => {
        setSelectedIban(e.target.value);
        setFormData(prevState => ({
            ...prevState,
            IBAN: e.target.value
        }));
    };

    const handleChange = (e) => {
        setInputValue(e.target.value);
        filterCompanies(e.target.value);
        setShowDropdown(true);
    };

    const filterCompanies = (value) => {
        const filtered = companies.filter((company) =>
            company.name.toLowerCase().includes(value.toLowerCase())
        );
        setFilteredCompanies(filtered);
    };

    const handleCompanySelect = (companyId, companyName, companyIBAN) => {
        setInputValue(companyName);

        const updatedCompanies = Array.isArray(formData.companies) ? [...formData.companies] : [];

        const companyIndex = updatedCompanies.findIndex(company => company._id === companyId);

        if (companyIndex === -1) {
            updatedCompanies.push({ _id: companyId, name: companyName });
        }

        setFormData(prevState => ({
            ...prevState,
            companies: updatedCompanies
        }));

        setFormData(prevState => ({
            ...prevState,
            company: companyId
        }));

        setShowDropdown(false);

        const updatedComponents = formData.components.map(component => ({
            ...component,
            unitPrice: "",
            quantity: "",
            totalPrice: ""
        }));
        setFormData(prevState => ({
            ...prevState,
            components: updatedComponents
        }));
    };

    const handleAddComponent = () => {
        const newComponent = {
            name: "",
            quantity: "",
            unitPrice: "",
            totalPrice: "",
        };
        setFormData({ ...formData, components: [...formData.components, newComponent] });
    };

    const handleCancelComponent = () => {
        const updatedComponents = [...formData.components];
        updatedComponents.pop();
        setFormData({ ...formData, components: updatedComponents });
    };

    const handleComponentChange = (index, field, value) => {
        const updatedComponents = [...formData.components];
        updatedComponents[index][field] = value;

        if (field === 'quantity' || field === 'unitPrice') {
            const quantity = parseFloat(updatedComponents[index]['quantity']) || 0;
            const unitPrice = parseFloat(updatedComponents[index]['unitPrice']) || 0;
            updatedComponents[index]['totalPrice'] = (quantity * unitPrice).toFixed(2);
        }

        setFormData({ ...formData, components: updatedComponents });
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            const selectedCompany = companies.find((company) => company._id === formData.company);
            if (!selectedCompany) {
                console.error("Компанія не знайдена");
                return;
            }

            const dataToSend = {
                ...formData,
                company: selectedCompany._id,
                components: formData.components.map(component => ({
                    name: component.name,
                    quantity: component.quantity,
                    unitPrice: component.unitPrice,
                    totalPrice: component.totalPrice,
                })),
                ...(formData.discount ? { discount: formData.discount, discountValue: formData.discountValue } : {}),
            };

            if (!formData.withVAT) {
                delete dataToSend.totalPriceWithVAT;
                delete dataToSend.VAT;
                delete dataToSend.priceWithoutVAT;
            }


            const res = await axios.post("/api/invoices", dataToSend);

            if (res.status === 200) {

                fetchInvoice();

                fetchComponents();

                setFormData({
                    invoceNumber: "",
                    company: "",
                    components: [],
                    data: "",
                    totalPrice: "",
                    withVAT: false,
                    priceWithoutVAT: "",
                    VAT: "",
                    totalPriceWithVAT: "",
                    discount: false,
                    discountValue: "",
                });
                setInputValue('');

                document.getElementById("my_modal_5").close();
            }
        } catch (error) {
            console.error("Помилка при додаванні накладної:", error);
        }
    };

    return (
        <div className="py-8">
            <button
                className="btn"
                onClick={() => document.getElementById("my_modal_5").showModal()}
            >
                Додати накладну
            </button>
            <dialog id="my_modal_5" className="modal modal-bottom sm:modal-middle">
                <div className="modal-box p-6 bg-white shadow-xl rounded-md">
                    <h3 className="font-bold text-lg mb-4">Додати накладну</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            name="invoceNumber"
                            placeholder="Номер накладної"
                            value={formData.invoceNumber}
                            className="input input-bordered w-full"
                            onChange={(e) => setFormData({ ...formData, invoceNumber: e.target.value })}
                            required
                        />
                        <div ref={inputRef} className="relative">
                            <input
                                type="text"
                                name="company"
                                placeholder="Назва компанії"
                                className="input input-bordered w-full"
                                value={inputValue}
                                onChange={handleChange}
                                required
                            />
                            {showDropdown && filteredCompanies.length > 0 && (
                                <div className="absolute z-10 bg-white w-full border border-gray-300 rounded-b-none rounded-t-md">
                                    {filteredCompanies.map((company) => (
                                        <div
                                            key={company._id}
                                            className="p-2 cursor-pointer hover:bg-gray-100"
                                            onClick={() => handleCompanySelect(company._id, company.name)}
                                        >
                                            {company.name}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {ibanOptions[formData.company] && (
                                <select value={selectedIban} onChange={handleIbanChange} className="input input-bordered w-full mt-2">
                                    <option value="">Виберіть IBAN</option>
                                    {ibanOptions[formData.company].map((iban, index) => (
                                        <option key={index} value={iban}>{iban}</option>
                                    ))}
                                </select>
                            )}
                        </div>
                        <input
                            type="date"
                            name="data"
                            placeholder="Дата"
                            className="input input-bordered w-full"
                            value={formData.data}
                            onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                            required
                        />

                        {formData.components.map((component, index) => (
                            <div key={index} className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    placeholder="Назва компоненту"
                                    value={component.name}
                                    onChange={(e) => handleComponentChange(index, 'name', e.target.value)}
                                    list="componentOptions"
                                    className="input input-bordered w-full col-span-2"
                                />
                                <datalist id="componentOptions">
                                    {componentOptions.map((option, idx) => (
                                        <option key={idx} value={option} />
                                    ))}
                                </datalist>
                                <input
                                    type="text"
                                    placeholder="Кількість"
                                    value={component.quantity}
                                    onChange={(e) => handleComponentChange(index, 'quantity', e.target.value)}
                                    className="input input-bordered w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Ціна за одиницю"
                                    value={component.unitPrice}
                                    onChange={(e) => handleComponentChange(index, 'unitPrice', e.target.value)}
                                    className="input input-bordered w-full"
                                />
                                <input
                                    type="text"
                                    placeholder="Загальна ціна"
                                    value={component.totalPrice}
                                    onChange={(e) => handleComponentChange(index, 'totalPrice', e.target.value)}
                                    className="input input-bordered w-full col-span-2"
                                />
                            </div>
                        ))}
                        <button type="button" className="btn btn-outline mr-1" onClick={handleAddComponent}>
                            Додати компонент
                        </button>

                        <button type="button" className="btn btn-outline" onClick={handleCancelComponent}>
                            Скасувати додавання компонента
                        </button>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-start">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="withVAT"
                                        checked={formData.withVAT}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setFormData(prevState => ({
                                                ...prevState,
                                                withVAT: isChecked,
                                                ...(isChecked ? {} : {
                                                    priceWithoutVAT: "",
                                                    VAT: "",
                                                    totalPriceWithVAT: ""
                                                })
                                            }));
                                        }}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700">З ПДВ</span>
                                </div>
                                {formData.withVAT && (
                                    <div className="mt-2 w-full">
                                        <input
                                            type="text"
                                            name="priceWithoutVAT"
                                            placeholder="Ціна без ПДВ"
                                            className="input input-bordered w-full"
                                            value={formData.priceWithoutVAT}
                                            onChange={(e) => setFormData({ ...formData, priceWithoutVAT: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            name="VAT"
                                            placeholder="ПДВ"
                                            className="input input-bordered w-full mt-2"
                                            value={formData.VAT}
                                            onChange={(e) => setFormData({ ...formData, VAT: e.target.value })}
                                        />
                                        <input
                                            type="text"
                                            name="totalPriceWithVAT"
                                            placeholder="Стоимость с ПДВ"
                                            className="input input-bordered w-full mt-2"
                                            value={formData.totalPriceWithVAT}
                                            onChange={(e) => setFormData({ ...formData, totalPriceWithVAT: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col items-start">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        name="discount"
                                        checked={formData.discount}
                                        onChange={(e) => {
                                            const isChecked = e.target.checked;
                                            setFormData(prevState => ({
                                                ...prevState,
                                                discount: isChecked,
                                                ...(isChecked ? {} : { discountValue: "" })
                                            }));
                                        }}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                    <span className="ml-2 text-gray-700">Знижка</span>
                                </div>
                                {formData.discount && (
                                    <div className="mt-2 w-full">
                                        <input
                                            type="text"
                                            name="discountValue"
                                            placeholder="Знижка"
                                            className="input input-bordered w-full"
                                            value={formData.discountValue}
                                            onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        <input
                            type="text"
                            name="totalPrice"
                            placeholder="Загальна вартість"
                            className="input input-bordered w-full mt-4"
                            value={formData.totalPrice}
                            onChange={(e) => setFormData({ ...formData, totalPrice: e.target.value })}
                            required
                        />

                        <button type="submit" className="btn btn-primary mt-4">
                            Додати
                        </button>
                    </form>
                </div>
            </dialog>
        </div>
    );
};

export default AddInvoice;
