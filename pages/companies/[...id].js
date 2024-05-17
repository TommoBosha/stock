import Layout from "@/components/Layout";
import axios from "axios";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { format } from 'date-fns';

function CompanyDetails() {
    const router = useRouter();
    const { id } = router.query;

    const [company, setCompany] = useState(null);
    const [invoices, setInvoices] = useState([]);

    useEffect(() => {
        if (!id) {
            return;
        }
        axios.get('/api/companies?id=' + id).then(response => {
            setCompany(response.data);
        });
        axios.get(`/api/invoices?companyId=${id}`).then(response => {
            setInvoices(response.data);
        });
    }, [id]);

    if (!company) {
        return <p>Завантаження...</p>;
    }

    return (
        <Layout>
            <div className="stats bg-primary shadow-xl text-primary-content">
                <div className="stat">
                    <h1 className="card-title">{company.name}</h1>
                    <p><span className="stat-title text-accent">Адреса:</span> {company.address}</p>
                    <p><span className="stat-title text-accent">Сайт:</span> <a href={company.site}>{company.site}</a></p>
                    <p><span className="stat-title text-accent">Телефон:</span> <a href={`tel:${company.tel}`}>{company.tel}</a></p>
                </div>

                {company.requisites.map((requisite, index) => (
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

            <h2>Накладні компанії</h2>
            <div className="grid grid-cols-2 gap-4">
                {invoices.map((invoice) => (
                    <div className="stats stats-vertical bg-primary shadow-xl text-primary-content" key={invoice._id}>
                        <div className="stat">
                            <p><span className="stat-title text-accent">№ накладної:</span> {invoice.invoceNumber}</p>
                            <p><span className="stat-title text-accent">Дата:</span> {format(new Date(invoice.data), 'dd-MM-yyyy')}</p>
                        </div>

                        <div className="stat">
                            <p className="uppercase">Комплектуючі:</p>
                            <div className="overflow-x-auto">
                                <table className="table table-xs">
                                    <thead>
                                        <tr>
                                            <th className="stat-title text-accent">№</th>
                                            <th className="stat-title text-accent">Назва:</th>
                                            <th className="stat-title text-accent">Кількість:</th>
                                            <th className="stat-title text-accent">Ціна за одиницю:</th>
                                            <th className="stat-title text-accent">Загальна сума:</th>
                                        </tr>
                                    </thead>
                                    {invoice.components.map((component, index) => (
                                        <tbody key={component._id}>
                                            <tr>
                                                <th>{index + 1}</th>
                                                <td>{component.name}</td>
                                                <td>{component.quantity}</td>
                                                <td>{component.unitPrice} грн.</td>
                                                <td>
                                                    {component.totalPrice} грн.


                                                </td>
                                            </tr>
                                        </tbody>
                                    ))}
                                </table>
                            </div>
                            <div className="stat flex justify-end">
                                <p><span className="stat-title text-accent">Загальна сума:</span>
                                    {invoice.withVAT ? (
                                        <span className="flex flex-col">
                                            Ціна з ПДВ: {invoice.totalPriceWithVAT} грн.<br />
                                            ПДВ: {invoice.VAT} грн.<br />
                                            Ціна без ПДВ: {invoice.priceWithoutVAT} грн.
                                        </span>
                                    ) : (
                                        <span >
                                            &nbsp;{invoice.totalPrice} грн.<br />
                                        </span>
                                    )}


                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Layout>
    );
}

export default CompanyDetails;