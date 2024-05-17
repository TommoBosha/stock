/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import EditComponents from './EditComponents';
import Spinner from './Spinner';
import Pagination from './Pagination';
import { withSwal } from "react-sweetalert2";

const defaultImage = 'https://res.cloudinary.com/dzu849usg/image/upload/v1714332733/33-154-prokladka-98347104279697_drjc2p.webp';

const ProductTable = ({ products, onUpdate, swal, fetchCompany }) => {
    const [editingProductId, setEditingProductId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        components: [],
        agent: '',
        assemblyPrice: '',
        images: '',
    });
    const [imagesLoading, setImagesLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(7);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    const handleEdit = (product) => {
        setEditingProductId(product._id);
        setFormData({
            name: product.name,
            components: product.components,
            agent: product.agent,
            assemblyPrice: product.assemblyPrice,
            images: product.images || defaultImage,
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value,
        }));
    };

    const handleImageChange = async (e) => {
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
                console.error("Помилка при завантаженні зображення: немає даних у відповіді");
            }
        } catch (error) {
            console.error("Помилка при завантаженні зображення:", error);
        }
        setImagesLoading(false);
    };

    const handleUpdate = async (product) => {
        try {
            const updatedProduct = await fetch(`/api/products`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ ...formData, _id: product._id }),
            }).then((res) => res.json());
            onUpdate(updatedProduct);
            setEditingProductId(null);
        } catch (error) {
            console.error("Error updating product:", error);
        }
    };

    const handleDelete = (product) => {
        swal.fire({
            title: "Ви впевнені",
            text: `Ви хочете видалити продукт?`,
            showCancelButton: true,
            cancelButtonText: "Скасувати",
            confirmButtonText: "Так, видалити!",
            confirmButtonColor: "#d55",
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/products?id=${product}`, {
                        method: "DELETE",
                    });

                    if (response.ok) {

                        onUpdate(products.filter(prod => prod._id !== product._id));
                        swal.fire("Успішно", "Продукт видалено", "success");
                    } else {
                        console.error("Помилка при видаленні продукту");
                        swal.fire("Помилка", "Помилка при видаленні продукту", "error");
                    }
                } catch (error) {
                    console.error("Помилка при видаленні продукту:", error);
                    swal.fire("Помилка", "Помилка при видаленні продукту", "error");
                }
            }
        });
    };

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Зображення</th>
                        <th>Ім&apos;я виробу</th>
                        <th>Комплектуючі</th>
                        <th>Послуги посередництва</th>
                        <th>Ціна за зборку</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.map((product) => (
                        <tr key={product._id} className="hover">
                            <td>
                                {editingProductId === product._id ? (
                                    <div>
                                        <input
                                            type="file"
                                            onChange={handleImageChange}
                                            accept="image/*"
                                        />
                                        {imagesLoading && <Spinner />}
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-3">
                                        <div className="avatar">
                                            <div className="mask mask-squircle w-40 h-40">
                                                <img src={product.images || defaultImage} alt={product.images} />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </td>
                            <td>
                                {editingProductId === product._id ? (
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    product.name
                                )}
                            </td>
                            <td>
                                {editingProductId === product._id ? (
                                    <EditComponents
                                        components={product.components}
                                        onUpdate={(updatedComponents) =>
                                            setFormData((prevFormData) => ({
                                                ...prevFormData,
                                                components: updatedComponents,
                                            }))
                                        }
                                    />
                                ) : (
                                    <ul className={`grid ${product.components.length > 1 ? 'grid-cols-2' : ''} gap-4`}>
                                        {product.components.map((component, index) => (
                                            <li key={index}>
                                                <p><span className="font-bold " >Назва:</span> {component.name}&nbsp;&nbsp;</p>
                                                <p><span className="font-bold " >Кількість:</span> {component.quantity}&nbsp;&nbsp;</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </td>
                            <td>
                                {editingProductId === product._id ? (
                                    <input
                                        type="text"
                                        name="agent"
                                        value={formData.agent}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    product.agent
                                )}
                            </td>
                            <td>
                                {editingProductId === product._id ? (
                                    <input
                                        type="text"
                                        name="assemblyPrice"
                                        value={formData.assemblyPrice}
                                        onChange={handleInputChange}
                                    />
                                ) : (
                                    product.assemblyPrice
                                )}
                            </td>
                            <td className=" grid grid-flow-col">
                                {editingProductId === product._id ? (
                                    <button
                                        className="btn-primary mr-1"
                                        onClick={() => handleUpdate(product)}
                                    >
                                        Зберегти
                                    </button>
                                ) : (
                                    <>
                                        <button
                                            className="btn-primary mr-1"
                                            onClick={() => handleEdit(product)}
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
                                            className="btn-primary mr-1"
                                            onClick={() => handleDelete(product._id)}
                                        >
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
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                invoicesPerPage={productsPerPage}
                totalInvoices={products.length}
                paginate={paginate}
                currentPage={currentPage}
            />
        </div>
    );
};

export default withSwal(ProductTable)