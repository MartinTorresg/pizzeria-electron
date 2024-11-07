import React, { useState } from 'react';

function ClientForm() {
  const [nombre, setNombre] = useState('');
  const [numero, setNumero] = useState('+569');
  const [direccion, setDireccion] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = () => {
    if (!nombre || !numero || !direccion) {
      setErrorMessage('Por favor, completa todos los campos.');
      return;
    }

    const newClient = { nombre, numero, direccion };
    setErrorMessage(''); // Limpiar el mensaje de error antes de enviar

    window.electron.send('add-client', newClient);

    const handleClientAdded = () => {
      setErrorMessage('');
      alert('Cliente agregado exitosamente.');
      setNombre('');
      setNumero('+569');
      setDireccion('');
      window.electron.removeListener('client-added', handleClientAdded);
    };

    const handleClientError = (message) => {
      setErrorMessage(message);
      window.electron.removeListener('client-error', handleClientError);
    };

    window.electron.on('client-added', handleClientAdded);
    window.electron.on('client-error', handleClientError);
  };

  return (
    <div className="client-form bg-gray-100 p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4 text-center text-gray-700">Agregar Cliente</h2>

      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      />

      <div className="flex items-center mb-3">
        <span className="p-2 bg-gray-200 border border-r-0 rounded-l text-gray-700">+569</span>
        <input
          type="text"
          value={numero.replace('+569', '')}
          onChange={(e) => setNumero(`+569${e.target.value}`)}
          placeholder="Número"
          className="w-full p-2 border border-l-0 border-gray-300 rounded-r focus:outline-none focus:border-blue-500"
        />
      </div>

      <input
        type="text"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        placeholder="Dirección"
        className="w-full p-2 mb-3 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
      />

      <button
        onClick={handleSubmit}
        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold p-2 rounded transition duration-200">
        Guardar Cliente
      </button>

      {errorMessage && (
        <div className="mt-3 p-2 text-red-600 bg-red-100 border border-red-400 rounded text-sm">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default ClientForm;
