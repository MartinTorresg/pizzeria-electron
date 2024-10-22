import React, { useEffect, useState } from 'react';

function OrdersList() {
  const [orders, setOrders] = useState([]);

  // Cargar los pedidos al montar el componente
  useEffect(() => {
    console.log('Invocando load-orders para cargar los pedidos...');
    window.electron.invoke('load-orders')
      .then((loadedOrders) => {
        console.log('Pedidos cargados desde el CSV:', loadedOrders);
        setOrders(loadedOrders);
      })
      .catch((error) => {
        console.error('Error al cargar los pedidos:', error);
      });
  }, []);

  return (
    <div className="orders-list">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Gestión de Pedidos</h2>
      <table className="min-w-full bg-white">
        <thead>
          <tr className="w-full bg-green-500 text-white">
            <th className="py-2 px-4">Cliente</th>
            <th className="py-2 px-4">Pizza</th>
            <th className="py-2 px-4">Tamaño</th>
            <th className="py-2 px-4">Cantidad</th>
            <th className="py-2 px-4">Precio</th>
            <th className="py-2 px-4">Estado</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <tr key={index} className="border-b">
              <td className="py-2 px-4">{order.client}</td>
              <td className="py-2 px-4">{order.pizza}</td>
              <td className="py-2 px-4">{order.size}</td>
              <td className="py-2 px-4">{order.quantity}</td>
              <td className="py-2 px-4">${parseFloat(order.price).toFixed(2)}</td>
              <td className="py-2 px-4">{order.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default OrdersList;
