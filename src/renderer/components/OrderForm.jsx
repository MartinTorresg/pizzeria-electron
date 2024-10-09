import React, { useState, useEffect } from 'react';

function OrderForm() {
  const [pizzas, setPizzas] = useState([]);

  // Cargar las pizzas al montar el componente
  useEffect(() => {
    console.log('Invocando get-pizzas para cargar las pizzas...');
    window.electron.invoke('get-pizzas').then((loadedPizzas) => {
      console.log('Pizzas cargadas desde el CSV:', loadedPizzas);
      setPizzas(loadedPizzas);
    }).catch((error) => {
      console.error('Error al cargar las pizzas:', error);
    });
  }, []); // Se ejecuta al montar el componente

  const [selectedPizza, setSelectedPizza] = useState('');
  const [size, setSize] = useState('medium');
  const [quantity, setQuantity] = useState(1);
  const [client, setClient] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const pizza = pizzas.find((p) => p.Nombre === selectedPizza);
    const price = pizza ? pizza[`Precio${size.charAt(0).toUpperCase() + size.slice(1)}`] * quantity : 0;

    const orderData = {
      pizza: selectedPizza,
      size,
      quantity,
      client,
      price,
    };

    console.log('Guardando pedido:', orderData);

    // Enviar el pedido al backend para guardarlo en el archivo CSV
    window.electron.send('save-order', orderData);

    setSelectedPizza('');
    setSize('medium');
    setQuantity(1);
    setClient('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mb-6 border-t-4 border-green-600">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Nuevo Pedido</h2>

      <div className="mb-6">
        <label htmlFor="pizza" className="block text-gray-700 font-semibold">Seleccionar Pizza:</label>
        <select
          id="pizza"
          value={selectedPizza}
          onChange={(e) => {
            console.log('Pizza seleccionada:', e.target.value);
            setSelectedPizza(e.target.value);
          }}
          className="w-full mt-2 p-3 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        >
          <option value="">Seleccionar pizza...</option>
          {pizzas.map((pizza, index) => (
            <option key={index} value={pizza.Nombre}>
              {pizza.Nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="size" className="block text-gray-700 font-semibold">Tamaño:</label>
        <select
          id="size"
          value={size}
          onChange={(e) => setSize(e.target.value)}
          className="w-full mt-2 p-3 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        >
          <option value="medium">Mediano</option>
          <option value="large">Familiar</option>
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="quantity" className="block text-gray-700 font-semibold">Cantidad:</label>
        <input
          type="number"
          id="quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          className="w-full mt-2 p-3 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          min="1"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="client" className="block text-gray-700 font-semibold">Cliente:</label>
        <input
          type="text"
          id="client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="w-full mt-2 p-3 border border-green-500 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <button type="submit" className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg py-3 transition duration-200 shadow-md">
        Guardar Pedido
      </button>
    </form>
  );
}

export default OrderForm;
