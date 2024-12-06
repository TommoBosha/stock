import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import AddTechnologicalItem from '@/components/AddTechnologicalItem';
import TechnologicalTable from '@/components/TechnologicalTable';
import axios from 'axios';

const TechnologicalPage = () => {
    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        const res = await axios.get('/api/technological');
        setItems(res.data);
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <Layout>
            <AddTechnologicalItem fetchItems={fetchItems} />
            <TechnologicalTable items={items} fetchItems={fetchItems} />
        </Layout>
    );
};

export default TechnologicalPage;