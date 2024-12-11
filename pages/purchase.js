import React, { useEffect, useState } from "react";
import ComponentTable from "@/components/ComponentTable";
import Spinner from "@/components/Spinner";
import Layout from "@/components/Layout";

const PurchasePage = () => {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLowStockComponents = async () => {
      try {
        const response = await fetch(`/api/components?lowStock=true`);
        const data = await response.json();
        setComponents(data);
      } catch (error) {
        console.error("Помилка при завантаженні комплектуючих:", error);
      }
      setLoading(false);
    };

    fetchLowStockComponents();
  }, []);

  if (loading) {
    return <Spinner />;
  }

  return (
    <Layout>
    <div>
      <h1 className="text-2xl font-bold mb-4">Закупівлі</h1>
      {components.length > 0 ? (
        <ComponentTable 
        components={components} 
        companies={[]} // Передаем пустой массив
        onUpdate={(updatedComponent) => {
            setComponents((prev) => prev.map((c) =>
                c._id === updatedComponent._id ? updatedComponent : c
            ));
        }} 
    />
      ) : (
        <p>Усі комплектуючі в достатній кількості.</p>
      )}
    </div>
    </Layout>
  );
};

export default PurchasePage;
