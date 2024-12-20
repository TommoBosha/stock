import AddClient from '@/components/AddClients';
import Layout from '@/components/Layout'
import Pagination from '@/components/Pagination';
import axios from 'axios';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { withSwal } from 'react-sweetalert2';

const ClientsPage = ({ swal }) => {
    const [clients, setClients] = useState([]);
    const [editedCliet, setEditedCliet] = useState(null);
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [site, setSite] = useState("");
    const [requisites, setRequisites] = useState([]);
    const [tel, setTel] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [companiesPerPage] = useState(10);

    useEffect(() => {
        fetchClient();
    }, []);

    function fetchClient() {
        axios.get("/api/clients").then((result) => {
            setClients(result.data);
        });
    }


    function editClient(company) {
        setEditedCliet(company);
        setName(company.name);
        setAddress(company.address);
        setSite(company.site);
        setRequisites(company.requisites);
        setTel(company.tel);
        setShowForm(true);
    }

    async function saveClient(e) {
        e.preventDefault();
        try {
            const data = {
                name,
                address,
                site,
                requisites: requisites.map(requisite => ({
                    MFO: requisite.MFO,
                    IBAN: requisite.IBAN,
                    EDRPOU: requisite.EDRPOU,
                    IPN: requisite.IPN,
                    address: requisite.address
                })),
                tel,
            };

            if (editedCliet) {
                data._id = editedCliet._id;
                await axios.put("/api/clients", data);
                setClients(
                    clients.map((clnt) =>
                        clnt._id === editedCliet._id ? data : clnt
                    )
                );
                setEditedCliet(null);
            } else {
                await axios.post("/api/clients", data);
                setClients([...clients, data]);
            }

            setName("");
            setAddress("");
            setSite("");
            setRequisites("");
            setTel("");
            setShowForm(false);
        } catch (error) {
            console.error("Помилка при збереженні компанії:", error);
        }
    }

    function deleteClient(client) {
        swal
            .fire({
                title: "Ви впевнені",
                text: `Ви хочете видалити ${client.name}?`,
                showCancelButton: true,
                cancelButtonText: "Скасувати",
                confirmButtonText: "Так, видалити!",
                confirmButtonColor: "#d55",
                reverseButtons: true,
            })
            .then(async (result) => {
                if (result.isConfirmed) {
                    const { _id } = client;
                    setClients(clients.filter((clnt) => clnt._id !== _id));
                    await axios.delete("/api/clients?_id=" + _id);
                }
            });
    }

    const handleRequisiteChange = (e, index, field) => {
        const updatedRequisites = [...requisites];
        updatedRequisites[index][field] = e.target.value;
        setRequisites(updatedRequisites);
    };

    const addRequisite = (e) => {
        e.preventDefault();
        setRequisites([...requisites, { MFO: "", IBAN: "", EDRPOU: "", IPN: "", address: "" }]);
    };

    const removeRequisite = (index) => {
        const updatedRequisites = [...requisites];
        updatedRequisites.splice(index, 1);
        setRequisites(updatedRequisites);
    };

    const indexOfLastCompany = currentPage * companiesPerPage;
    const indexOfFirstCompany = indexOfLastCompany - companiesPerPage;
    const currentCompanies = clients.slice(indexOfFirstCompany, indexOfLastCompany);

    const paginate = pageNumber => setCurrentPage(pageNumber);


    return (
        <Layout>
            <h1>Клієнти</h1>
            <AddClient fetchClient={fetchClient} />
            <label className="text-2xl font-bold mb-4 text-gray-800">
                {editedCliet
                    ? `Редагування клієнта ${editedCliet.name}`
                    : "Всі клієнти"}
            </label>


            {showForm && (
                <form className="flex flex-col justify-center items-center max-w-4xl mx-auto my-4 p-5 bg-white shadow-md rounded-lg" onSubmit={saveClient}>
                    <div className=" mb-4  ">
                        <input
                            type="text"
                            placeholder={"Ім'я клієнта"}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <input
                            type="text"
                            placeholder={"Адреса"}
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <input
                            type="text"
                            placeholder={"Сайт"}
                            value={site}
                            onChange={(e) => setSite(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />
                        <input
                            type="text"
                            placeholder={"Номер телефону"}
                            value={tel}
                            onChange={(e) => setTel(e.target.value)}
                            className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        />

                        {requisites.map((requisite, index) => (
                            <div key={index}>
                                <h2>Реквізити</h2>
                                <input
                                    type="text"
                                    placeholder={`МФО ${index + 1}`}
                                    value={requisite.MFO}
                                    onChange={(e) => handleRequisiteChange(e, index, "MFO")}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />

                                <input
                                    type="text"
                                    placeholder={`IBAN ${index + 1}`}
                                    value={requisite.IBAN}
                                    onChange={(e) => handleRequisiteChange(e, index, "IBAN")}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />

                                <input
                                    type="text"
                                    placeholder={`EDRPOU ${index + 1}`}
                                    value={requisite.EDRPOU}
                                    onChange={(e) => handleRequisiteChange(e, index, "EDRPOU")}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                <input
                                    type="text"
                                    placeholder={`IPN ${index + 1}`}
                                    value={requisite.IPN}
                                    onChange={(e) => handleRequisiteChange(e, index, "IPN")}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                <input
                                    type="text"
                                    placeholder={`address ${index + 1}`}
                                    value={requisite.address}
                                    onChange={(e) => handleRequisiteChange(e, index, "address")}
                                    className="mb-4 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                                <div className="flex flex-row gap-2">

                                    <button className="btn-delete" onClick={() => removeRequisite(index)}>Видалити</button>
                                </div>


                            </div>
                        ))}

                    </div>
                    <div className="flex justify-center items-center gap-2 mt-8">

                        <button className="btn-default" onClick={addRequisite}>Додати реквізит</button>
                        {editedCliet && (

                            <button
                                type="button"
                                onClick={() => {
                                    setEditedCliet(null);
                                    setName("");
                                    setAddress("");
                                    setSite("");
                                    setTel("");
                                    setRequisites("");
                                    setShowForm(false);
                                }}
                                className="btn-default"
                            >
                                Відмінити
                            </button>
                        )}
                        <button type="submit" className="btn-save py-1">
                            Зберегти
                        </button>

                    </div>
                </form>
            )}

            {!editedCliet && (
                <div className="overflow-x-auto">
                    <table className="table ">
                        <thead>
                            <tr>
                                <td>Компанія</td>
                                <td>Номер телефону</td>
                                <td>Сайт</td>
                                <td>Реквізити</td>


                            </tr>
                        </thead>
                        <tbody>
                            {currentCompanies.length > 0 &&
                                currentCompanies.map((company) => (
                                    <tr key={company._id} className="hover">
                                        <td>
                                            <Link href={`/clients/` + company._id}>
                                                <span className="font-bold text-primary" >{company.name}</span>
                                            </Link>
                                        </td>
                                        <td>
                                            <a href={`tel:${company.tel}`} className="text-primary">{company.tel}</a>
                                        </td>
                                        <td>
                                            <a href={company.site} className="text-primary">{company.site}</a>
                                        </td>
                                        <td>
                                            {company.requisites.length > 0 && (
                                                <ul className={`grid ${company.requisites.length > 1 ? 'grid-cols-2' : ''} gap-4`}>
                                                    {company.requisites.map((requisite, index) => (
                                                        <li key={index} className="text-primary">
                                                            <p><span className="font-bold " >МФО:</span> {requisite.MFO}&nbsp;&nbsp;</p>
                                                            <p><span className="font-bold " >IBAN:</span> {requisite.IBAN}&nbsp;&nbsp;</p>
                                                            <p><span className="font-bold " >ЄДРПОУ/ДРФО:</span> {requisite.EDRPOU}&nbsp;&nbsp;</p>
                                                            <p><span className="font-bold " >ІПН:</span>{requisite.IPN}&nbsp;&nbsp;</p>
                                                            <p><span className="font-bold " >Юр. Адреса:</span> {requisite.address}</p>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </td>

                                        <td className=" flex flex-row gap-2">
                                            <button
                                                className="btn-primary mr-1"
                                                onClick={() => editClient(company)}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="2"
                                                    stroke="currentColor"
                                                    fontSize="16"
                                                    className="w-4 h-4"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                    />
                                                </svg>
                                            </button>
                                            <button
                                                onClick={() => deleteClient(company)}
                                                className="btn-primary"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    aria-hidden="true"
                                                    role="img"
                                                    fontSize="16"
                                                    width="1em"
                                                    height="1em"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth="2"
                                                        d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"
                                                    ></path>
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))

                            }
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination
                invoicesPerPage={companiesPerPage}
                totalInvoices={clients.length}
                paginate={paginate}
                currentPage={currentPage}
            />
        </Layout>

    )
}

export default withSwal(({ swal }, ref) => <ClientsPage swal={swal} />); 