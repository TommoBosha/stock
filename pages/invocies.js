import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import { withSwal } from "react-sweetalert2";
import Link from 'next/link';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Layout from '@/components/Layout';
import AddInvoice from '@/components/AddInvoce';

import Pagination from '@/components/Pagination';
import EditInvoice from '@/components/EditInvoice';


const Invoices = ({ swal }) => {
  const [invoices, setInvoices] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [invoicesPerPage] = useState(15);
  const [filterType, setFilterType] = useState('company');
  const [companyFilter, setCompanyFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(null);
  const [invoiceNumberFilter, setInvoiceNumberFilter] = useState('');
  const [editingInvoice, setEditingInvoice] = useState(null);

  useEffect(() => {
    fetchInvoices();
  }, []);

  function fetchInvoices() {
    axios.get(`/api/invoices`)
      .then((result) => {
        setInvoices(result.data);
      });
  }

  function deleteInvoice(invoice) {
    swal.fire({
      title: "Ви впевнені",
      text: `Ви хочете видалити ${invoice.invoceNumber}?`,
      showCancelButton: true,
      cancelButtonText: "Скасувати",
      confirmButtonText: "Так, видалити!",
      confirmButtonColor: "#d55",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { _id } = invoice;
        setInvoices(invoices.filter((inv) => inv._id !== _id));
        await axios.delete("/api/invoices?_id=" + _id);
      }
    });
  }

  const editInvoice = (invoice) => {

    setEditingInvoice(invoice);
  };

  const filteredInvoices = invoices.filter((invoice) => {
    let match = true;
    if (filterType === 'company') {
      const companyMatch = companyFilter ? invoice.company && invoice.company.name.toLowerCase().includes(companyFilter.toLowerCase()) : true;
      const dateMatch = dateFilter ? format(new Date(invoice.data), 'dd-MM-yyyy') === format(new Date(dateFilter), 'dd-MM-yyyy') : true;
      match = companyMatch && dateMatch;
    } else if (filterType === 'invoiceNumber') {
      match = invoice.invoceNumber.includes(invoiceNumberFilter);
    } else if (filterType === 'date') {
      match = dateFilter ? format(new Date(invoice.data), 'dd-MM-yyyy') === format(new Date(dateFilter), 'dd-MM-yyyy') : true;
    }
    return match;

  });

  const handleFilterTypeChange = (event) => {
    setFilterType(event.target.value);
    setCompanyFilter('');
    setDateFilter(null);
    setInvoiceNumberFilter('');
  };

  const handleCompanyFilterChange = (event) => {
    setCompanyFilter(event.target.value);
  };

  const handleDateFilterChange = (date) => {
    setDateFilter(date);
  };

  const handleInvoiceNumberFilterChange = (event) => {
    setInvoiceNumberFilter(event.target.value);
  };

  const indexOfLastInvoice = currentPage * invoicesPerPage;
  const indexOfFirstInvoice = indexOfLastInvoice - invoicesPerPage;
  const currentInvoices = filteredInvoices.slice(indexOfFirstInvoice, indexOfLastInvoice);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <Layout>
      <div>Накладні</div>
      <div className='flex flex-row justify-between'>
        <AddInvoice fetchInvoice={fetchInvoices} />
        <div className="flex justify-end mb-4">
          <div className="border rounded p-2">
            <select
              value={filterType}
              onChange={handleFilterTypeChange}
              className="mr-2 border rounded px-2 py-1"
            >
              <option value="company">Назва компанії</option>
              <option value="date">Дата</option>
              <option value="invoiceNumber">Номер накладної</option>
            </select>

            {filterType === 'company' && (
              <input
                type="text"
                id="companyFilter"
                value={companyFilter}
                onChange={handleCompanyFilterChange}
                placeholder="Пошук за назвою компанії"
                className="border rounded px-2 py-1"
              />
            )}

            {filterType === 'date' && (
              <DatePicker
                id="dateFilter"
                selected={dateFilter}
                onChange={handleDateFilterChange}
                dateFormat="dd-MM-yyyy"
                placeholderText="Обрати дату"
                className="border rounded px-2 py-1"
              />
            )}

            {filterType === 'invoiceNumber' && (
              <input
                type="text"
                id="invoiceNumberFilter"
                value={invoiceNumberFilter}
                onChange={handleInvoiceNumberFilterChange}
                placeholder="Пошук за номером накладної"
                className="border rounded px-2 py-1"
              />
            )}
          </div>
        </div>
      </div>


      {editingInvoice ? (
        <EditInvoice
          invoice={editingInvoice}
          onUpdate={() => {
            fetchInvoices();
            setEditingInvoice(null);
          }}
          onCancel={() => setEditingInvoice(null)}
        />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="table ">
              <thead>
                <tr>
                  <td>№ накл.</td>
                  <td>Дата</td>
                  <td>Компанія постачальника</td>
                  <td>Загальна сума</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {currentInvoices.map((invoice) => (
                  <tr key={invoice._id} className="hover">
                    <td>{invoice.invoceNumber}</td>
                    <td>
                      {format(new Date(invoice.data), 'dd-MM-yyyy')}
                    </td>
                    <td>
                      {invoice.company && invoice.company._id ? (
                        <Link href={`/companies/` + invoice.company._id}>
                          {invoice.company.name}
                        </Link>
                      ) : (
                        <span>Немає даних про компанію</span>
                      )}
                    </td>
                    <td>
                      {invoice.totalPrice || invoice.totalPriceWithVAT} грн.
                    </td>
                    <td className='flex flex-row gap-2'>
                      <button
                        onClick={() => editInvoice(invoice)}
                        className="btn-primary"
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
                        onClick={() => deleteInvoice(invoice)}
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
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            invoicesPerPage={invoicesPerPage}
            totalInvoices={filteredInvoices.length}
            paginate={paginate}
            currentPage={currentPage}
          />
        </>
      )}
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <Invoices swal={swal} />);