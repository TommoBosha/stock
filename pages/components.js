import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import ComponentTable from '@/components/ComponentTable';

const ComponentsPage = () => {
  const [components, setComponents] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchComponents = async () => {
      try {
        const componentsData = await fetch('/api/components').then((res) => res.json());
        const companiesData = await fetch('/api/companies').then((res) => res.json());
        setComponents(componentsData);
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


  const filteredComponents = components.filter((component) =>
    component.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout>
      <h1>Комплектуючі</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Пошук за назвою..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input input-bordered w-full max-w-xs"
        />
      </div>
      <ComponentTable
        components={filteredComponents}
        companies={companies}
        onUpdate={handleComponentUpdate}
      />
    </Layout>
  );
};

export default ComponentsPage;