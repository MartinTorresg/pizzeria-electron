import React, { useState } from 'react';

function CustomPizza({ onAddCustomPizza, ingredientLimit = null }) {
  const [size, setSize] = useState('medium');
  const [selectedIngredients, setSelectedIngredients] = useState([]);
  const [price, setPrice] = useState(4000); // Precio base para la pizza mediana

  const ingredientPrices = {
    low: 500,
    medium: 1000,
    high: 1900,
    extra: 2500,
  };

  const ingredientsList = [
    { name: 'Aceitunas', category: 'low' },
    { name: 'Cebolla', category: 'low' },
    { name: 'Zapallo Italiano', category: 'low' },
    { name: 'Pimentón', category: 'low' },
    { name: 'Tomate', category: 'low' },
    { name: 'Choclo', category: 'low' },
    { name: 'Salame', category: 'medium' },
    { name: 'Pepperoni', category: 'medium' },
    { name: 'Champiñones', category: 'medium' },
    { name: 'Palmitos', category: 'medium' },
    { name: 'Jamón', category: 'medium' },
    { name: 'Tocino', category: 'medium' },
    { name: 'Longaniza', category: 'medium' },
    { name: 'Espárragos', category: 'medium' },
    { name: 'Queso de Cabra', category: 'medium' },
    { name: 'Rúcula', category: 'medium' },
    { name: 'Piña', category: 'medium' },
    { name: 'Jamón Serrano', category: 'high' },
    { name: 'Pollo', category: 'high' },
    { name: 'Doble Queso', category: 'high' },
    { name: 'Camarones', category: 'extra' },
  ];

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setPrice(newSize === 'medium' ? 4000 : 8000);
  };

  const handleIngredientToggle = (ingredient) => {
    // Solo aplica el límite si ingredientLimit tiene un valor (como 3 para una promoción)
    if (ingredientLimit && selectedIngredients.length >= ingredientLimit && !selectedIngredients.some((ing) => ing.name === ingredient.name)) {
      alert(`Solo puedes seleccionar hasta ${ingredientLimit} ingredientes para esta promoción.`);
      return;
    }

    const isSelected = selectedIngredients.some((ing) => ing.name === ingredient.name);
    let newIngredients;
    let newPrice = price;

    if (isSelected) {
      newIngredients = selectedIngredients.filter((ing) => ing.name !== ingredient.name);
      newPrice -= ingredientPrices[ingredient.category];
    } else {
      newIngredients = [...selectedIngredients, ingredient];
      newPrice += ingredientPrices[ingredient.category];
    }

    setSelectedIngredients(newIngredients);
    setPrice(newPrice);
  };

  // Función para agregar una pizza personalizada
  const handleAddPizza = () => {
    const customPizza = {
      name: `Pizza Personalizada (${size === 'medium' ? 'Mediana' : 'Familiar'})`,
      size,
      ingredients: selectedIngredients.map((ingredient) => ingredient.name), // Asegurarse de que siempre sea un array
      price,
    };
  
    console.log("Custom Pizza creada:", customPizza); // Verificar el contenido de customPizza
  
    onAddCustomPizza(customPizza);
    setSelectedIngredients([]);
    setSize('medium');
    setPrice(4000);
  };
  
  return (
    <div className="custom-pizza p-2 bg-gray-50 rounded shadow-md border border-gray-200 text-sm">
      <h3 className="text-lg font-semibold mb-2 text-center text-red-500">Arma tu Pizza</h3>

      <div className="mb-2 text-center">
        <h4 className="font-medium text-blue-500 mb-1">Elige el Tamaño</h4>
        <div className="flex justify-center space-x-2">
          <button
            onClick={() => handleSizeChange('medium')}
            className={`px-3 py-1 rounded-md font-semibold ${size === 'medium' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
              } transition duration-200`}
          >
            Mediana - $4,000
          </button>
          <button
            onClick={() => handleSizeChange('large')}
            className={`px-3 py-1 rounded-md font-semibold ${size === 'large' ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-700'
              } transition duration-200`}
          >
            Familiar - $8,000
          </button>
        </div>
      </div>

      <div className="mb-2">
        <h4 className="font-medium text-blue-500 mb-1 text-center">Elige tus Ingredientes</h4>
        {Object.keys(ingredientPrices).map((category) => (
          <div key={category} className="mb-1">
            <h5 className="text-xs font-semibold text-yellow-600">${ingredientPrices[category]}</h5>
            <div className="grid grid-cols-2 gap-1">
              {ingredientsList
                .filter((ing) => ing.category === category)
                .map((ingredient) => (
                  <label key={ingredient.name} className="flex items-center bg-gray-100 p-1 rounded-md text-xs">
                    <input
                      type="checkbox"
                      checked={selectedIngredients.some((ing) => ing.name === ingredient.name)}
                      onChange={() => handleIngredientToggle(ingredient)}
                      className="mr-1"
                    />
                    {ingredient.name}
                  </label>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2 text-center">
        <h4 className="text-sm font-medium text-blue-500 mb-1">Precio Total: ${price.toFixed(2)}</h4>
        <button
          onClick={handleAddPizza}
          className="bg-red-400 text-white text-xs py-1 px-4 rounded-md hover:bg-red-500 transition duration-200"
        >
          Agregar Pizza
        </button>
      </div>
    </div>
  );
}

export default CustomPizza;
