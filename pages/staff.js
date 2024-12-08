import React, { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import StaffCards from "@/components/StaffCards";
import AddStaffModal from "@/components/AddStaffModal";
import axios from "axios";

const StaffPage = () => {
    const [staff, setStaff] = useState([]);
    const [tools, setTools] = useState([]);

    const fetchStaff = async () => {
        try {
            const res = await axios.get("/api/staff");
            setStaff(res.data);
        } catch (error) {
            console.error("Ошибка загрузки сотрудников:", error);
        }
    };

    const fetchTools = async () => {
        try {
            const res = await axios.get("/api/inventory");
            setTools(res.data);
        } catch (error) {
            console.error("Ошибка загрузки инструментов:", error);
        }
    };

    useEffect(() => {
        fetchStaff();
        fetchTools();
    }, []);

    return (
        <Layout>
            <div className="flex flex-col mb-6">
                <h1 className="text-2xl font-bold">Персонал</h1>
                <AddStaffModal tools={tools} onStaffAdded={fetchStaff} />
            </div>
            <StaffCards staff={staff} tools={tools} onUpdate={fetchStaff} />
        </Layout>
    );
};

export default StaffPage;

