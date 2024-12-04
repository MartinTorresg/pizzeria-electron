import React, { useEffect, useState } from 'react';

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]); // Fecha actual en formato YYYY-MM-DD
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('all');
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 20;

  useEffect(() => {
    window.electron.invoke('load-orders')
      .then((loadedOrders) => {
        const cleanedOrders = loadedOrders.map(order => {
          const cleanedDate = order.date
            .replace('┬', '') // Elimina caracteres no deseados
            .replace('p. m.', 'PM') // Convierte "p. m." a formato 12 horas estándar
            .replace('a. m.', 'AM'); // Convierte "a. m." a formato 12 horas estándar

          return {
            ...order,
            cleanedDate: new Date(
              cleanedDate.split(',')[0].split('-').reverse().join('-') + // Ajusta formato DD-MM-YYYY a YYYY-MM-DD
              ' ' +
              cleanedDate.split(',')[1].trim() // Agrega la hora
            )
          };
        });

        const sortedOrders = cleanedOrders.sort((a, b) => b.cleanedDate - a.cleanedDate);

        setOrders(sortedOrders);
        filterOrders(sortedOrders, selectedDate, selectedPaymentMethod);
      })
      .catch((error) => {
        console.error('Error al cargar los pedidos:', error);
      });
  }, []);

  const filterOrders = (orders, date, paymentMethod) => {
    const filtered = orders
      .filter(order => {
        const orderDate = order.date.split(',')[0]; // Fecha en formato DD-MM-YYYY
        const matchesDate = orderDate === date.split('-').reverse().join('-'); // Comparar fechas
        const matchesPaymentMethod = paymentMethod === 'all' || order.paymentMethod === paymentMethod;

        return matchesDate && matchesPaymentMethod;
      })
      .sort((a, b) => b.cleanedDate - a.cleanedDate); // Mantiene el orden descendente

    setFilteredOrders(filtered);
    setCurrentPage(1); // Resetear a la primera página cuando se filtra
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleGeneratePDF = () => {
    if (filteredOrders.length > 0) {
      window.electron.send('generate-pdf', { orders: filteredOrders });
    } else {
      alert('No hay pedidos para la fecha y criterios seleccionados.');
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const currentOrders = filteredOrders.slice((currentPage - 1) * ordersPerPage, currentPage * ordersPerPage);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  return (
    <div className="orders-list mx-auto max-w-4xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-green-700">Gestión de Pedidos - Reporte Z Diario</h2>

      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div>
            <label className="block mb-2 font-semibold">Seleccionar Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                const date = e.target.value;
                setSelectedDate(date);
                filterOrders(orders, date, selectedPaymentMethod);
              }}
              className="border rounded p-2"
            />
          </div>
          <div>
            <label className="block mb-2 font-semibold">Método de Pago:</label>
            <select
              value={selectedPaymentMethod}
              onChange={(e) => {
                const method = e.target.value;
                setSelectedPaymentMethod(method);
                filterOrders(orders, selectedDate, method);
              }}
              className="border rounded p-2"
            >
              <option value="all">Todos</option>
              <option value="cash">Efectivo</option>
              <option value="debit">Débito</option>
              <option value="credit">Crédito</option>
              <option value="transfer">Transferencia</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleGeneratePDF}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold py-1 px-4 rounded"
        >
          Generar PDF
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded-lg">
          <thead>
            <tr className="bg-green-500 text-white">
              <th className="py-3 px-4">Cliente</th>
              <th className="py-3 px-4">Fecha</th>
              <th className="py-3 px-4">Tipo de Pedido</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Método de Pago</th>
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentOrders.map((order, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="py-2 px-4">
                  {order.client?.nombre || 'Desconocido'} - {order.client?.numero || 'Sin número'}
                </td>
                <td className="py-2 px-4">{order.date}</td>
                <td className="py-2 px-4">{order.orderType}</td>
                <td className="py-2 px-4">${parseFloat(order.total).toFixed(2)}</td>
                <td className="py-2 px-4">{order.paymentMethod || 'No especificado'}</td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleOrderClick(order)}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1 px-2 rounded"
                  >
                    Ver Detalles
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center mt-4 space-x-2">
        {[...Array(totalPages)].map((_, index) => (
          <button
            key={index}
            onClick={() => handlePageChange(index + 1)}
            className={`px-3 py-1 rounded ${currentPage === index + 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Detalles del Pedido</h3>
            <p><strong>Cliente:</strong> {selectedOrder.client?.nombre || 'No disponible'} - {selectedOrder.client?.numero || 'Sin número'}</p>
            <p><strong>Fecha:</strong> {selectedOrder.date || 'No disponible'}</p>
            <p><strong>Tipo de Pedido:</strong> {selectedOrder.orderType || 'No disponible'}</p>
            <p><strong>Método de Pago:</strong> {selectedOrder.paymentMethod || 'No especificado'}</p>
            <p><strong>Pizzas:</strong></p>
            <ul className="list-disc list-inside">
              {selectedOrder.items && selectedOrder.items.map((item, index) => (
                <li key={index}>
                  {item.description || item.pizza || item.accompaniment}
                  {item.secondHalf ? ` / ${item.secondHalf}` : ''} -
                  {item.size ? `${item.size}` : ''} -
                  Cantidad: {item.quantity || 1} -
                  Precio: ${parseFloat(item.price || 0).toFixed(2)}
                </li>
              ))}
            </ul>
            <p className="mt-4"><strong>Total:</strong> ${parseFloat(selectedOrder.total).toFixed(2)}</p>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseModal}
                className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default OrdersList;
