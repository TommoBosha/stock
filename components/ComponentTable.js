/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import React, { useState } from "react";
import Pagination from "./Pagination";
import Spinner from "./Spinner";

const defaultImage =
    "https://res.cloudinary.com/dzu849usg/image/upload/v1714332733/33-154-prokladka-98347104279697_drjc2p.webp";

const ComponentTable = ({ components, onUpdate, companies }) => {
    const [editingComponentId, setEditingComponentId] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        unitPrice: "",
        quantity: "",
        images: "",
    });
    const [imagesLoading, setImagesLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [componentsPerPage] = useState(10);

    const handleEdit = (component) => {
        setEditingComponentId(component._id);
        setFormData({
            name: component.name,
            unitPrice: component.unitPrice,
            quantity: component.quantity,
            images: component.images || defaultImage,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleImagesChange = async (e) => {
        setImagesLoading(true);

        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });
            const data = await response.json();

            if (data.links && data.links.length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    images: data.links[0],
                }));
            } else {
                console.error(
                    "Помилка при завантаженні зображення: немає даних у відповіді"
                );
            }
        } catch (error) {
            console.error("Помилка при завантаженні зображення:", error);
        }

        setImagesLoading(false);
    };


    const handleUpdate = async (component) => {
        try {
            const updatedComponent = await fetch(`/api/components`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, _id: component._id }),
            }).then((res) => res.json());
            onUpdate(updatedComponent);
            setEditingComponentId(null);
        } catch (error) {
            console.error("Error updating component:", error);
        }
    };

    const getCompaniesForComponent = (componentCompanyIds) => {
        return (
            <ul className="flex flex-col gap-2">
                {componentCompanyIds.map(companyId => {
                    const company = companies.find(company => company._id === companyId);
                    if (company) {
                        return (
                            <li key={company._id}>
                                <Link href={`/companies/` + company._id}>
                                    {company.name}
                                </Link>
                            </li>
                        );
                    }
                    return null;
                })}
            </ul>
        );
    };

    const indexOfLastComponent = currentPage * componentsPerPage;
    const indexOfFirstComponent = indexOfLastComponent - componentsPerPage;
    const currentComponents = components.slice(indexOfFirstComponent, indexOfLastComponent);

    const paginate = pageNumber => setCurrentPage(pageNumber);
    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Зображення</th>
                        <th>Назва</th>
                        <th>Ціна</th>
                        <th>Кількість на складі</th>
                        <th>Компанії постачальники</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {currentComponents.map((component) => (
                        <tr key={component._id} className="hover">
                            <td>
                                {editingComponentId === component._id ? (
                                    <div>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImagesChange}
                                        />
                                        {imagesLoading && <Spinner />}
                                    </div>

                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-40 h-40">
                                                <img
                                                    src={component.images || defaultImage}
                                                    alt={component.name}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td>
                                {editingComponentId === component._id ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    <Link href={`/components/${component._id}`}>
                                        {component.name}
                                    </Link>
                                )}
                            </td>
                            <td>
                                {editingComponentId === component._id ? (
                                    <input
                                        type="text"
                                        name="unitPrice"
                                        value={formData.unitPrice}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    component.unitPrice + "грн."
                                )}
                            </td>
                            <td>
                                {editingComponentId === component._id ? (
                                    <input
                                        type="text"
                                        name="quantity"
                                        value={formData.quantity}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    component.quantity
                                )}
                            </td>
                            <td>
                                {getCompaniesForComponent(component.company)}
                            </td>

                            <td>
                                {editingComponentId === component._id ? (
                                    <button
                                        className="btn-primary mr-1"
                                        onClick={() => handleUpdate(component)}
                                    >
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
                                ) : (
                                    <button
                                        className="btn-primary mr-1"
                                        onClick={() => handleEdit(component)}
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
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                invoicesPerPage={componentsPerPage}
                totalInvoices={components.length}
                paginate={paginate}
                currentPage={currentPage}
            />
        </div>

    );
};

export default ComponentTable;
