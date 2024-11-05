const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    const validChannels = [
      'add-pizza', 
      'save-order', 
      'print-receipt', 
      'save-promotion', 
      'add-accompaniment', 
      'generate-pdf',
      'add-client' // Nuevo canal para guardar clientes
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    const validChannels = [
      'get-pizzas', 
      'load-orders', 
      'get-promotions', 
      'get-accompaniments',
      'get-clients' // Canal para obtener los clientes
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel, func) => {
    const validChannels = [
      'receipt-printed', 
      'promotion-saved', 
      'accompaniment-added',
      'pdf-generated',
      'client-added', // Canal para confirmar cliente agregado
      'client-error'   // Canal para manejar error si el cliente ya existe
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
  once: (channel, func) => {
    const validChannels = [
      'client-added', // Canal para confirmar cliente agregado
      'client-error'  // Canal para manejar error si el cliente ya existe
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.once(channel, (event, ...args) => func(...args));
    }
  },
  removeListener: (channel, func) => {
    ipcRenderer.removeListener(channel, func);
  }
});
