// src/promotions.js
export const promotions = [
    {
      name: 'Promoción M',
      description: 'Incluye 1 pizza mediana, 1 bebida y palitos de ajo',
      price: 8500,
      includesPizza: true,
      includesDrink: true,
      includesAccompaniment: true,
      size: 'medium',
      maxIngredients: 3, // Máximo de ingredientes por pizza para que aplique la promoción
    },
    {
      name: 'Promoción L',
      description: 'Incluye 1 pizza familiar, 1 bebida y palitos de ajo',
      price: 12000,
      includesPizza: true,
      includesDrink: true,
      includesAccompaniment: true,
      size: 'large',
      maxIngredients: 3, // Máximo de ingredientes por pizza para que aplique la promoción
    },
  ];
  