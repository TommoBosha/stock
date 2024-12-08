import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import InventoryTable from "@/components/InventoryTable";
import AddInventoryModal from "@/components/AddInventoryModal";
import axios from "axios";

const InventoryPage = () => {
    const [items, setItems] = useState([]);

    const fetchItems = async () => {
        try {
            const res = await axios.get("/api/inventory");
            setItems(res.data);
        } catch (error) {
            console.error("Помилка завантаження інвентарю:", error);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    return (
        <Layout>
            <div className="flex flex-col mb-6">
                <h1 className="text-2xl font-bold">Інвентаризація</h1>
                <AddInventoryModal onItemAdded={fetchItems} />
            </div>
            <InventoryTable items={items} onUpdate={fetchItems} />
        </Layout>
    );
};

export default InventoryPage;
