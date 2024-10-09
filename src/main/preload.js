const { contextBridge, ipcRenderer } = require('electron');

// Exponemos las funciones al frontend
contextBridge.exposeInMainWorld('electronAPI', {
  saveOrder: (orderData) => ipcRenderer.send('save-order', orderData),
  loadOrders: () => ipcRenderer.invoke('load-orders'),
});
