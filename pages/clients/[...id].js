import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { format } from 'date-fns';

function ClientDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [client, setClient] = useState(null);
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get(`/api/clients?id=` + id).then(response => {
            setClient(response.data);
        });
        axios.get(`/api/orders?clientId=${id}`).then(response => {
            setOrders(response.data);
        });
    }, [id]);

    if (!client) {
        return <p>Завантаження...</p>;
    }

    return (
        <Layout>
            <div className="stats bg-primary shadow-xl text-primary-content">
                <div className="stat">
                    <h1 className="card-title">{client.name}</h1>
                    <p><span className="stat-title text-accent">Адреса:</span> {client.address}</p>
                    <p><span className="stat-title text-accent">Сайт:</span> <a href={client.site}>{client.site}</a></p>
                    <p><span className="stat-title text-accent">Телефон:</span> <a href={`tel:${client.tel}`}>{client.tel}</a></p>
                </div>

                {client.requisites.map((requisite, index) => (
                    <div key={index} className="stat">
                        <p className="uppercase">Реквізити:</p>
                        <ul>
                            <li><span className="stat-title text-accent">МФО:</span> {requisite.MFO}</li>
                            <li><span className="stat-title text-accent">IBAN:</span> {requisite.IBAN}</li>
                            <li><span className="stat-title text-accent">ЄДРПОУ/ДРФО:</span> {requisite.EDRPOU}</li>
                            <li><span className="stat-title text-accent">ІПН:</span> {requisite.IPN}</li>
                            <li><span className="stat-title text-accent">Адреса:</span> {requisite.address}</li>
                        </ul>
                    </div>
                ))}
            </div>

            <h2>Замовлення клієнта</h2>
            <div className="grid grid-cols-2 gap-4">
                {orders.map((order) => (
                    <div className="stats stats-vertical bg-primary shadow-xl text-primary-content" key={order._id}>
                        <div className="stat">
                            <p><span className="stat-title text-accent">Продукти замовлення:</span></p>
                            <div className="overflow-x-auto">
                                <table className="table table-xs">
                                    <thead>
                                        <tr>
                                            <th className="stat-title text-accent">№</th>
                                            <th className="stat-title text-accent">Назва продукту:</th>
                                            <th className="stat-title text-accent">Кількість:</th>
                                        </tr>
                                    </thead>
                                    {order.products && Array.isArray(order.products) && order.products.length > 0 ? (
                                        order.products.map((component, index) => (
                                            <tbody key={component._id}>
                                                <tr>
                                                    <td>{index + 1}</td>
                                                    <td>{component.name}</td>
                                                    <td>{component.quantity}</td>
                                                </tr>
                                            </tbody>
                                        ))
                                    ) : (
                                        <tbody>
                                            <tr>
                                                <td colSpan="3">Продукти відсутні</td>
                                            </tr>
                                        </tbody>
                                    )}
                                </table>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default ClientDetails;