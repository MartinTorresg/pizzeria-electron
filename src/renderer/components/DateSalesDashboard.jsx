import React, { useState, useEffect } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

function DateSalesDashboard() {
  const [salesData, setSalesData] = useState({});
  const [filter, setFilter] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    fetchSalesData();
  }, [selectedMonth, selectedYear, filter]);

  const fetchSalesData = async () => {
    const orders = await window.electron.invoke('load-orders');
    const groupedSales = groupSalesByDate(orders, filter);
    setSalesData(groupedSales);
  };

  const groupSalesByDate = (sales, filter) => {
    const salesByDate = {};

    sales.forEach(order => {
      const dateParts = order.date.split(', ')[0].split('-');
      const formattedDate = `${dateParts[2]}-${dateParts[1]}-${dateParts[0]}`;
      const date = new Date(formattedDate);

      if (isNaN(date)) return;

      let dateKey;
      if (filter === 'monthly') {
        const year = date.getFullYear().toString();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');

        if (selectedYear && year !== selectedYear) return;
        if (selectedMonth && month !== selectedMonth) return;

        // Generar una clave diaria para ver el progreso por día en el mes seleccionado
        dateKey = `${year}-${month}-${day}`;
      }

      if (!salesByDate[dateKey]) salesByDate[dateKey] = [];
      salesByDate[dateKey].push(order);
    });

    return salesByDate;
  };

  const chartData = {
    labels: Object.keys(salesData),
    datasets: [{
      label: 'Ventas por Fecha',
      data: Object.keys(salesData).map(date =>
        salesData[date].reduce((sum, order) => sum + order.total, 0)
      ),
      backgroundColor: selectedMonth ? 'rgba(153, 102, 255, 0.5)' : 'rgba(75, 192, 192, 0.5)',
      borderColor: selectedMonth ? 'rgba(153, 102, 255, 1)' : 'rgba(75, 192, 192, 1)',
      borderWidth: 1,
      fill: selectedMonth ? false : true,
    }],
  };

  return (
    <div className="date-sales-dashboard mx-auto max-w-3xl p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-6">Dashboard de Ventas por Fecha</h2>
      
      {/* Filtros de Mes y Año */}
      <div className="flex flex-col md:flex-row md:justify-between mb-6">
        <div className="mb-4 md:mb-0">
          <label className="block font-semibold mb-2">Filtrar por:</label>
        </div>
        
        <div className="flex flex-col md:flex-row md:space-x-4">
          <div>
            <label className="block font-semibold mb-2">Mes:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded px-3 py-2"
            >
              <option value="">Todos</option>
              <option value="01">Enero</option>
              <option value="02">Febrero</option>
              <option value="03">Marzo</option>
              <option value="04">Abril</option>
              <option value="05">Mayo</option>
              <option value="06">Junio</option>
              <option value="07">Julio</option>
              <option value="08">Agosto</option>
              <option value="09">Septiembre</option>
              <option value="10">Octubre</option>
              <option value="11">Noviembre</option>
              <option value="12">Diciembre</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold mb-2">Año:</label>
            <input
              type="number"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              placeholder="Ej: 2023"
              className="border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Mostrar gráfico de barras o líneas según la selección del mes */}
      <div style={{ width: '100%', height: '400px' }} className="mb-6">
        {selectedMonth ? (
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: `Ventas Diarias - ${selectedMonth}/${selectedYear}`,
                },
              },
            }}
          />
        ) : (
          <Bar
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top',
                },
                title: {
                  display: true,
                  text: 'Ventas Mensuales',
                },
              },
            }}
          />
        )}
      </div>

      {/* Resumen de Ventas */}
      <div className="bg-gray-100 p-4 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Resumen de Ventas</h3>
        <ul className="space-y-2">
          {Object.keys(salesData).length > 0 ? (
            Object.keys(salesData).map(date => {
              const totalForDate = salesData[date].reduce((sum, order) => sum + order.total, 0);
              return (
                <li key={date} className="flex justify-between">
                  <span>{date}:</span>
                  <span className="font-bold">${totalForDate.toFixed(2)}</span>
                </li>
              );
            })
          ) : (
            <li>No hay datos de ventas para mostrar</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default DateSalesDashboard;
