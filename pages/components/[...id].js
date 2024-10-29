/* eslint-disable @next/next/no-img-element */
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import Layout from '@/components/Layout';
import axios from 'axios';
import Link from 'next/link';
import { QRCodeCanvas } from 'qrcode.react';


const ComponentDetails = () => {
    const router = useRouter();
    const { id } = router.query;
    const [component, setComponent] = useState(null);
    const [companies, setCompanies] = useState([]);

    useEffect(() => {
        if (!id) {
            return;
        }


        axios.get('/api/components?id=' + id)
            .then(response => {
                setComponent(response.data);


                if (response.data.company && response.data.company.length > 0) {
                    const companyIds = response.data.company.join(',');
                    axios.get(`/api/companies?ids=${companyIds}`)
                        .then(res => setCompanies(res.data))
                        .catch(error => console.error('Error fetching companies:', error));
                }
            })
            .catch(error => {
                console.error('Error fetching component:', error);
            });
    }, [id]);

    if (!component) {
        return <Layout><p>Loading...</p></Layout>;
    }


    const componentUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/components/${id}`;

    return (
        <Layout>
            <div className="card lg:card-side bg-base-100 shadow-xl">
                <figure className="w-80 h-80">
                    <img src={component.images || 'https://via.placeholder.com/150'} alt={component.name} className="object-fill" />
                </figure>

                <div className="card-body ">
                    <h1 className="card-title">{component.name}</h1>
                    <div className="flex flex-row justify-between">
                        <div className="flex flex-col">

                            <p className="font-medium">Ціна: {component.unitPrice} грн.</p>
                            <p className="font-medium">Кількість: {component.quantity}</p>

                            <div>
                                <h3 className="font-medium">Постачальник:</h3>
                                {companies.length > 0 ? (
                                    companies.map((company) => (
                                        <p key={company._id}>
                                            <Link href={`/companies/${company._id}`} className="text-blue-500 hover:underline">{company.name}</Link>
                                        </p>
                                    ))
                                ) : (
                                    <p>Unknown</p>
                                )}
                            </div>

                        </div>

                        {/* Добавляем секцию с QR-кодом */}
                        <div className="mt-5">
                            <h3 className="font-medium mb-2">QR-код:</h3>
                            {componentUrl && (
                                <QRCodeCanvas value={componentUrl} size={128} level={"H"} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ComponentDetails;
