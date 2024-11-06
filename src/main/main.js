const { dialog, app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const csv = require('csv-parser');
const pdf = require('html-pdf');

let win;

const resourcesCsvPath = path.join(process.resourcesPath, 'data/pizzas.csv'); // Ruta en resources del build
const clientsCsvPath = path.join(app.getPath('userData'), 'clients.csv');

function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: path.join(__dirname, '../assets/icons/rambla_logo.PNG'),
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
    const pizzasCsvPath = path.join(app.getPath('userData'), 'pizzas.csv');

    if (fs.existsSync(pizzasCsvPath)) {
      fs.createReadStream(pizzasCsvPath)
        .pipe(csv(['Nombre', 'PrecioMediano', 'PrecioFamiliar', 'Ingredientes']))
        .on('data', (data) => {
          if (data.Nombre !== 'Nombre') {
            pizzas.push({
              Nombre: data.Nombre,
              PrecioMediano: parseFloat(data.PrecioMediano),
              PrecioFamiliar: parseFloat(data.PrecioFamiliar),
              ingredients: data.Ingredientes ? data.Ingredientes.split('|') : [],
            });
          }
        })
        .on('end', () => {
          resolve(pizzas);
        })
        .on('error', (error) => {
          reject(error);
        });
    } else {
      resolve([]); // Devuelve un arreglo vacío si no existe el CSV
    }
  });
}

// Modificar la función writePizzaToCSV
function writePizzaToCSV(pizza) {
  const pizzasCsvPath = path.join(app.getPath('userData'), 'pizzas.csv');

  if (!fs.existsSync(pizzasCsvPath)) {
    const headers = 'Nombre,PrecioMediano,PrecioFamiliar,Ingredientes\n';
    fs.writeFileSync(pizzasCsvPath, headers, 'utf8');
  }

  // Añadir la pizza al archivo CSV
  const pizzaData = `${pizza.name},${pizza.prices.medium},${pizza.prices.large},${pizza.ingredients.join('|')}\n`;
  fs.appendFileSync(pizzasCsvPath, pizzaData, 'utf8');
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

  // Asegurarse de que orderData incluye el campo paymentMethod
  if (!orderData.paymentMethod) {
    orderData.paymentMethod = 'cash'; // Valor predeterminado en caso de que falte
  }

  // Serializar todo el objeto orderData como JSON
  const csvContent = JSON.stringify(orderData) + '\n';

  // Si no existe el archivo de pedidos, lo creamos
  if (!fs.existsSync(ordersCsvPath)) {
    fs.writeFileSync(ordersCsvPath, '', 'utf8');
  }

  // Agregar el pedido al archivo CSV
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
      try {
        return JSON.parse(line); // Deserializamos cada línea como un objeto JSON completo
      } catch (error) {
        console.error('Error al deserializar el pedido:', error);
        return null;
      }
    }).filter(order => order); // Filtramos pedidos nulos por errores de parsing

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
      <title>Pedido para Cocina</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          font-size: 14px;
          width: 300px;
          margin: 0 auto;
          color: #000;
        }
        h1 {
          font-size: 18px;
          margin-bottom: 10px;
          border-bottom: 2px solid #000;
          padding-bottom: 5px;
          text-align: center;
        }
        .ticket-header {
          margin: 5px 0;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .items-table th, .items-table td {
          text-align: left;
          padding: 5px;
          border-bottom: 1px dashed #000;
        }
        .footer {
          font-size: 12px;
          margin-top: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <h1>Pedido para Cocina</h1>
      <p class="ticket-header">Cliente: ${orderData.client.nombre || 'No especificado'}</p>
      <p class="ticket-header">Teléfono: ${orderData.client.numero || 'No especificado'}</p>
      <p class="ticket-header">Fecha: ${new Date().toLocaleString()}</p>
      <p class="ticket-header">Tipo de Pedido: ${orderData.orderType}</p>
  
      <table class="items-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Cant.</th>
          </tr>
        </thead>
        <tbody>
          ${orderData.items.map(item => `
            <tr>
              <td>
                ${
                  item.promotion
                    ? `${item.promotion}: ${item.description}`
                    : `${item.pizza || item.accompaniment} ${item.secondHalf ? ` / ${item.secondHalf}` : ''} ${item.size ? `(${item.size})` : ''}`
                }
                ${item.ingredients ? `<br><small>Ingredientes: ${item.ingredients}</small>` : ''}
              </td>
              <td>${item.quantity}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
  
      <div class="footer">
        <p>Este pedido es para uso interno de cocina</p>
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

// Función para leer los acompañamientos del CSV
function readAccompanimentsFromCSV() {
  return new Promise((resolve, reject) => {
    const accompaniments = [];
    const accompanimentsCsvPath = path.join(app.getPath('userData'), 'accompaniments.csv');

    if (fs.existsSync(accompanimentsCsvPath)) {
      fs.createReadStream(accompanimentsCsvPath)
        .pipe(csv(['Nombre', 'Precio']))
        .on('data', (data) => {
          if (data.Nombre !== 'Nombre') {
            accompaniments.push({
              name: data.Nombre,
              price: parseFloat(data.Precio),
            });
          }
        })
        .on('end', () => {
          resolve(accompaniments);
        })
        .on('error', (error) => {
          reject(error);
        });
    } else {
      resolve([]);
    }
  });
}

// Función para escribir un acompañamiento al CSV
function writeAccompanimentToCSV(accompaniment) {
  const accompanimentsCsvPath = path.join(app.getPath('userData'), 'accompaniments.csv');
  const fileExists = fs.existsSync(accompanimentsCsvPath);

  if (!fileExists) {
    const headers = 'Nombre,Precio\n';
    fs.writeFileSync(accompanimentsCsvPath, headers, 'utf8');
  }

  const accompanimentData = `${accompaniment.name},${accompaniment.price}\n`;
  fs.appendFileSync(accompanimentsCsvPath, accompanimentData, 'utf8');
}

ipcMain.on('add-accompaniment', (event, accompaniment) => {
  writeAccompanimentToCSV(accompaniment);
  event.reply('accompaniment-added', 'Acompañamiento agregado exitosamente');
});

ipcMain.handle('get-accompaniments', async () => {
  const accompaniments = await readAccompanimentsFromCSV();
  return accompaniments;
});

ipcMain.on('generate-pdf', (event, { orders }) => {
  console.log('Generando PDF para los pedidos del mes:', orders);

  if (orders.length === 0) {
    console.log('No hay pedidos para generar el PDF.');
    event.reply('pdf-generated', 'No hay pedidos para generar el PDF.');
    return;
  }

  // Crea una ventana invisible para la generación del PDF
  const win = new BrowserWindow({ show: false });

  // Generamos el HTML para el PDF
  const receiptHTML = `
<html>
  <head>
    <title>Resumen de Ventas del Mes</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        font-size: 14px;
        margin: 0 auto;
        color: #000;
      }
      h1 {
        text-align: center;
        font-size: 18px;
        margin-bottom: 20px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin: 20px 0;
      }
      th, td {
        border: 1px solid #000;
        padding: 8px;
        text-align: left;
      }
      th {
        background-color: #f2f2f2;
      }
      .total {
        font-weight: bold;
        margin-top: 20px;
        font-size: 16px;
      }
    </style>
  </head>
  <body>
    <h1>Resumen de Ventas</h1>
    <table>
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Productos</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${orders.map(order => `
          <tr>
            <td>${order.client?.nombre || 'No especificado'} - ${order.client?.numero || 'Sin número'}</td>
            <td>${order.date}</td>
            <td>
              ${order.items.map(item => `
                ${item.description || item.pizza || item.accompaniment || 'Producto desconocido'}
                ${item.secondHalf ? ` / ${item.secondHalf}` : ''}
                ${item.size ? `(${item.size})` : ''} - 
                Cantidad: ${item.quantity || 1} - 
                Precio: $${parseFloat(item.price || 0).toFixed(2)}<br>
              `).join('')}
            </td>
            <td>$${parseFloat(order.total).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <p class="total">Total Ventas del Mes: $${orders.reduce((sum, order) => sum + parseFloat(order.total), 0).toFixed(2)}</p>
  </body>
</html>
`;

  // Cargamos el HTML generado en la ventana
  win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(receiptHTML)}`);

  // Una vez que la página HTML se cargue, mostramos el cuadro de diálogo de impresión
  win.webContents.on('did-finish-load', () => {
    console.log('Resumen cargado, mostrando cuadro de diálogo de impresión.');

    win.webContents.print({
      silent: false,  // Mostrar el cuadro de diálogo de impresión
      printBackground: true, // Imprimir el fondo si es necesario
    }, (success, errorType) => {
      if (!success) {
        console.error('Error al imprimir:', errorType);
      } else {
        console.log('Impresión completada.');
      }
      win.close(); // Cerrar la ventana después de imprimir
    });
  });
});

function readClientsFromCSV() {
  return new Promise((resolve, reject) => {
    const clients = [];

    if (fs.existsSync(clientsCsvPath)) {
      fs.createReadStream(clientsCsvPath)
        .pipe(csv(['id', 'nombre', 'numero', 'direccion'])) // Añadir la columna id
        .on('data', (data) => {
          clients.push(data);
        })
        .on('end', () => {
          resolve(clients);
        })
        .on('error', (error) => {
          reject(error);
        });
    } else {
      resolve([]);
    }
  });
}

function writeClientToCSV(client) {
  return readClientsFromCSV().then((clients) => {
    const clientExists = clients.some((existingClient) => existingClient.numero === client.numero);
    if (clientExists) {
      throw new Error('El cliente ya existe en la base de datos');
    }

    if (!fs.existsSync(clientsCsvPath)) {
      const headers = 'id,nombre,numero,direccion\n';
      fs.writeFileSync(clientsCsvPath, headers, 'utf8');
    }

    // Generamos un ID único para cada cliente
    const clientData = `${uuidv4()},${client.nombre},${client.numero},${client.direccion}\n`;
    fs.appendFileSync(clientsCsvPath, clientData, 'utf8');
  });
}

// Canal para agregar un cliente al CSV
ipcMain.on('add-client', async (event, client) => {
  try {
    await writeClientToCSV(client);
    event.reply('client-added', 'Cliente agregado exitosamente');
  } catch (error) {
    event.reply('client-error', error.message);
  }
});

// Canal para obtener la lista de clientes desde el CSV
ipcMain.handle('get-clients', async () => {
  const clients = await readClientsFromCSV();
  return clients;
});