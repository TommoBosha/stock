import AddOrder from '@/components/AddOrder';
import Layout from '@/components/Layout';
import Pagination from '@/components/Pagination';
import EditableCell from '@/components/EditableCell';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { withSwal } from 'react-sweetalert2';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const OrdersPage = ({ swal }) => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(10);
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editingComment, setEditingComment] = useState('');

  const paymentStatusMap = {
    Paid: "Оплачено",
    NotPaid: "Не оплачено",
    PartlyPaid: "Частково оплачено"
  };

  useEffect(() => {
    fetchOrders();
    fetchClients();
    fetchProducts();
  }, []);

  function fetchOrders() {
    axios.get("/api/orders").then((result) => {
      setOrders(result.data);
    });
  }

  function fetchClients() {
    axios.get("/api/clients").then((result) => {
      setClients(result.data);
    });
  }

  function fetchProducts() {
    axios.get("/api/products").then((result) => {
      setProducts(result.data);
    });
  }

  async function deleteOrder(order) {
    swal.fire({
      title: "Ви впевнені?",
      text: `Ви хочете видалити замовлення №${order.orderNumber}?`,
      showCancelButton: true,
      cancelButtonText: "Скасувати",
      confirmButtonText: "Так, видалити!",
      confirmButtonColor: "#d33",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        const { _id } = order;
        setOrders(orders.filter((ord) => ord._id !== _id));
        await axios.delete("/api/orders?_id=" + _id);
      }
    });
  }

  async function updateOrder(orderId, field, value) {
    try {
      const updateValue = field === 'data' ? new Date(value).toISOString() : value;
      await axios.put(`/api/orders`, { orderId, [field]: updateValue });
      fetchOrders();
    } catch (error) {
      console.error('Помилка при оновленні замовлення:', error);
    }
  }

  const addProductToOrder = (order) => {
    const newProduct = products[0];
    const updatedProducts = [...order.products, { _id: newProduct._id, name: newProduct.name, quantity: 1 }];
    updateOrder(order._id, 'products', updatedProducts);
  };

  const removeProductFromOrder = (order, index) => {
    const updatedProducts = order.products.filter((_, i) => i !== index);
    updateOrder(order._id, 'products', updatedProducts);
  };

  const handleProductChange = (order, index, productId) => {
    const product = products.find(p => p._id === productId);
    const updatedProducts = order.products.map((p, i) =>
      i === index ? { ...p, _id: productId, name: product.name } : p
    );
    updateOrder(order._id, 'products', updatedProducts);
  };

  const handleSaveComment = async (orderId) => {
    await updateOrder(orderId, 'comment', editingComment);
    setEditingComment('');
    setEditingOrderId(null);
  };

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = orders.slice(indexOfFirstOrder, indexOfLastOrder);

  const paginate = pageNumber => setCurrentPage(pageNumber);

  return (
    <Layout>
      <h1>Замовлення</h1>
      <AddOrder fetchOrders={fetchOrders} />
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Клієнт</th>
              <th>Продукти</th>
              <th>Кількість</th>
              <th>Загальна ціна</th>
              <th>Статус оплати</th>
              <th>Коментарі</th>
              <th>Дії</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order) => (
              <tr key={order._id}>
                <td>
                  <EditableCell
                    initialValue={order.orderNumber}
                    type="text"
                    isEditing={editingOrderId === order._id}
                    onSave={(value) => updateOrder(order._id, 'orderNumber', value)}
                  />
                </td>
                <td>
                  {editingOrderId === order._id ? (
                    <DatePicker
                      selected={new Date(order.data)}
                      onChange={(date) => updateOrder(order._id, 'data', date)}
                      dateFormat="dd/MM/yyyy"
                    />
                  ) : (
                    new Date(order.data).toLocaleDateString()
                  )}
                </td>
                <td>
                  {editingOrderId === order._id ? (
                    <select
                      value={order.client._id}
                      onChange={(e) => updateOrder(order._id, 'client', e.target.value)}
                    >
                      {clients.map(client => (
                        <option key={client._id} value={client._id}>{client.name}</option>
                      ))}
                    </select>
                  ) : (
                    order.client.name
                  )}
                </td>
                <td>
                  {order.products.map((product, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center' }}>
                      {editingOrderId === order._id ? (
                        <select
                          value={product._id}
                          onChange={(e) => handleProductChange(order, index, e.target.value)}
                        >
                          {products.map(prod => (
                            <option key={prod._id} value={prod._id}>{prod.name}</option>
                          ))}
                        </select>
                      ) : (
                        product.name
                      )}
                      {editingOrderId === order._id && (
                        <button className='btn-primary' onClick={() => removeProductFromOrder(order, index)} style={{ marginLeft: '5px' }}>
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
                      )}
                    </div>
                  ))}
                  {editingOrderId === order._id && (
                    <button className='btn-primary' onClick={() => addProductToOrder(order)} style={{ marginTop: '5px' }}>
                      Додати
                    </button>
                  )}
                </td>
                <td>
                  {order.products.map((product, index) => (
                    <EditableCell
                      key={index}
                      initialValue={product.quantity}
                      type="number"
                      isEditing={editingOrderId === order._id}
                      onSave={(value) => {
                        const updatedProducts = order.products.map((p, i) =>
                          i === index ? { ...p, quantity: value } : p
                        );
                        updateOrder(order._id, 'products', updatedProducts);
                      }}
                    />
                  ))}
                </td>
                <td>
                  <EditableCell
                    initialValue={order.totalPrice}
                    type="number"
                    isEditing={editingOrderId === order._id}
                    onSave={(value) => updateOrder(order._id, 'totalPrice', value)}
                  />

                </td>
                <td>
                  {editingOrderId === order._id ? (
                    <select
                      value={order.isPaid}
                      onChange={(e) => updateOrder(order._id, 'isPaid', e.target.value)}
                    >
                      {Object.keys(paymentStatusMap).map(key => (
                        <option key={key} value={key}>{paymentStatusMap[key]}</option>
                      ))}
                    </select>
                  ) : (
                    paymentStatusMap[order.isPaid]
                  )}
                </td>
                <td>
                  {editingOrderId === order._id ? (
                    <>
                      <textarea
                        className="textarea textarea-bordered"
                        value={editingComment}
                        onChange={(e) => setEditingComment(e.target.value)}
                      />
                      {/* <button className='btn-primary' onClick={() => handleSaveComment(order._id)}>Зберегти коментар</button> */}
                    </>
                  ) : (
                    order.comment || 'Немає коментаря'
                  )}
                </td>
                <td className='flex flex-row gap-2'>
                  <button
                    onClick={() => deleteOrder(order)}
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
                  <button
                    onClick={() => {
                      if (editingOrderId === order._id) {
                        handleSaveComment(order._id);
                      } else {
                        setEditingOrderId(order._id);
                        setEditingComment(order.comment || '');
                      }
                    }}
                    className="btn-primary"
                  >
                    {editingOrderId === order._id
                      ?
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-4 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                        />
                      </svg>
                      :
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
                      </svg>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        invoicesPerPage={ordersPerPage}
        totalInvoices={orders.length}
        paginate={paginate}
        currentPage={currentPage}
      />
    </Layout>
  );
}

export default withSwal(({ swal }, ref) => <OrdersPage swal={swal} />);