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

function ProductSalesDashboard() {
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

    // Contabilizar las pizzas
    sales.forEach(order => {
      order.items.forEach(item => {
        if (item.pizza) { // Verificar si es un item de pizza
          productSalesCount[item.pizza] = (productSalesCount[item.pizza] || 0) + item.quantity;
        } else if (item.accompaniment) { // Verificar si es un acompañamiento
          productSalesCount[item.accompaniment] = (productSalesCount[item.accompaniment] || 0) + item.quantity;
        }
      });
    });

    setProductSales(productSalesCount);
  };

  return (
    <div className="sales-dashboard p-4">
      <h2 className="text-xl font-bold mb-2">Dashboard de Ventas de Productos</h2>
      <p className="text-lg">Total de Ventas: <span className="font-semibold">${totalSales}</span></p>

      <h3 className="text-lg font-semibold mt-4">Ventas por Producto</h3>
      <div className="mt-2">
        <Bar 
          data={{
            labels: Object.keys(productSales),
            datasets: [{
              label: 'Ventas',
              data: Object.values(productSales),
              backgroundColor: 'rgba(75, 192, 192, 0.6)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
            }],
          }} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                labels: {
                  font: {
                    size: 12,
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: (tooltipItem) => {
                    return `${tooltipItem.dataset.label}: ${tooltipItem.raw}`;
                  }
                }
              }
            },
            scales: {
              x: {
                title: {
                  display: true,
                  text: 'Productos',
                  font: {
                    size: 14,
                  }
                }
              },
              y: {
                title: {
                  display: true,
                  text: 'Cantidad',
                  font: {
                    size: 14,
                  }
                },
                beginAtZero: true
              }
            }
          }}
        />
      </div>
    </div>
  );
}

export default ProductSalesDashboard;
