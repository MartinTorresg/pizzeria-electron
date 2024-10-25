import React, { useState, useEffect } from 'react';

function OrderForm() {
  const [pizzas, setPizzas] = useState([]);
  const [accompaniments, setAccompaniments] = useState([]);
  const [selectedAccompaniment, setSelectedAccompaniment] = useState('');
  const [accompanimentQuantity, setAccompanimentQuantity] = useState(1);
  const [promotions, setPromotions] = useState([
    { name: 'Promoción M', price: 8500, size: 'medium' },
    { name: 'Promoción L', price: 12000, size: 'large' },
  ]);
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [selectedPizza, setSelectedPizza] = useState('');
  const [secondHalfPizza, setSecondHalfPizza] = useState('');
  const [size, setSize] = useState('medium');
  const [quantity, setQuantity] = useState(1);
  const [client, setClient] = useState('');
  const [orderType, setOrderType] = useState('local');
  const [orderItems, setOrderItems] = useState([]);

  useEffect(() => {
    if (window.electron && window.electron.invoke) {
      window.electron.invoke('get-pizzas')
        .then((loadedPizzas) => {
          console.log('Pizzas cargadas:', loadedPizzas); // Verifica qué pizzas se cargan
          setPizzas(loadedPizzas);
        })
        .catch((error) => console.error('Error al cargar las pizzas:', error));

      window.electron.invoke('get-accompaniments')
        .then((loadedAccompaniments) => setAccompaniments(loadedAccompaniments))
        .catch((error) => console.error('Error al cargar los acompañamientos:', error));
    } else {
      console.error('window.electron o window.electron.invoke no está definido');
    }
  }, []);

  const handleAddToOrder = (e) => {
    e.preventDefault();
    let price = 0;

    if (selectedPromotion) {
      const promotion = promotions.find((p) => p.name === selectedPromotion);
      if (promotion) {
        const validPizza = pizzas.find(
          (p) => p.Nombre === selectedPizza && p.ingredients.length === 3
        );
        if (!validPizza) {
          alert('La promoción solo aplica a pizzas con exactamente 3 ingredientes.');
          return;
        }

        price = parseFloat(promotion.price);
        setSize(promotion.size);
      }
    } else {
      const firstPizza = pizzas.find((p) => p.Nombre === selectedPizza);
      const secondPizza = pizzas.find((p) => p.Nombre === secondHalfPizza);

      if (firstPizza && secondHalfPizza && size) {
        const firstPrice = size === 'medium' ? parseFloat(firstPizza.PrecioMediano) : parseFloat(firstPizza.PrecioFamiliar);
        const secondPrice = size === 'medium' ? parseFloat(secondPizza.PrecioMediano) : parseFloat(secondPizza.PrecioFamiliar);
        price = ((firstPrice + secondPrice) / 2) * quantity;
      } else if (firstPizza) {
        price = (size === 'medium' ? parseFloat(firstPizza.PrecioMediano) : parseFloat(firstPizza.PrecioFamiliar)) * quantity;
      }
    }

    const newItem = {
      promotion: selectedPromotion || null,
      pizza: selectedPizza,
      secondHalf: secondHalfPizza || null,
      size,
      quantity,
      price,
    };

    setOrderItems((prevItems) => [...prevItems, newItem]);
    setSelectedPizza('');
    setSecondHalfPizza('');
    setSize('medium');
    setQuantity(1);
    setSelectedPromotion('');
  };

  const handleAddAccompanimentToOrder = () => {
    if (!selectedAccompaniment) {
      alert('Selecciona un acompañamiento.');
      return;
    }

    const accompaniment = accompaniments.find((acc) => acc.name === selectedAccompaniment);

    if (accompaniment) {
      const price = accompaniment.price * accompanimentQuantity;
      const newItem = {
        accompaniment: selectedAccompaniment,
        quantity: accompanimentQuantity,
        price,
      };

      setOrderItems((prevItems) => [...prevItems, newItem]);
      setSelectedAccompaniment('');
      setAccompanimentQuantity(1);
    }
  };

  const handleSubmitOrder = () => {
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);
    const orderData = {
      client,
      items: orderItems,
      orderType,
      date: new Date().toLocaleString(),
      total,
    };

    window.electron.send('save-order', orderData);
    window.electron.send('print-receipt', orderData);
    setClient('');
    setOrderItems([]);
    setOrderType('local');
  };

  return (
    <div className="order-form mx-auto max-w-lg">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Tomar Pedido</h2>

      <form onSubmit={handleAddToOrder} className="bg-white p-8 rounded-lg shadow-lg w-full mb-6 border-t-4 border-green-600">
        
        {/* Sección para mostrar las pizzas con imágenes */}
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-4">Seleccionar Pizza:</h3>
          <div className="grid grid-cols-2 gap-4">
            {pizzas.map((pizza) => {
              console.log(`Imagen de pizza ${pizza.Nombre}:`, pizza.image); // Log de la imagen
              return (
                <div key={pizza.Nombre} className="flex flex-col items-center">
                  <img src={pizza.image} alt={pizza.Nombre} className="w-32 h-32 object-cover mb-2 cursor-pointer" onClick={() => setSelectedPizza(pizza.Nombre)} />
                  <span>{pizza.Nombre}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Segunda Mitad (opcional) */}
        <div className="mb-6">
          <label htmlFor="second-half" className="block text-gray-700 font-semibold">Seleccionar Segunda Mitad:</label>
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

        {/* Sección para acompañamientos */}
        <div className="mb-6">
          <label htmlFor="accompaniment" className="block text-gray-700 font-semibold">Seleccionar Acompañamiento:</label>
          <select
            id="accompaniment"
            value={selectedAccompaniment}
            onChange={(e) => setSelectedAccompaniment(e.target.value)}
            className="w-full mt-2 p-3 border border-green-500 rounded-md"
          >
            <option value="">Seleccionar acompañamiento...</option>
            {accompaniments.map((acc) => (
              <option key={acc.name} value={acc.name}>
                {acc.name} - ${acc.price}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={accompanimentQuantity}
            onChange={(e) => setAccompanimentQuantity(e.target.value)}
            min="1"
            className="w-full mt-2 p-3 border border-green-500 rounded-md"
            placeholder="Cantidad"
          />
          <button
            type="button"
            onClick={handleAddAccompanimentToOrder}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg py-2 mt-3 transition duration-200 shadow-md"
          >
            Agregar Acompañamiento al Pedido
          </button>
        </div>

        {/* Tamaño y cantidad de pizza */}
        <div className="mb-6">
          <label htmlFor="size" className="block text-gray-700 font-semibold">Tamaño:</label>
          <select
            id="size"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full mt-2 p-3 border border-green-500 rounded-md"
            required
            disabled={Boolean(selectedPromotion)}
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

      {/* Resumen del pedido */}
      <div className="order-summary bg-gray-100 p-4 rounded-lg shadow-lg">
        <h3 className="text-xl font-bold mb-4">Resumen del Pedido:</h3>
        <ul>
          {orderItems.map((item, index) => (
            <li key={index} className="flex justify-between items-center">
              <span>
                {item.quantity} x {item.pizza || item.accompaniment} {item.secondHalf ? ` / ${item.secondHalf}` : ''} ({item.size || ''}) - ${item.price.toFixed(2)}
              </span>
              <button onClick={() => handleRemoveFromOrder(index)} className="text-red-500 ml-2">Eliminar</button>
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
