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

function DateSalesDashboard() {
  const [salesData, setSalesData] = useState({});
  const [filter, setFilter] = useState('daily');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchSalesData();
  }, [startDate, endDate, filter]); // Asegúrate de que la función se ejecute cuando cambian los filtros

  const fetchSalesData = async () => {
    const orders = await window.electron.invoke('load-orders');
    const groupedSales = groupSalesByDate(orders, filter);
    setSalesData(groupedSales);
  };

  const groupSalesByDate = (sales, filter) => {
    const salesByDate = {};

    sales.forEach(order => {
      const dateParts = order.date.split(', ')[0].split('-'); // Separar por coma y luego por guiones
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`; // Cambiar a 'YYYY-MM-DD'
      const date = new Date(formattedDate);

      if (isNaN(date)) {
        console.error('Fecha inválida encontrada en el pedido:', order);
        return; // Salir si la fecha es inválida
      }

      // Filtrar por rango de fechas o por el día actual
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Establecer a medianoche para comparación
      if (filter === 'daily' && date.toDateString() !== today.toDateString()) {
        return; // Si no es el día actual, no lo incluimos
      } else if (startDate && date < new Date(startDate)) {
        return; // Si está fuera del rango, no lo incluimos
      } else if (endDate && date > new Date(endDate)) {
        return; // Si está fuera del rango, no lo incluimos
      }

      let dateKey;
      if (filter === 'daily') {
        dateKey = date.toISOString().split('T')[0]; // Usar solo la parte de la fecha
      } else if (filter === 'weekly') {
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay())); // Inicio de la semana
        dateKey = weekStart.toISOString().split('T')[0]; // Usar el inicio de la semana
      } else if (filter === 'monthly') {
        dateKey = `${date.getFullYear()}-${date.getMonth() + 1}`; // Usar año y mes
      }

      if (!salesByDate[dateKey]) {
        salesByDate[dateKey] = []; // Inicializa el array si no existe
      }

      salesByDate[dateKey].push(order); // Agregar la orden a la fecha correspondiente
    });

    return salesByDate;
  };

  // Preparar datos para el gráfico
  const chartData = {
    labels: Object.keys(salesData),
    datasets: [{
      label: 'Ventas por Fecha',
      data: Object.keys(salesData).map(date => {
        return salesData[date].reduce((sum, order) => sum + order.total, 0);
      }),
      backgroundColor: 'rgba(75, 192, 192, 0.5)',
      borderColor: 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
    }],
  };

  return (
    <div className="date-sales-dashboard">
      <h2 className="text-2xl font-bold">Dashboard de Ventas por Fecha</h2>
      <label className="block mb-2">Filtrar por:</label>
      <select value={filter} onChange={(e) => {
        setFilter(e.target.value);
        fetchSalesData(); // Refrescar los datos al cambiar el filtro
      }} className="mb-4">
        <option value="daily">Diario</option>
        <option value="weekly">Semanal</option>
        <option value="monthly">Mensual</option>
      </select>

      <div className="mb-4">
        <label>Desde:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border rounded p-2 mr-2" />
        <label>Hasta:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="border rounded p-2" />
      </div>

      <div style={{ width: '80%', height: '300px', margin: '0 auto' }}>
        <Bar data={chartData} options={{
          responsive: true,
          maintainAspectRatio: false,
        }} />
      </div>

      <ul>
        {Object.keys(salesData).map(date => {
          const totalForDate = salesData[date].reduce((sum, order) => sum + order.total, 0);
          return (
            <li key={date}>
              {date}: ${totalForDate.toFixed(2)}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default DateSalesDashboard;
