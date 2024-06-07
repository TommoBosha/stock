/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from 'react';
import Pagination from './Pagination';
import { withSwal } from "react-sweetalert2";
import EditProduct from './EditProduct';

const ProductTable = ({ products, onUpdate, swal, fetchCompany }) => {
    const [editingProduct, setEditingProduct] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(7);

    useEffect(() => {
        fetchCompany();
    }, []);

    const handleEdit = (product) => {
        setEditingProduct(product);
    };

    const handleCancelEdit = () => {
        setEditingProduct(null);
    };

    const handleUpdate = (updatedProduct) => {
        const updatedProducts = products.map(p => p._id === updatedProduct._id ? updatedProduct : p);
        onUpdate(updatedProducts);
        handleCancelEdit();
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
                        fetchCompany();
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

    if (editingProduct) {
        return (
            <EditProduct
                product={editingProduct}
                onUpdate={handleUpdate}
                onCancel={handleCancelEdit}
                fetchCompany={fetchCompany}
            />
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Зображення</th>
                        <th>Назва</th>
                        <th>Компоненти</th>
                        <th>Послуги посередництва</th>
                        <th>Ціна за зборку</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.map((product) => (
                        <tr key={product._id}>
                            <td><img src={product.images || 'https://via.placeholder.com/150'} alt="Product" style={{ width: '100px' }} /></td>
                            <td>{product.name}</td>
                            <td>{product.components.map((component, index) =>
                                <div className='mb-2 border-b' key={index}>
                                    <p><span className="font-bold " >Назва:</span> {component.name}&nbsp;&nbsp;</p>
                                    <p><span className="font-bold " >Кількість:</span> {component.quantity}&nbsp;&nbsp;</p>
                                </div>)}</td>
                            <td>{product.agent}</td>
                            <td>{product.assemblyPrice}</td>
                            <td className=" flex gap-2">
                                <button className="btn-primary" onClick={() => handleEdit(product)}>
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
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Pagination
                productsPerPage={productsPerPage}
                totalProducts={products.length}
                paginate={paginate}
                currentPage={currentPage}
            />
        </div>
    );
};

export default withSwal(ProductTable);