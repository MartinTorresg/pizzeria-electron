import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Registrar las escalas y elementos que usarás
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function SalesDashboard() {
  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [productSales, setProductSales] = useState({});

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    const response = await window.electron.invoke('load-orders');
    
    const sales = response.map(order => ({
      ...order,
      total: order.items.reduce((sum, item) => sum + item.price, 0)
    }));
    
    setSalesData(sales);
    calculateTotals(sales);
  };

  const calculateTotals = (sales) => {
    const total = sales.reduce((sum, sale) => sum + sale.total, 0);
    setTotalSales(total);

    const productSalesCount = {};
    sales.forEach(order => {
      order.items.forEach(item => {
        productSalesCount[item.pizza] = (productSalesCount[item.pizza] || 0) + item.quantity;
      });
    });
    setProductSales(productSalesCount);
  };

  return (
    <div className="sales-dashboard">
      <h2 className="text-2xl font-bold">Dashboard de Ventas</h2>
      <p>Total de Ventas: ${totalSales}</p>

      <h3 className="text-xl">Ventas por Producto</h3>
      <Bar 
        data={{
          labels: Object.keys(productSales),
          datasets: [{
            label: 'Ventas',
            data: Object.values(productSales),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          }],
        }} 
      />
    </div>
  );
}

export default SalesDashboard;
