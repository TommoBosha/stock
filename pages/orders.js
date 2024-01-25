import Layout from "@/components/Layout";
import Spinner from "@/components/Spinner";
import axios from "axios";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    setIsLoading(true);
    axios.get("/api/orders").then((response) => {
      setOrders(response.data);
      setIsLoading(false);
    });
  }, []);

  const handleStatusChange = async (orderId, field, value) => {
    try {
      const isStatusTrue = value === "ТАК";
      await axios.put("/api/orders", {
        orderId,
        updateFields: { [field]: isStatusTrue },
      });

      setOrders(
        orders.map((order) =>
          order._id === orderId ? { ...order, [field]: isStatusTrue } : order
        )
      );
    } catch (error) {
      console.error("Помилка оновлення статусу:", error);
    }
  };
  return (
    <>
      <Layout>
        <h1>Замовлення</h1>
        <table className="basic">
          <thead>
            <tr>
              <th>Дата</th>
              <th>№ Замовлення</th>
              <th>Оплата</th>
              <th>Доставка</th>
              <th>Продукти</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan={4}>
                  <div className="py-4">
                    <Spinner fullWidth={true} />
                  </div>
                </td>
              </tr>
            )}
            {orders.length > 0 &&
              orders.map((order) => (
                <tr key={order._id}>
                  {console.log(orders)}
                  <td className="w-[100px]">{new Date(order.createdAt).toLocaleString()}</td>
                  <td>{order._id}</td>
                  <td
                    className={`${order.isPaid ? "bg-green-200" : "bg-red-400"} w-[120px]`}
                  >
                    <select
                      value={order.isPaid ? "ТАК" : "НІ"}
                      onChange={(e) =>
                        handleStatusChange(order._id, "isPaid", e.target.value)
                      }
                    >
                      <option value="ТАК">ТАК</option>
                      <option value="НІ">НІ</option>
                    </select>
                  </td>
                  <td
                    className={`${order.isDelivered ? "bg-green-200" : "bg-red-400"} w-[350px]`}

                  >
                    {order.shippingAddress.fullName}{" "}
                    {order.shippingAddress.phone}
                    <br />
                    {order.shippingAddress.deliveryMethod}
                    <br />
                    
                    {order.shippingAddress.cityName}{" "}
                    {order.shippingAddress.postCode}{" "}
                    {order.shippingAddress.country}{" "}
                    {order.shippingAddress.city}{" "}
                    <br />
                    {order.shippingAddress.address}{" "}
                    {order.shippingAddress.warehouses}
                    <br />
                    <p
                      className={
                        order.isDelivered ? "text-green-800" : "text-black"
                      }
                    >
                      Доставлено:
                      <select
                        value={order.isDelivered ? "ТАК" : "НІ"}
                        onChange={(e) =>
                          handleStatusChange(
                            order._id,
                            "isDelivered",
                            e.target.value
                          )
                        }
                      >
                        <option value="ТАК">ТАК</option>
                        <option value="НІ">НІ</option>
                      </select>
                    </p>
                  </td>
                  <td>
                    {order.orderItems.map((l, index) => (
                      <div key={index}>
                        <Image
                          src={l.images[0]}
                          width={50}
                          height={50}
                          alt={l.title}
                        />
                        <br />
                        {l.title}
                        <br />
                        {l.price} грн x{l.quantity}
                        <br />
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </Layout>
    </>
  );
}
