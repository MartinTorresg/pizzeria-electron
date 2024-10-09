import React, { useState } from 'react';

function AddPizzaForm({ onAddPizza }) {
  const [name, setName] = useState('');
  const [mediumPrice, setMediumPrice] = useState('');
  const [largePrice, setLargePrice] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    const newPizza = {
      name,
      prices: {
        medium: parseFloat(mediumPrice),
        large: parseFloat(largePrice),
      },
    };

    onAddPizza(newPizza);

    setName('');
    setMediumPrice('');
    setLargePrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg mb-6 border-t-4 border-green-600">
      <h2 className="text-3xl font-bold mb-6 text-center text-green-700">Agregar Nueva Pizza</h2>

      <div className="mb-6">
        <label htmlFor="name" className="block text-gray-700 font-semibold">Nombre de la Pizza:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-2 p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="Nombre de la pizza"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="mediumPrice" className="block text-gray-700 font-semibold">Precio Mediano:</label>
        <input
          type="number"
          id="mediumPrice"
          value={mediumPrice}
          onChange={(e) => setMediumPrice(e.target.value)}
          className="w-full mt-2 p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="Precio para tamaño mediano"
          step="0.01"
          required
        />
      </div>

      <div className="mb-6">
        <label htmlFor="largePrice" className="block text-gray-700 font-semibold">Precio Familiar:</label>
        <input
          type="number"
          id="largePrice"
          value={largePrice}
          onChange={(e) => setLargePrice(e.target.value)}
          className="w-full mt-2 p-3 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          placeholder="Precio para tamaño familiar"
          step="0.01"
          required
        />
      </div>

      <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-3 transition duration-200 shadow-md">
        Agregar Pizza
      </button>
    </form>
  );
}

export default AddPizzaForm;
