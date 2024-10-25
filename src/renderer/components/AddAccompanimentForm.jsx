import React, { useState, useEffect } from 'react';

function AddAccompanimentForm() {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [accompaniments, setAccompaniments] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    window.electron.invoke('get-accompaniments')
      .then((loadedAccompaniments) => {
        console.log('Acompañamientos cargados:', loadedAccompaniments);
        setAccompaniments(loadedAccompaniments);
      })
      .catch((error) => {
        console.error('Error al cargar los acompañamientos:', error);
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name || !price) {
      setMessage('Por favor, rellena todos los campos');
      return;
    }

    const newAccompaniment = {
      name,
      price: parseFloat(price),
    };

    window.electron.send('add-accompaniment', newAccompaniment);
    setMessage('Acompañamiento agregado con éxito');
    setAccompaniments([...accompaniments, newAccompaniment]);

    setName('');
    setPrice('');
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mb-6 border-t-4 border-green-500">
      <h2 className="text-3xl font-bold mb-4 text-center text-green-600">Agregar Nuevo Acompañamiento</h2>

      {message && (
        <p className={`text-center mb-4 ${message.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>
          {message}
        </p>
      )}

      <div className="mb-4">
        <label htmlFor="name" className="block text-gray-700">Nombre del Acompañamiento:</label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-1 p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          required
        />
      </div>

      <div className="mb-4">
        <label htmlFor="price" className="block text-gray-700">Precio:</label>
        <input
          type="number"
          id="price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="w-full mt-1 p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
          step="0.01"
          required
        />
      </div>

      <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-2 transition duration-200">
        Agregar Acompañamiento
      </button>
    </form>
  );
}

export default AddAccompanimentForm;
