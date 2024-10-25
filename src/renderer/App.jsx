import React, { useState } from 'react';
import OrderForm from './components/OrderForm';
import AddPizzaForm from './components/AddPizzaForm';
import OrdersList from './components/OrdersList';
import SalesDashboard from './components/SalesDashboard'; // Importa el dashboard de ventas
import FinanceDashboard from './components/FinanceDashboard'; // Importa el dashboard de finanzas
import AddAccompanimentForm from './components/AddAccompanimentForm'; // Asegúrate de tener este componente

function App() {
  const [currentComponent, setCurrentComponent] = useState(<OrderForm pizzas={[]} />);
  const [pizzas, setPizzas] = useState([]);
  const [accompaniments, setAccompaniments] = useState([]); // Estado para acompañamientos

  const handleAddPizza = (newPizza) => {
    setPizzas([...pizzas, newPizza]);
  };

  const handleAddAccompaniment = (newAccompaniment) => {
    setAccompaniments([...accompaniments, newAccompaniment]);
  };

  const renderComponent = (component) => {
    setCurrentComponent(component);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-green-700 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between">
          <div className="space-x-4">
            <button
              className="hover:bg-red-500 p-2 rounded transition duration-200 bg-red-400 text-white font-bold"
              onClick={() => renderComponent(<OrderForm pizzas={pizzas} accompaniments={accompaniments} />)} // Pasar acompañamientos
            >
              Tomar Pedido
            </button>
            <button
              className="hover:bg-green-600 p-2 rounded transition duration-200 bg-green-500 text-white font-bold"
              onClick={() => renderComponent(<AddPizzaForm onAddPizza={handleAddPizza} />)}
            >
              Agregar Pizza
            </button>
            <button
              className="hover:bg-yellow-600 p-2 rounded transition duration-200 bg-yellow-500 text-white font-bold"
              onClick={() => renderComponent(<AddAccompanimentForm onAddAccompaniment={handleAddAccompaniment} />)} // Botón para agregar acompañamientos
            >
              Agregar Acompañamiento
            </button>
            <button
              className="hover:bg-blue-600 p-2 rounded transition duration-200 bg-blue-500 text-white font-bold"
              onClick={() => renderComponent(<OrdersList />)}
            >
              Ver Pedidos
            </button>
            <button
              className="hover:bg-purple-600 p-2 rounded transition duration-200 bg-purple-500 text-white font-bold"
              onClick={() => renderComponent(<SalesDashboard />)}
            >
              Dashboard de Ventas
            </button>
            <button
              className="hover:bg-orange-600 p-2 rounded transition duration-200 bg-orange-500 text-white font-bold"
              onClick={() => renderComponent(<FinanceDashboard />)}
            >
              Dashboard de Finanzas
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow flex justify-center items-start px-4 mt-4">
        <div className="w-full">{currentComponent}</div>
      </main>
    </div>
  );
}

export default App;
