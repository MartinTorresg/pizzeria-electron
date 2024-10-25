import React, { useState, useEffect } from 'react';

function FinanceDashboard() {
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [profitMargin, setProfitMargin] = useState(0);

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const fetchFinancialData = async () => {
    const orders = await window.electron.invoke('load-orders');
    
    const income = orders.reduce((sum, order) => sum + order.total, 0);
    setTotalIncome(income);
    
    // Supongamos que tienes una forma de calcular los gastos
    const expenses = calculateExpenses(); // Implementa esta función según tu lógica
    setTotalExpenses(expenses);
    
    const margin = ((income - expenses) / income) * 100;
    setProfitMargin(margin.toFixed(2));
  };

  return (
    <div className="finance-dashboard">
      <h2 className="text-2xl font-bold">Dashboard de Finanzas</h2>
      <p>Ingresos Totales: ${totalIncome}</p>
      <p>Gastos Totales: ${totalExpenses}</p>
      <p>Margen de Ganancia: {profitMargin}%</p>
    </div>
  );
}

export default FinanceDashboard;
