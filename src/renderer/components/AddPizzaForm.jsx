import React, { useState, useEffect } from 'react';

function AddPizzaForm() {
  const [name, setName] = useState('');
  const [mediumPrice, setMediumPrice] = useState('');
  const [largePrice, setLargePrice] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [pizzas, setPizzas] = useState([]);
  const [message, setMessage] = useState('');

  useEffect(() => {
    console.log('Cargando las pizzas existentes...');
    window.electron.invoke('get-pizzas').then((loadedPizzas) => {
      console.log('Pizzas existentes cargadas:', loadedPizzas);
      setPizzas(loadedPizzas);
    }).catch((error) => {
      console.error('Error al cargar las pizzas:', error);
    });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const pizzaExists = pizzas.some((pizza) => pizza.Nombre.toLowerCase() === name.toLowerCase());
    if (pizzaExists) {
      setMessage('La pizza ya existe. No se puede agregar de nuevo.');
      console.log('Intento de agregar una pizza duplicada:', name);
      return;
    }
    if (!name || !mediumPrice || !largePrice || !ingredients) {
      setMessage('Por favor, rellena todos los campos');
      console.log('Formulario incompleto');
      return;
    }
    const filteredIngredients = ingredients.split(',')
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => ingredient.toLowerCase() !== 'salsa de tomate' && ingredient.toLowerCase() !== 'queso mozzarella');

    const newPizza = {
      name,
      prices: {
        medium: parseFloat(mediumPrice),
        large: parseFloat(largePrice),
      },
      ingredients: filteredIngredients,
    };

    try {
      console.log('Agregando pizza:', newPizza);
      window.electron.send('add-pizza', newPizza);
      setMessage('Pizza agregada con éxito');
      setPizzas([...pizzas, newPizza]);
      console.log('Pizza agregada exitosamente.');
    } catch (error) {
      setMessage('Error al agregar la pizza');
      console.error('Error al agregar la pizza:', error);
    }

    setName('');
    setMediumPrice('');
    setLargePrice('');
    setIngredients('');
  };

  return (
    <div className="flex justify-center items-center bg-gray-100"> {/* Ajustar margen superior */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg mb-6 border-t-4 border-green-500">
        <h2 className="text-3xl font-bold mb-4 text-center text-green-600">Agregar Nueva Pizza</h2>

        {message && (
          <p className={`text-center mb-4 ${message.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-gray-700">Nombre de la Pizza:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-1 p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="mediumPrice" className="block text-gray-700">Precio Mediano:</label>
          <input
            type="number"
            id="mediumPrice"
            value={mediumPrice}
            onChange={(e) => setMediumPrice(e.target.value)}
            className="w-full mt-1 p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            step="0.01"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="largePrice" className="block text-gray-700">Precio Familiar:</label>
          <input
            type="number"
            id="largePrice"
            value={largePrice}
            onChange={(e) => setLargePrice(e.target.value)}
            className="w-full mt-1 p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            step="0.01"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="ingredients" className="block text-gray-700">Ingredientes:</label>
          <input
            type="text"
            id="ingredients"
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Ej: Aceitunas, Tomate, Jamón"
            className="w-full mt-1 p-2 border border-green-400 rounded-md focus:outline-none focus:ring-2 focus:ring-green-600"
            required
          />
          <small className="text-gray-500">Separe los ingredientes con comas (la base de salsa de tomate y queso mozzarella está incluida).</small>
        </div>

        <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg py-2 transition duration-200">
          Agregar Pizza
        </button>
      </form>
    </div>
  );
}

export default AddPizzaForm;
