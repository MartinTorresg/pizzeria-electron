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
    <div className="client-form p-4">
      <h2 className="text-3xl font-bold mb-6">Agregar Cliente</h2>
      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre"
        className="w-full p-2 mb-4 border rounded"
      />
      
      <div className="flex items-center mb-4">
        <span className="p-2 bg-gray-200 border border-r-0 rounded-l text-gray-700">+569</span>
        <input
          type="text"
          value={numero.replace('+569', '')}
          onChange={(e) => setNumero(`+569${e.target.value}`)}
          placeholder="Número"
          className="w-full p-2 border border-l-0 rounded-r"
        />
      </div>
      
      <input
        type="text"
        value={direccion}
        onChange={(e) => setDireccion(e.target.value)}
        placeholder="Dirección"
        className="w-full p-2 mb-4 border rounded"
      />
      <button
        onClick={handleSubmit}
        className="w-full bg-blue-500 text-white p-2 mt-4 rounded">
        Guardar Cliente
      </button>

      {errorMessage && (
        <div className="mt-4 p-2 text-red-600 bg-red-100 border border-red-400 rounded">
          {errorMessage}
        </div>
      )}
    </div>
  );
}

export default ClientForm;
