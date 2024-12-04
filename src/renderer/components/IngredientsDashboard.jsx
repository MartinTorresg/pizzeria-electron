import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function IngredientsDashboard() {
  const [ingredientData, setIngredientData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // Estado para seleccionar el mes actual

  useEffect(() => {
    loadIngredientData();
  }, [selectedMonth]); // Dependencia de mes seleccionado

  const loadIngredientData = async () => {
    const orders = await window.electron.invoke('load-orders');
    const ingredientCount = countIngredientsByMonth(orders, selectedMonth);
    setIngredientData(ingredientCount);
  };

  const countIngredientsByMonth = (orders, selectedMonth) => {
    const ingredientCountByMonth = {};
  
    orders.forEach((order) => {
      const orderDate = new Date(order.date.split(',')[0].split('-').reverse().join('-')); // Convertir la fecha en un objeto Date
      const orderMonth = orderDate.getMonth(); // Obtener el mes de la fecha
  
      if (orderMonth === selectedMonth) { // Filtrar solo los pedidos del mes seleccionado
        order.items.forEach((item) => {
          // Asegurarse de que `item.ingredients` sea una cadena antes de dividir
          if (typeof item.ingredients === 'string' && item.ingredients.length > 0) {
            item.ingredients.split(',').forEach((ingredient) => {
              ingredient = ingredient.trim().toLowerCase(); // Normalizar el nombre del ingrediente
              ingredientCountByMonth[ingredient] = (ingredientCountByMonth[ingredient] || 0) + 1;
            });
          }
        });
      }
    });
  
    // Convertir el objeto en un arreglo y ordenar por cantidad en orden descendente
    return Object.entries(ingredientCountByMonth)
      .map(([ingredient, count]) => ({
        ingredient,
        count,
      }))
      .sort((a, b) => b.count - a.count); // Ordenar de mayor a menor
  };

  const chartData = {
    labels: ingredientData.map(data => data.ingredient),
    datasets: [
      {
        label: 'Cantidad de Uso de Ingredientes',
        data: ingredientData.map(data => data.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  return (
    <div className="ingredients-dashboard mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Dashboard de Ingredientes</h2>

      {/* Selector de mes */}
      <div className="mb-4">
        <label className="block font-semibold">Seleccionar Mes:</label>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>
      </div>

      <div style={{ width: '100%', height: '400px' }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: `Ingredientes más Utilizados - ${['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][selectedMonth]}` },
            },
          }}
        />
      </div>

      <div className="bg-gray-100 p-4 rounded-lg shadow-md mt-6">
        <h3 className="text-xl font-semibold mb-4">Ingredientes más Usados</h3>
        <ul>
          {ingredientData.map((data, index) => (
            <li key={index} className="flex justify-between">
              <span>{data.ingredient}</span>
              <span className="font-bold">{data.count}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default IngredientsDashboard;
