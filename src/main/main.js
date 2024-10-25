const { dialog, app, BrowserWindow, ipcMain } = require('electron');
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
  const ordersCsvPath = path.join(app.getPath('userData'), 'orders.csv');
  
  // Verifica que los datos estén completos antes de guardarlos
  const csvContent = orderData.items.map(item => {
    const pizza = item.pizza || 'Desconocida';
    const size = item.size || 'Desconocido';
    const quantity = item.quantity || 1;
    const client = orderData.client || 'Desconocido';
    const price = item.price || 0;
    const orderType = orderData.orderType || 'Desconocido';
    const date = new Date().toLocaleString();
    
    return `${pizza},${size},${quantity},${client},${price},${orderType},${date},En preparación\n`;
  }).join('');

  // Si no existe el archivo de pedidos, lo creamos con encabezados
  if (!fs.existsSync(ordersCsvPath)) {
    const headers = 'Pizza,Tamaño,Cantidad,Cliente,Precio,Tipo de Pedido,Fecha,Estado\n';
    fs.writeFileSync(ordersCsvPath, headers, 'utf8');
  }

  fs.appendFileSync(ordersCsvPath, csvContent, 'utf8');
  console.log('Pedido guardado correctamente.');
});

// Función para cargar pedidos desde el CSV
ipcMain.handle('load-orders', () => {
  const ordersCsvPath = path.join(app.getPath('userData'), 'orders.csv');
  console.log('Leyendo pedidos desde:', ordersCsvPath);

  if (fs.existsSync(ordersCsvPath)) {
    const content = fs.readFileSync(ordersCsvPath, 'utf8');
    const orders = content.split('\n').filter(line => line).map(line => {
      const [pizza, size, quantity, client, price, orderType, date, status] = line.split(',');
      return {
        pizza,
        size,
        quantity,
        client,
        price: parseFloat(price),
        orderType,
        date,
        status,
      };
    });
    console.log('Pedidos cargados:', orders);
    return orders;
  }

  console.log('No se encontraron pedidos.');
  return [];
});


// Función para mostrar el diálogo de impresión y permitir elegir la impresora
ipcMain.on('print-receipt', (event, orderData) => {
  console.log('Iniciando proceso de impresión para el pedido:', orderData);

  // Crea una ventana invisible para la impresión del recibo
  const win = new BrowserWindow({ show: false });

  // Generamos el HTML con estilo inline para asegurarnos de que se apliquen los estilos
  const receiptHTML = `
    <html>
      <head>
        <title>Boleta</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            font-size: 14px;
            width: 300px;
            margin: 0 auto;
            text-align: center;
            color: #000;
          }
          h1 {
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 2px solid #000;
            padding-bottom: 5px;
          }
          p {
            margin: 5px 0;
          }
          .ticket-header {
            font-weight: bold;
            margin-bottom: 10px;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
          }
          .items-table th, .items-table td {
            text-align: left;
            padding: 5px 0;
            border-bottom: 1px dashed #000;
          }
          .total {
            font-weight: bold;
            margin-top: 15px;
            font-size: 16px;
            border-top: 2px solid #000;
            padding-top: 10px;
          }
          .footer {
            font-size: 12px;
            margin-top: 20px;
            border-top: 1px solid #000;
            padding-top: 10px;
          }
        </style>
      </head>
      <body>
        <h1>Ristorante Pizzeria</h1>
        <p class="ticket-header">Cliente: ${orderData.client}</p>
        <p class="ticket-header">Fecha: ${new Date().toLocaleString()}</p>

        <table class="items-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Cant.</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${orderData.items.map(item => `
              <tr>
                <td>${item.pizza}${item.secondHalf ? ` / ${item.secondHalf}` : ''} (${item.size})</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <p class="total">Total a pagar: $${orderData.total.toFixed(2)}</p>

        <div class="footer">
          <p>¡Gracias por su compra!</p>
          <p>Ristorante Pizzeria</p>
        </div>
      </body>
    </html>
  `;

  // Cargamos el HTML generado directamente en la ventana
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`);

  // Una vez que la página HTML se cargue, mostramos el cuadro de diálogo de impresión
  win.webContents.on('did-finish-load', () => {
    console.log('Boleta cargada, mostrando cuadro de diálogo de impresión.');

    win.webContents.print({
      silent: false,  // Mostrar el cuadro de diálogo de impresión
      printBackground: true, // Imprimir el fondo si es necesario
    }, (success, errorType) => {
      if (!success) {
        console.error('Error al imprimir:', errorType);
      } else {
        console.log('Impresión completada.');
      }

      // Cerrar la ventana después de la impresión
      win.close();
    });
  });
});