import React, { useState, useEffect } from 'react';

function ClientList() {
  const [clients, setClients] = useState([]); // Asegúrate de iniciar la lista como un array vacío
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadClients = async () => {
      try {
        if (window.electron && window.electron.invoke) {
          const loadedClients = await window.electron.invoke('get-clients'); // Invocar el evento que carga los clientes
          setClients(loadedClients || []); // Establece los clientes o un array vacío si es undefined
        }
      } catch (error) {
        console.error('Error al cargar clientes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  if (loading) {
    return <div>Cargando clientes...</div>;
  }

  if (!clients || clients.length === 0) {
    return <div>No hay clientes para mostrar.</div>;
  }

  return (
    <div className="client-list p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Clientes</h2>
      <table className="w-full table-auto border-collapse">
        <thead>
          <tr>
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">Número</th>
            <th className="border px-4 py-2">Dirección</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{client.nombre}</td>
              <td className="border px-4 py-2">{client.numero}</td>
              <td className="border px-4 py-2">{client.direccion}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ClientList;
