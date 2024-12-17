import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function StaffPage() {
  const router = useRouter();
  const { id } = router.query;

  const [staffMember, setStaffMember] = useState(null);
  const [workDays, setWorkDays] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        
        // Отримуємо дані про співробітника
        const staffRes = await axios.get(`${baseUrl}/api/staff?id=${id}`);
        const staffData = staffRes.data;
        
        if (!staffData) {
          setStaffMember(null);
          setLoading(false);
          return;
        }
        
        setStaffMember(staffData);
        
        // Отримуємо всі робочі дні
        const workDaysRes = await axios.get(`${baseUrl}/api/atwork`);
        let allWorkDays = workDaysRes.data;
        
        // Фільтруємо робочі дні, де цей співробітник є у масиві contractors
        // Тепер ми НЕ фільтруємо за статусом, а просто беремо всі роботи, де він є.
        allWorkDays = allWorkDays.filter(wd =>
          wd.contractors.some(c => c._id === id)
        );
        
        setWorkDays(allWorkDays);
        setLoading(false);
      } catch (error) {
        console.error("Помилка при завантаженні даних співробітника:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  if (loading) {
    return <p>Завантаження...</p>;
  }

  if (!staffMember) {
    return <p>Співробітника не знайдено.</p>;
  }

  return (
    <Layout>
      <div className="mx-auto p-4 bg-white shadow rounded max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">{staffMember.fullName}</h1>
        <p><span className="font-semibold">Цех:</span> {staffMember.department}</p>
        <p><span className="font-semibold">Обов&apos;язки:</span> {staffMember.duties}</p>
        <p><span className="font-semibold">Закріплений інструмент:</span> {staffMember.assignedTool?.name || "Немає"}</p>

        <h2 className="text-xl font-bold mt-8 mb-2">Робочі дні, де співробітник задіяний</h2>
        {workDays.length === 0 ? (
          <p>Немає робочих днів з участю цього співробітника.</p>
        ) : (
          <table className="table-auto w-full border-collapse">
            <thead>
              <tr>
                <th className="border px-2 py-1">Початкова дата</th>
                <th className="border px-2 py-1">Дата завершення</th>
                <th className="border px-2 py-1">Серійний номер</th>
                <th className="border px-2 py-1">Замовлення</th>
                <th className="border px-2 py-1">Продукти</th>
                <th className="border px-2 py-1">Статус</th>
                <th className="border px-2 py-1">Деталі</th>
              </tr>
            </thead>
            <tbody>
              {workDays.map((wd) => (
                <tr key={wd._id}>
                  <td className="border px-2 py-1">{new Date(wd.startDate).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{new Date(wd.endDate).toLocaleDateString()}</td>
                  <td className="border px-2 py-1">{wd.serialNumber}</td>
                  <td className="border px-2 py-1">
                    {wd.orders?.map((order, i) => (
                      <div key={i}>{order.orderNumber}</div>
                    ))}
                  </td>
                  <td className="border px-2 py-1">
                    {wd.products?.map((product, i) => (
                      <div key={i}>{product.name} ({product.quantity})</div>
                    ))}
                  </td>
                  <td className="border px-2 py-1">{wd.status}</td>
                  <td className="border px-2 py-1">
                    <Link href={`/work/${wd._id}`}>Деталі</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}
