import React, { useEffect, useState } from 'react';

function OrdersList() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Mes actual
  const [filteredOrders, setFilteredOrders] = useState([]);

  useEffect(() => {
    console.log('Invocando load-orders para cargar los pedidos...');
    window.electron.invoke('load-orders')
      .then((loadedOrders) => {
        console.log('Pedidos cargados desde el CSV:', loadedOrders);

        const sortedOrders = loadedOrders.sort((a, b) => {
          const dateA = new Date(a.date.split(',')[0].split('-').reverse().join('-') + ' ' + a.date.split(',')[1].trim()); 
          const dateB = new Date(b.date.split(',')[0].split('-').reverse().join('-') + ' ' + b.date.split(',')[1].trim());
          return dateB - dateA;
        });
        
        setOrders(sortedOrders);
        filterOrdersByMonth(sortedOrders, selectedMonth);
      })
      .catch((error) => {
        console.error('Error al cargar los pedidos:', error);
      });
  }, []);

  const filterOrdersByMonth = (orders, month) => {
    const filtered = orders.filter(order => {
      const orderDateParts = order.date.split(',')[0].split('-');
      const orderDate = new Date(orderDateParts[2], orderDateParts[1] - 1, orderDateParts[0]);
      return orderDate.getMonth() + 1 === month;
    });
    console.log(`Pedidos filtrados para el mes ${month}:`, filtered);
    setFilteredOrders(filtered);
  };

  const handleOrderClick = (order) => {
    console.log('Pedido seleccionado antes de abrir modal:', JSON.stringify(order, null, 2));
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleGeneratePDF = () => {
    console.log('Generando PDF para los pedidos del mes:', filteredOrders);
    if (filteredOrders.length > 0) {
      window.electron.send('generate-pdf', { orders: filteredOrders });
    } else {
      console.log('No hay pedidos para generar el PDF.');
      alert('No hay pedidos para el mes seleccionado.');
    }
  };

  return (
    <div className="orders-list mx-auto max-w-4xl">
      <h2 className="text-3xl font-bold mb-4 text-center text-green-700">Gestión de Pedidos</h2>

      <div className="flex justify-between mb-4">
        <div className="flex items-center">
          <label className="block mb-2">Seleccionar Mes:</label>
          <select value={selectedMonth} onChange={(e) => {
            const month = parseInt(e.target.value);
            setSelectedMonth(month);
            filterOrdersByMonth(orders, month);
          }} className="border rounded p-2 ml-2">
            {[...Array(12)].map((_, index) => (
              <option key={index} value={index + 1}>
                {new Date(0, index).toLocaleString('default', { month: 'long' })}
              </option>
            ))}
          </select>
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
              <th className="py-3 px-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                {/* Aquí se descompone el objeto client */}
                <td className="py-2 px-4">
                  {order.client?.nombre || 'Desconocido'} - {order.client?.numero || 'Sin número'}
                </td>
                <td className="py-2 px-4">{order.date}</td>
                <td className="py-2 px-4">{order.orderType}</td>
                <td className="py-2 px-4">${parseFloat(order.total).toFixed(2)}</td>
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

      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Detalles del Pedido</h3>
            <p><strong>Cliente:</strong> {selectedOrder.client?.nombre || 'No disponible'} - {selectedOrder.client?.numero || 'Sin número'}</p>
            <p><strong>Fecha:</strong> {selectedOrder.date || 'No disponible'}</p>
            <p><strong>Tipo de Pedido:</strong> {selectedOrder.orderType || 'No disponible'}</p>
            <p><strong>Pizzas:</strong></p>
            <ul className="list-disc list-inside">
              {selectedOrder.items && selectedOrder.items.map((item, index) => (
                <li key={index}>
                  {item.pizza}{item.secondHalf ? ` / ${item.secondHalf}` : ''} - {item.size} - Cantidad: {item.quantity} - Precio: ${parseFloat(item.price).toFixed(2)}
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
