const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  win.loadFile(path.join(__dirname, '../views/index.html'));
}

app.whenReady().then(() => {
  createWindow();

  // Copiar CSV desde resources a la carpeta de datos del usuario si no existe
  const userDataPath = app.getPath('userData');
  const pizzasCsvPath = path.join(userDataPath, 'pizzas.csv'); // Ruta donde copiaremos el archivo CSV de pizzas
  const resourcesCsvPath = path.join(process.resourcesPath, 'data/pizzas.csv'); // Ruta en resources del build

  if (!fs.existsSync(pizzasCsvPath) && fs.existsSync(resourcesCsvPath)) {
    fs.copyFileSync(resourcesCsvPath, pizzasCsvPath);
    console.log('Archivo pizzas.csv copiado a la carpeta de datos del usuario.');
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Función para leer las pizzas del CSV desde la carpeta de datos del usuario
function readPizzasFromCSV() {
  return new Promise((resolve, reject) => {
    const pizzas = [];
    const pizzasCsvPath = path.join(app.getPath('userData'), 'pizzas.csv'); // Ruta para leer desde userData
    console.log('Leyendo pizzas desde el archivo CSV en:', pizzasCsvPath);

    if (fs.existsSync(pizzasCsvPath)) {
      fs.createReadStream(pizzasCsvPath)
        .pipe(csv(['Nombre', 'PrecioMediano', 'PrecioFamiliar'])) // Sin definir encabezados, csv-parser los detectará
        .on('data', (data) => {
          console.log('Datos leídos desde el CSV:', data);
          if (data.Nombre !== 'Nombre') {
            pizzas.push(data);
          }
        })
        .on('end', () => {
          console.log('Pizzas cargadas correctamente:', pizzas);
          resolve(pizzas);
        })
        .on('error', (error) => {
          console.error('Error al leer el archivo CSV:', error);
          reject(error);
        });
    } else {
      console.log('El archivo pizzas.csv no existe en la ruta:', pizzasCsvPath);
      resolve([]);
    }
  });
}

// Función para escribir una pizza al CSV, asegurando la misma ubicación
function writePizzaToCSV(pizza) {
  const pizzasCsvPath = path.join(app.getPath('userData'), 'pizzas.csv'); // Ruta donde guardaremos el CSV en userData

  // Mostrar la ruta donde se está guardando el archivo CSV
  console.log('Agregando pizza en la ruta:', pizzasCsvPath);

  // Verificar si el archivo ya existe
  const fileExists = fs.existsSync(pizzasCsvPath);

  // Si no existe, creamos el archivo y agregamos los encabezados
  if (!fileExists) {
    const headers = 'Nombre,PrecioMediano,PrecioFamiliar\n';
    fs.writeFileSync(pizzasCsvPath, headers, 'utf8');
    console.log('Archivo pizzas.csv creado con encabezados en:', pizzasCsvPath);
  }

  // Añadir la pizza al archivo CSV
  const pizzaData = `${pizza.name},${pizza.prices.medium},${pizza.prices.large}\n`;
  fs.appendFileSync(pizzasCsvPath, pizzaData, 'utf8');
  console.log('Pizza añadida al archivo:', pizza, 'en:', pizzasCsvPath);
}

// Registrar el handler para agregar pizzas
ipcMain.on('add-pizza', (event, pizza) => {
  console.log('Agregando pizza:', pizza);  // Para depuración
  writePizzaToCSV(pizza);  // Llama a la función para escribir la pizza en el CSV
  event.reply('pizza-added', 'Pizza agregada exitosamente');
});

// Registrar el handler para cargar las pizzas
ipcMain.handle('get-pizzas', async () => {
  const pizzas = await readPizzasFromCSV();
  return pizzas;
});

// Función para guardar pedidos en el CSV
ipcMain.on('save-order', (event, orderData) => {
  const ordersCsvPath = path.join(app.getPath('userData'), 'orders.csv'); // Guardar pedidos en userData
  const csvContent = `${orderData.pizza},${orderData.size},${orderData.quantity},${orderData.client},${orderData.price},En preparación\n`;

  // Si no existe el archivo de pedidos, lo creamos con encabezados
  if (!fs.existsSync(ordersCsvPath)) {
    const headers = 'Pizza,Tamaño,Cantidad,Cliente,Precio,Estado\n';
    fs.writeFileSync(ordersCsvPath, headers, 'utf8');
  }

  fs.appendFileSync(ordersCsvPath, csvContent, 'utf8');
  console.log('Pedido guardado:', orderData);
});

// Función para cargar pedidos desde el CSV
ipcMain.handle('load-orders', () => {
  const ordersCsvPath = path.join(app.getPath('userData'), 'orders.csv');
  if (fs.existsSync(ordersCsvPath)) {
    const content = fs.readFileSync(ordersCsvPath, 'utf8');
    const orders = content.split('\n').filter(line => line).map(line => {
      const [pizza, size, quantity, client, price, status] = line.split(',');
      return { pizza, size, quantity, client, price, status };
    });
    return orders;
  }
  return [];
});
