const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    let validChannels = [
      'add-pizza', 
      'save-order', 
      'print-receipt', 
      'save-promotion', 
      'add-accompaniment', 
      'generate-pdf' // Agregar este canal
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    let validChannels = [
      'get-pizzas', 
      'load-orders', 
      'get-promotions', 
      'get-accompaniments'
    ];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  on: (channel, func) => {
    let validChannels = [
      'receipt-printed', 
      'promotion-saved', 
      'accompaniment-added',
      'pdf-generated' // Agregar este canal
    ];
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
    }
  }
});
