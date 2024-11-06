import React, { useState, useEffect } from 'react';
import ClientForm from './ClientForm';

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
  const [validPizzas, setValidPizzas] = useState([]);
  const [total, setTotal] = useState(0);
  const [showClientForm, setShowClientForm] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState({ nombre: 'No especificado', numero: 'No especificado' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (window.electron && window.electron.invoke) {
          const loadedPizzas = await window.electron.invoke('get-pizzas');
          setPizzas(loadedPizzas);
          console.log('Pizzas cargadas:', loadedPizzas);

          const loadedAccompaniments = await window.electron.invoke('get-accompaniments');
          setAccompaniments(loadedAccompaniments);
          console.log('Acompañamientos cargados:', loadedAccompaniments);

          // Cargar clientes
          const loadedClients = await window.electron.invoke('get-clients');
          setClients(loadedClients);
          console.log('Clientes cargados:', loadedClients);
        }
      } catch (error) {
        console.error('Error al cargar los datos:', error);
      }
    };

    fetchData();

    const fetchClients = async () => {
      if (window.electron && window.electron.invoke) {
        const loadedClients = await window.electron.invoke('get-clients');
        setClients(loadedClients);
      }
    };
    fetchClients();
  }, []);

  const handleClientSelection = (event) => {
    const selectedId = event.target.value;
    setSelectedClientId(selectedId);
    const selectedClient = clients.find(client => client.id === selectedId);
    if (selectedClient) {
      setClientInfo({ nombre: selectedClient.nombre, numero: selectedClient.numero });
    } else {
      setClientInfo({ nombre: 'No especificado', numero: 'No especificado' });
    }
  };

  const handleAddAccompanimentToOrder = () => {
    console.log('Intentando agregar acompañamiento...');
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

    console.log('Nuevo acompañamiento agregado:', newAccompanimentItem);
    setOrderItems((prevItems) => [...prevItems, newAccompanimentItem]);
    setTotal((prevTotal) => prevTotal + newAccompanimentItem.price); // Agregar al total
    setSelectedAccompaniment('');
    setAccompanimentQuantity(1);
  };

  const handlePromotionChange = (promotion) => {
    console.log('Promoción seleccionada:', promotion);
    setSelectedPromotion(promotion);

    const filteredPizzas = pizzas.filter(pizza => {
      const ingredientsCount = pizza.ingredients.length;
      return promotion === 'promoM' ? ingredientsCount === 3 : promotion === 'promoL' && ingredientsCount >= 2;
    });

    console.log('Pizzas válidas según la promoción:', filteredPizzas);
    setValidPizzas(filteredPizzas);
    setSelectedPizza(''); // Resetear pizza seleccionada si cambian las validaciones
  };

  const handleAddPizzaToOrder = () => {
    console.log('Intentando agregar pizza...');
    if (!selectedPizza) {
      alert('Por favor selecciona una pizza.');
      return;
    }

    const newItem = {
      pizza: selectedPizza,
      secondHalf: isHalfPizza ? secondHalfPizza : null,
      size,
      quantity,
      price: calculatePrice(), // Este calculará el precio de acuerdo al tamaño de la pizza
      promotion: selectedPromotion || null,
    };

    console.log('Nuevo item de pizza agregado:', newItem);

    setOrderItems((prevItems) => {
      const updatedItems = [...prevItems, newItem];

      // Agregar acompañamientos automáticamente si hay promoción
      if (selectedPromotion) {
        const accompanimentItem = accompaniments.find(acc => acc.name === 'PALITOS DE AJO');
        if (accompanimentItem) {
          updatedItems.push({
            accompaniment: accompanimentItem.name,
            quantity: 1,
            price: accompanimentItem.price,
          });
          console.log('Acompañamiento agregado con promoción:', accompanimentItem);
        }
        // Agregar bebida
        updatedItems.push({
          accompaniment: 'BEBIDA',
          quantity: 1,
          price: 2500, // Cambia el precio a 2500
        });
        console.log('Bebida agregada con promoción');
      }

      // Ajustar el total considerando el precio acumulado más el descuento
      const baseTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
      if (selectedPromotion === 'promoM') {
        setTotal(baseTotal >= 8500 ? 8500 : baseTotal); // Solo aplica el límite si es mayor
        console.log('Total ajustado para promoM:', 8500);
      } else if (selectedPromotion === 'promoL') {
        setTotal(baseTotal >= 12500 ? 12500 : baseTotal); // Solo aplica el límite si es mayor
        console.log('Total ajustado para promoL:', 12500);
      } else {
        setTotal(baseTotal); // Sin promoción, suma normal
        console.log('Total actualizado:', baseTotal);
      }

      return updatedItems;
    });

    resetForm();
  };

  const handleRemoveFromOrder = (index) => {
    setOrderItems((prevItems) => {
      const updatedItems = prevItems.filter((_, i) => i !== index);
      const baseTotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

      if (selectedPromotion === 'promoM') {
        setTotal(baseTotal >= 8500 ? 8500 : baseTotal);
      } else if (selectedPromotion === 'promoL') {
        setTotal(baseTotal >= 12500 ? 12500 : baseTotal);
      } else {
        setTotal(baseTotal);
      }

      console.log(`Elemento eliminado. Nuevo total: ${baseTotal}`);
      return updatedItems;
    });
  };

  const resetForm = () => {
    console.log('Reseteando formulario...');
    setSelectedPizza('');
    setSecondHalfPizza('');
    setSize('medium');
    setQuantity(1);
    setIsHalfPizza(false);
    setSelectedPromotion('');
    setValidPizzas([]);
  };

  const calculatePrice = () => {
    console.log('Calculando precio...');
    const pizza = pizzas.find(p => p.Nombre === selectedPizza);
    if (!pizza) {
      console.log('Pizza no encontrada');
      return 0;
    }

    const basePrice = size === 'medium' ? pizza.PrecioMediano : pizza.PrecioFamiliar;
    const totalPrice = parseFloat(basePrice) * quantity;
    console.log('Precio calculado:', totalPrice);
    return totalPrice;
  };

  // Función para enviar el pedido
  const handleSubmitOrder = () => {
    const orderData = {
      client: client, // aquí enviamos el cliente seleccionado
      items: orderItems,
      orderType,
      date: new Date().toLocaleString(),
      total,
      promotion: selectedPromotion
    };

    console.log("Datos del pedido a enviar:", orderData);
    console.log("Cliente en el pedido:", orderData.client);

    // Aquí enviamos los datos del pedido a través de Electron
    window.electron.send('save-order', orderData);
    window.electron.send('print-receipt', orderData);

    // Restablecemos los valores
    setClient({ nombre: "", numero: "" });
    setOrderItems([]);
    setTotal(0);
  };

  console.log('Valor total del pedido:', total);

  if (selectedPromotion === 'promoL' && total !== 12500) {
    console.log('Error en el cálculo de promoción: el total debería ser 12500.');
  }

  return (
    <div className="order-form mx-auto p-4">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Tomar Pedido</h2>

      {/* Botón para agregar cliente */}
      <button
        onClick={() => setShowClientForm(!showClientForm)}
        className="bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg py-2 px-4 mb-4 transition duration-200"
      >
        {showClientForm ? 'Cerrar Formulario de Cliente' : 'Agregar Cliente'}
      </button>

      {/* Mostrar el formulario de cliente si showClientForm es true */}
      {showClientForm && <ClientForm />}

      <div className="grid grid-cols-2 gap-4">
        {/* Primera columna: Selección de Promoción, Tamaño y Pizza */}
        <div className="col-span-1">
          {/* Selector de Promoción */}
          <label className="block text-gray-700 font-semibold mb-2">Seleccionar Promoción:</label>
          <select value={selectedPromotion} onChange={(e) => handlePromotionChange(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-4">
            <option value="">Seleccionar promoción...</option>
            <option value="promoM">Promo M</option>
            <option value="promoL">Promo L</option>
          </select>

          <label className="block text-gray-700 font-semibold mb-2">Seleccionar Tamaño:</label>
          <select value={size} onChange={(e) => setSize(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-4">
            <option value="medium">Mediana</option>
            <option value="large">Familiar</option>
          </select>

          <div>
            <h3 className="text-xl font-semibold mb-4">Seleccionar Pizza:</h3>
            <select value={selectedPizza} onChange={(e) => setSelectedPizza(e.target.value)} className="w-full p-2 border border-green-500 rounded-md mb-4">
              <option value="">Seleccionar pizza...</option>
              {validPizzas.length > 0 ? validPizzas.map((pizza) => (
                <option key={pizza.Nombre} value={pizza.Nombre}>
                  {pizza.Nombre}
                </option>
              )) : pizzas.map((pizza) => (
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
          <table className="min-w-full bg-white shadow-md rounded-lg">
            <tbody>
              <tr>
                <td className="py-2 px-4 font-bold">Total a pagar:</td>
                <td className="py-2 px-4">${total.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div className="client-selection mb-4">
            <label className="block text-gray-700 font-semibold mb-2">Seleccionar Cliente:</label>
            <select
              value={selectedClientId}
              onChange={handleClientSelection}
              className="w-full p-2 border border-green-500 rounded-md"
            >
              <option value="">Seleccionar cliente...</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.nombre} - {client.numero}
                </option>
              ))}
            </select>
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
