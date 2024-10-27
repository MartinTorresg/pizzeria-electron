import React, { useState, useEffect } from 'react';

function OrderForm() {
  const [pizzas, setPizzas] = useState([]);
  const [accompaniments, setAccompaniments] = useState([]);
  const [selectedAccompaniment, setSelectedAccompaniment] = useState('');
  const [accompanimentQuantity, setAccompanimentQuantity] = useState(1);
  const [selectedPizza, setSelectedPizza] = useState('');
  const [secondHalfPizza, setSecondHalfPizza] = useState('');
  const [size, setSize] = useState('medium');
  const [quantity, setQuantity] = useState(1);
  const [client, setClient] = useState('');
  const [orderItems, setOrderItems] = useState([]);
  const [isHalfPizza, setIsHalfPizza] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState('');
  const [orderType, setOrderType] = useState('local');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (window.electron && window.electron.invoke) {
          const loadedPizzas = await window.electron.invoke('get-pizzas');
          setPizzas(loadedPizzas);

          const loadedAccompaniments = await window.electron.invoke('get-accompaniments');
          setAccompaniments(loadedAccompaniments);
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();
  }, []);

  const handleAddPizzaToOrder = () => {
    if (!selectedPizza) {
      alert('Por favor selecciona una pizza.');
      return;
    }

    const newItem = {
      pizza: selectedPizza,
      secondHalf: isHalfPizza ? secondHalfPizza : null,
      size,
      quantity,
      price: calculatePrice(),
      promotion: selectedPromotion || null,
    };

    setOrderItems((prevItems) => [...prevItems, newItem]);
    resetForm();
  };

  const resetForm = () => {
    setSelectedPizza('');
    setSecondHalfPizza('');
    setSize('medium');
    setQuantity(1);
    setIsHalfPizza(false);
    setSelectedPromotion('');
  };

  const calculatePrice = () => {
    const pizza = pizzas.find(p => p.Nombre === selectedPizza);
    if (!pizza) return 0;

    const basePrice = size === 'medium' ? pizza.PrecioMediano : pizza.PrecioFamiliar;
    return parseFloat(basePrice) * quantity;
  };

  const handleAddAccompanimentToOrder = () => {
    if (!selectedAccompaniment) {
      alert('Por favor selecciona un acompañamiento.');
      return;
    }

    const accompaniment = accompaniments.find(acc => acc.name === selectedAccompaniment);
    if (!accompaniment) {
      alert('Acompañamiento no encontrado.');
      return;
    }

    const newAccompanimentItem = {
      accompaniment: accompaniment.name,
      quantity: accompanimentQuantity,
      price: accompaniment.price * accompanimentQuantity,
    };

    setOrderItems((prevItems) => [...prevItems, newAccompanimentItem]);
    setSelectedAccompaniment('');
    setAccompanimentQuantity(1);
  };

  const handleRemoveFromOrder = (index) => {
    setOrderItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const handleSubmitOrder = () => {
    const total = orderItems.reduce((sum, item) => sum + item.price, 0);
    const iva = total * 0.19; // Suponiendo que el IVA es del 19%
    const orderData = {
      client,
      items: orderItems,
      orderType,
      date: new Date().toLocaleString(),
      total,
      iva: iva.toFixed(2), // Añadir IVA al objeto
    };

    window.electron.send('save-order', orderData);
    window.electron.send('print-receipt', orderData);
    setClient('');
    setOrderItems([]);
  };

  return (
    <div className="order-form mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Tomar Pedido</h2>

      <div className="grid grid-cols-2 gap-4">
        {/* Primera columna: Selección de Tamaño y Pizza */}
        <div className="col-span-1">
          <label className="block text-gray-700 font-semibold mb-2">Seleccionar Tamaño:</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-4">
            <option value="medium">Mediana</option>
            <option value="large">Familiar</option>
          </select>

          <div>
            <h3 className="text-xl font-semibold mb-4">Seleccionar Pizza:</h3>
            <select value={selectedPizza} onChange={(e) => setSelectedPizza(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-4">
              <option value="">Seleccionar pizza...</option>
              {pizzas.map((pizza) => (
                <option key={pizza.Nombre} value={pizza.Nombre}>
                  {pizza.Nombre}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() => setIsHalfPizza(!isHalfPizza)}
            className={`w-full ${isHalfPizza ? 'bg-red-500' : 'bg-yellow-500'} hover:bg-yellow-600 text-white font-semibold rounded-lg py-2 transition duration-200`}
          >
            {isHalfPizza ? 'Quitar opción de mitades' : 'Agregar opción de mitades'}
          </button>

          {isHalfPizza && (
            <div className="mt-4">
              <label className="block text-gray-700 font-semibold mb-2">Seleccionar Segunda Mitad:</label>
              <select value={secondHalfPizza} onChange={(e) => setSecondHalfPizza(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-4">
                <option value="">Seleccionar segunda mitad...</option>
                {pizzas.map((pizza) => (
                  <option key={pizza.Nombre} value={pizza.Nombre}>
                    {pizza.Nombre}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="block text-gray-700 font-semibold mb-2">Cantidad:</label>
          <input
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            min="1"
            className="w-full p-2 border border-green-500 rounded-md mb-4"
          />

          <button
            onClick={handleAddPizzaToOrder}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-3 transition duration-200 shadow-md">
            Agregar Pizza al Pedido
          </button>
        </div>

        {/* Segunda columna: Acompañamientos y Resumen del Pedido */}
        <div className="col-span-1">
          <h3 className="text-xl font-semibold mb-4">Seleccionar Acompañamiento:</h3>
          <select value={selectedAccompaniment} onChange={(e) => setSelectedAccompaniment(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-2">
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
            onChange={(e) => setAccompanimentQuantity(Number(e.target.value))}
            min="1"
            className="w-full p-2 border border-green-500 rounded-md mb-2"
            placeholder="Cantidad"
          />
          <button
            type="button"
            onClick={handleAddAccompanimentToOrder}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold rounded-lg py-2 transition duration-200">
            Agregar Acompañamiento
          </button>

          {/* Tipo de Pedido */}
          <h3 className="text-xl font-semibold mt-6 mb-2">Tipo de Pedido:</h3>
          <select value={orderType} onChange={(e) => setOrderType(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-4">
            <option value="local">Comer en el local</option>
            <option value="delivery">Delivery</option>
            <option value="takeaway">Retiro en el local</option>
          </select>

          {/* Resumen del Pedido */}
          <h3 className="text-xl font-semibold mt-6 mb-2">Resumen del Pedido:</h3>
          <div className="bg-gray-100 p-4 rounded-lg shadow-lg mb-4">
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
          </div>
          <p className="text-xl font-bold mt-4">
            Total: ${orderItems.reduce((sum, item) => sum + item.price, 0).toFixed(2)}
          </p>
          <p className="text-xl font-bold mt-4">
            IVA (19%): ${(orderItems.reduce((sum, item) => sum + item.price, 0) * 0.19).toFixed(2)}
          </p>
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
          </div>
          <button
            onClick={handleSubmitOrder}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg py-3 mt-4 transition duration-200 shadow-md">
            Guardar Pedido e Imprimir Boleta
          </button>
        </div>
      </div>
    </div>
  );
}

export default OrderForm;
