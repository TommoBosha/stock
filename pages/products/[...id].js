/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Layout from '@/components/Layout';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);

  useEffect(() => {
    if (id) {
      axios.get(`/api/products?id=${id}`).then(response => {
        setProduct(response.data);
      });
    }
  }, [id]);

  if (!product) {
    return <p>Завантаження...</p>;
  }

  // Расчёт цены компонентов (сумма totalPrice)
  const totalComponentsPrice = product.components.reduce((sum, comp) => sum + (comp.totalPrice || 0), 0);

  return (
    <Layout>
    <div className=" mx-auto p-4 bg-white shadow rounded">
      <h1 className="text-2xl font-bold mb-4">{product.name}</h1>
      <div className='flex flex-row gap-5'>
      {product.images && (
        <img src={product.images} alt={product.name} className="mb-4 max-w-[30%] h-auto" />
      )}

      <div className="mb-4">
        <p><span className="font-semibold">Ціна компонентів:</span> {totalComponentsPrice.toFixed(2)}</p>
        <p><span className="font-semibold">Ціна зборки:</span> {product.assemblyPrice}</p>
        <p><span className="font-semibold">Ціна реалізації:</span> {product.salePrice}</p>
        <p><span className="font-semibold">Термін виготовлення:</span> {product.manufacturingTime} днів</p>
      </div>
      </div>

      <h2 className="text-xl font-bold mb-2">Комплектуючі</h2>
      <table className="table-auto w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">Назва</th>
            <th className="border px-2 py-1">Кількість</th>
            <th className="border px-2 py-1">Ціна за одиницю</th>
            <th className="border px-2 py-1">Загальна ціна</th>
          </tr>
        </thead>
        <tbody>
          {product.components.map((comp, index) => (
            <tr key={index}>
              <td className="border px-2 py-1">
               
                <Link href={`/components/${comp.item._id}`}>
                  {comp.name}
                </Link>
              </td>
              <td className="border px-2 py-1 text-center">{comp.quantity}</td>
              <td className="border px-2 py-1 text-right">{comp.item.unitPrice} грн</td>
              <td className="border px-2 py-1 text-right">{Number(comp.totalPrice).toFixed(2)} грн</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
    </Layout>
  );
}