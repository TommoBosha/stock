import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import WorkTable from '@/components/WorkTable';
import AddWork from '@/components/AddWork';


const AtWorkPage = () => {
  const [workDays, setWorkDays] = useState([]);

  useEffect(() => {
    fetchWorkDays();
  }, []);

  function fetchWorkDays() {
    axios.get("/api/atwork").then((result) => {
      setWorkDays(result.data);
    }).catch(error => {
      console.error('Помилка при завантаженні робочих днів:', error);
    });
  }

  const updateWorkDays = (updatedWorkDay) => {
    const updatedWorkDays = workDays.map((workDay) =>
      workDay._id === updatedWorkDay._id ? updatedWorkDay : workDay
    );
    setWorkDays(updatedWorkDays);
  };

  return (
    <Layout>
      <AddWork fetchWorkDays={fetchWorkDays} />
      <WorkTable workDays={workDays} onUpdate={updateWorkDays} fetchWorkDays={fetchWorkDays} />
    </Layout>
  );
};

export default AtWorkPage;