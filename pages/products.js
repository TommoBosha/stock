import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AddProduct from '@/components/AddProduct';
import axios from 'axios';
import ProductTable from '@/components/ProductTable';

const Products = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        fetchCompany();
    }, []);

    function fetchCompany() {
        axios.get("/api/products").then((result) => {
            setProducts(result.data);
        });
    }

    const updateProducts = (updatedProduct) => {
        const updatedProducts = products.map((product) =>
            product._id === updatedProduct._id ? updatedProduct : product
        );
        setProducts(updatedProducts);
    };

    return (
        <Layout>
            <AddProduct fetchCompany={fetchCompany} updateProducts={updateProducts} />
            <ProductTable fetchCompany={fetchCompany} products={products} onUpdate={updateProducts} />
        </Layout>
    );
};

export default Products;