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

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Ruta del archivo de pizzas
const pizzasCsvPath = path.join(__dirname, '../../data/pizzas.csv');
const ordersCsvPath = path.join(__dirname, '../../data/orders.csv');

// Función para leer las pizzas del CSV
function readPizzasFromCSV() {
  return new Promise((resolve, reject) => {
    const pizzas = [];
    if (fs.existsSync(pizzasCsvPath)) {
      fs.createReadStream(pizzasCsvPath)
        .pipe(csv())
        .on('data', (data) => pizzas.push(data))
        .on('end', () => resolve(pizzas))
        .on('error', (error) => reject(error));
    } else {
      resolve([]); // Si el archivo no existe, devolvemos un array vacío
    }
  });
}

// Función para escribir una nueva pizza en el CSV
function writePizzaToCSV(pizza) {
  const pizzaData = `${pizza.name},${pizza.prices.medium},${pizza.prices.large}\n`;
  fs.appendFileSync(pizzasCsvPath, pizzaData, 'utf8');
}

// IPC handler para cargar las pizzas
ipcMain.handle('get-pizzas', async () => {
  const pizzas = await readPizzasFromCSV();
  return pizzas;
});

// IPC handler para agregar una pizza nueva
ipcMain.on('add-pizza', (event, pizza) => {
  writePizzaToCSV(pizza);
});

// Función para guardar pedidos en el CSV
ipcMain.on('save-order', (event, orderData) => {
  const csvContent = `${orderData.pizza},${orderData.size},${orderData.quantity},${orderData.client},${orderData.price},En preparación\n`;
  fs.appendFileSync(ordersCsvPath, csvContent, 'utf8');
});

// Función para cargar pedidos desde el CSV
ipcMain.handle('load-orders', () => {
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
