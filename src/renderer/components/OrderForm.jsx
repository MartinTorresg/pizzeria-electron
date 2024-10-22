import React, { useState, useEffect } from 'react';

function OrderForm() {
  const [pizzas, setPizzas] = useState([]);
  const [selectedPizza, setSelectedPizza] = useState('');
  const [secondHalfPizza, setSecondHalfPizza] = useState('');
  const [size, setSize] = useState('medium');
  const [quantity, setQuantity] = useState(1);
  const [client, setClient] = useState('');
  const [orderItems, setOrderItems] = useState([]);

  // Cargar las pizzas al montar el componente
  useEffect(() => {
    console.log('Invocando get-pizzas para cargar las pizzas...');
    window.electron.invoke('get-pizzas')
      .then((loadedPizzas) => {
        console.log('Pizzas cargadas desde el CSV:', loadedPizzas);
        setPizzas(loadedPizzas);
      })
      .catch((error) => {
        console.error('Error al cargar las pizzas:', error);
      });
  }, []);

  const handleAddToOrder = (e) => {
    e.preventDefault();
    console.log('Pizza seleccionada:', selectedPizza, 'Segunda mitad:', secondHalfPizza);

    const firstPizza = pizzas.find((p) => p.Nombre === selectedPizza);
    const secondPizza = pizzas.find((p) => p.Nombre === secondHalfPizza);
    let price = 0;

    if (firstPizza && secondHalfPizza && size) {
      // Calcular el precio de una pizza por mitades (promedio de ambas)
      const firstPrice = size === 'medium' ? parseFloat(firstPizza.PrecioMediano) : parseFloat(firstPizza.PrecioFamiliar);
      const secondPrice = size === 'medium' ? parseFloat(secondPizza.PrecioMediano) : parseFloat(secondPizza.PrecioFamiliar);
      price = ((firstPrice + secondPrice) / 2) * quantity;
    } else if (firstPizza) {
      // Calcular el precio de una pizza entera
      price = (size === 'medium' ? parseFloat(firstPizza.PrecioMediano) : parseFloat(firstPizza.PrecioFamiliar)) * quantity;
    }

    console.log('Precio calculado:', price);

    const newItem = {
      pizza: selectedPizza,
      secondHalf: secondHalfPizza || null,
      size,
      quantity,
      price,
    };

    setOrderItems((prevItems) => {
      console.log('Items anteriores del pedido:', prevItems);
      const newItems = [...prevItems, newItem];
      console.log('Nuevo estado de items del pedido:', newItems);
      return newItems;
    });

    console.log('Nuevo pedido agregado:', newItem);

    // Limpiar los campos después de agregar
    setSelectedPizza('');
    setSecondHalfPizza('');
    setSize('medium');
    setQuantity(1);
  };

  const handleSubmitOrder = () => {
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);
    const orderData = {
      client,
      items: orderItems,
      total,
    };
  
    window.electron.send('save-order', orderData);
    window.electron.send('print-receipt', orderData);

    window.electron.on('receipt-printed', (event, filePath) => {
      console.log(`Recibo generado y guardado en: ${filePath}`);
      alert(`Recibo guardado en: ${filePath}`);
    });

    setClient('');
    setOrderItems([]);
  };

  return (
    <div className="order-form">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Tomar Pedido</h2>

      <form onSubmit={handleAddToOrder} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mb-6 border-t-4 border-green-600">
        <div className="mb-6">
          <label htmlFor="pizza" className="block text-gray-700 font-semibold">Seleccionar Pizza:</label>
          <select
            id="pizza"
            value={selectedPizza}
            onChange={(e) => setSelectedPizza(e.target.value)}
            className="w-full mt-2 p-3 border border-green-500 rounded-md"
            required
          >
            <option value="">Seleccionar pizza...</option>
            {pizzas.map((pizza) => (
              <option key={pizza.Nombre} value={pizza.Nombre}>
                {pizza.Nombre}
              </option>
            ))}
          </select>
        </div>

        {size !== 'small' && (
          <div className="mb-6">
            <label htmlFor="second-half" className="block text-gray-700 font-semibold">Segunda Mitad (Opcional):</label>
            <select
              id="second-half"
              value={secondHalfPizza}
              onChange={(e) => setSecondHalfPizza(e.target.value)}
              className="w-full mt-2 p-3 border border-green-500 rounded-md"
            >
              <option value="">Seleccionar segunda mitad...</option>
              {pizzas.map((pizza) => (
                <option key={pizza.Nombre} value={pizza.Nombre}>
                  {pizza.Nombre}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="size" className="block text-gray-700 font-semibold">Tamaño:</label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full mt-2 p-3 border border-green-500 rounded-md"
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
            className="w-full mt-2 p-3 border border-green-500 rounded-md"
            min="1"
            required
          />
        </div>

        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-3 transition duration-200 shadow-md">
          Agregar al Pedido
        </button>
      </form>

      <div className="order-summary bg-gray-100 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Resumen del Pedido:</h3>
        <ul>
          {orderItems.map((item, index) => (
            <li key={index}>
              {item.quantity} x {item.pizza}{item.secondHalf ? ` / ${item.secondHalf}` : ''} ({item.size}) - ${item.price.toFixed(2)}
            </li>
          ))}
        </ul>
        <p className="text-xl font-bold mt-4">Total: ${orderItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}</p>
      </div>

      <div className="client-info mt-6">
        <label htmlFor="client" className="block text-gray-700 font-semibold">Cliente:</label>
        <input
          type="text"
          id="client"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          className="w-full mt-2 p-3 border border-green-500 rounded-md"
          required
        />

        <button
          onClick={handleSubmitOrder}
          className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg py-3 mt-4 transition duration-200 shadow-md"
        >
          Guardar Pedido e Imprimir Boleta
        </button>
      </div>
    </div>
  );
}

export default OrderForm;
