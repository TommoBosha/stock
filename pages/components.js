import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ComponentTable from '@/components/ComponentTable';

const ComponentsPage = () => {
  const [components, setComponents] = useState([]);
  const [companies, setCompanies] = useState([]);


  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const componentsData = await fetch('/api/components').then((res) => res.json());
        const companiesData = await fetch('/api/companies').then((res) => res.json());
        setComponents(componentsData);
        console.log(companiesData)
        setCompanies(companiesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchComponents();
  }, []);

  const handleComponentUpdate = (updatedComponent) => {
    setComponents((prevComponents) =>
      prevComponents.map((comp) =>
        comp._id === updatedComponent._id ? updatedComponent : comp
      )
    );
  };

  return (
    <Layout>
      <h1>Комплектуючі</h1>
      <ComponentTable components={components} companies={companies} onUpdate={handleComponentUpdate} />
    </Layout>
  );
};

export default ComponentsPage;