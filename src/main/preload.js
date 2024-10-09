const { contextBridge, ipcRenderer } = require('electron');

// Exponemos ipcRenderer de manera segura a través de window.electron
contextBridge.exposeInMainWorld('electron', {
  send: (channel, data) => {
    // Canales permitidos
    let validChannels = ['add-pizza', 'save-order'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  invoke: (channel, data) => {
    // Canales permitidos para invocación
    let validChannels = ['get-pizzas', 'load-orders'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
  }
});
