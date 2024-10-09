const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

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

// Manejar la comunicación para guardar y cargar pedidos
ipcMain.on('save-order', (event, orderData) => {
  const csvPath = path.join(__dirname, '../../data/orders.csv');
  const csvContent = `${orderData.pizza},${orderData.size},${orderData.quantity},${orderData.client},${orderData.price},En preparación\n`;
  fs.appendFileSync(csvPath, csvContent, 'utf8');
});

ipcMain.handle('load-orders', () => {
  const csvPath = path.join(__dirname, '../../data/orders.csv');
  if (fs.existsSync(csvPath)) {
    const content = fs.readFileSync(csvPath, 'utf8');
    const orders = content.split('\n').filter(line => line).map(line => {
      const [pizza, size, quantity, client, price, status] = line.split(',');
      return { pizza, size, quantity, client, price, status };
    });
    return orders;
  }
  return [];
});
