const { contextBridge, ipcRenderer } = require('electron');

// Exponemos ipcRenderer de manera segura a través de window.electron
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    let validChannels = ['add-pizza', 'save-order', 'print-receipt'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    let validChannels = ['get-pizzas', 'load-orders'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  },
  // Exponemos la función `on` para escuchar eventos desde el proceso principal
  on: (channel, func) => {
    let validChannels = ['receipt-printed'];
    if (validChannels.includes(channel)) {
      // Vinculamos la función de escucha al canal
      ipcRenderer.on(channel, (event, ...args) => func(event, ...args));
    }
  }
});
