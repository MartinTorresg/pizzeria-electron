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

  useEffect(() => {
    loadIngredientData();
  }, []);

  const loadIngredientData = async () => {
    const orders = await window.electron.invoke('load-orders');
    const ingredientCount = countIngredients(orders);
    setIngredientData(ingredientCount);
  };

  const countIngredients = (orders) => {
    const ingredientCount = {};
  
    orders.forEach((order) => {
      order.items.forEach((item) => {
        // Asegurarse de que `item.ingredients` sea una cadena antes de dividir
        if (typeof item.ingredients === 'string' && item.ingredients.length > 0) {
          item.ingredients.split(',').forEach((ingredient) => {
            ingredient = ingredient.trim().toLowerCase(); // Normalizar el nombre del ingrediente
            ingredientCount[ingredient] = (ingredientCount[ingredient] || 0) + 1;
          });
        }
      });
    });
  
    return Object.entries(ingredientCount).map(([ingredient, count]) => ({
      ingredient,
      count,
    }));
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

      <div style={{ width: '100%', height: '400px' }}>
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { position: 'top' },
              title: { display: true, text: 'Ingredientes más Utilizados' },
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
