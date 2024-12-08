/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */


import React, { useEffect, useState } from 'react';
import { withSwal } from "react-sweetalert2";
import Pagination from './Pagination';
import Link from 'next/link';

const ProductTable = ({ products, onUpdate, swal, fetchProducts }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [productsPerPage] = useState(10);
    const [isLoading, setIsLoading] = useState(true); 

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            await fetchProducts(); 
            setIsLoading(false);
        };

        fetchData();
    }, []);

    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const handleDelete = (productId) => {
        swal.fire({
            title: "Ви впевнені?",
            text: `Ви хочете видалити виріб?`,
            showCancelButton: true,
            cancelButtonText: "Скасувати",
            confirmButtonText: "Так, видалити!",
            confirmButtonColor: "#d55",
            reverseButtons: true,
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await fetch(`/api/products?id=${productId}`, {
                        method: "DELETE",
                    });

                    if (response.ok) {
                        onUpdate(products.filter(prod => prod._id !== productId));
                        await fetchProducts();
                        swal.fire("Успішно", "Виріб видалено", "success");
                    } else {
                        console.error("Помилка при видаленні виробу");
                        swal.fire("Помилка", "Помилка при видаленні виробу", "error");
                    }
                } catch (error) {
                    console.error("Помилка при видаленні виробу:", error);
                    swal.fire("Помилка", "Помилка при видаленні виробу", "error");
                }
            }
        });
    };

    if (isLoading) {
        return <div>Завантаження...</div>; 
    }

    return (
        <div className="overflow-x-auto">
            <table className="table">
                <thead>
                    <tr>
                        <th>Зображення</th>
                        <th>Назва</th>
                        <th>Ціна компонентів</th>
                        <th>Ціна зборки</th>
                        <th>Ціна реалізації</th>
                        <th>Термін виготовлення</th>
                        <th>Дії</th>
                    </tr>
                </thead>
                <tbody>
                    {currentProducts.map((product) => (
                        <tr key={product._id}>
                            <td>
                                <img
                                    src={product.images || 'https://via.placeholder.com/150'}
                                    alt="Product"
                                    style={{ width: '100px' }}
                                />
                            </td>
                            <td>
                            <Link href={`/products/${product._id}`}>
                                {product.name}
                                </Link>
                                </td>
                                
                            <td>
                                {product.components
                                    .reduce((total, component) => total + (component.totalPrice || 0), 0)
                                    .toFixed(2)}
                            </td>
                            <td>{product.assemblyPrice}</td>
                            <td>{product.salePrice}</td>
                            <td>{product.manufacturingTime}</td>
                            <td className="flex gap-2">
                                <button
                                    className="btn-primary"
                                    onClick={() => (window.location.href = `/products/edit/${product._id}`)}
                                >
                                    Редагувати
                                </button>
                                <button
                                    className="btn-primary"
                                    onClick={() => handleDelete(product._id)}
                                >
                                    Видалити
                                </button>
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

export default withSwal(ProductTable);
