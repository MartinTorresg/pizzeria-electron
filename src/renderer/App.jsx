import React, { useState } from 'react';
import OrderForm from './components/OrderForm';
import AddPizzaForm from './components/AddPizzaForm';

function App() {
  const [currentComponent, setCurrentComponent] = useState(<OrderForm pizzas={[]} />);
  const [pizzas, setPizzas] = useState([]);

  const handleAddPizza = (newPizza) => {
    setPizzas([...pizzas, newPizza]);
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
              onClick={() => renderComponent(<OrderForm pizzas={pizzas} />)}
            >
              Tomar Pedido
            </button>
            <button
              className="hover:bg-green-600 p-2 rounded transition duration-200 bg-green-500 text-white font-bold"
              onClick={() => renderComponent(<AddPizzaForm onAddPizza={handleAddPizza} />)}
            >
              Agregar Pizza
            </button>
          </div>
        </div>
      </header>

      {/* Contenedor principal con más tamaño y mejor centrado */}
      <main className="flex-grow flex justify-center items-center px-4">
        <div className="max-w-3xl w-full">{currentComponent}</div> {/* Cambiado a max-w-3xl */}
      </main>
    </div>
  );
}

export default App;
