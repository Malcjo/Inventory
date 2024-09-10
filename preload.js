// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('api', {
    // Example: send an asynchronous message to the main process
    send: (channel, data) => {
        // Only allow specific channels
        let validChannels = ['toMain'];
        if (validChannels.includes(channel)) {
            ipcRenderer.send(channel, data);
        }
    },
    receive: (channel, func) => {
        let validChannels = ['fromMain'];
        if (validChannels.includes(channel)) {
            // Remove event parameter for better security
            ipcRenderer.on(channel, (event, ...args) => func(...args));
        }
    }
});

// Expose a safe API to the renderer process
contextBridge.exposeInMainWorld('electronAPI', {
    saveCSV: (data) => ipcRenderer.send('save-csv', data),  // Save CSV with or without a specified path
    openCSV: () => ipcRenderer.invoke('open-csv').then(result => result),  // Open CSV functionality

    openCustomPopup: (itemId) => ipcRenderer.send('open-custom-popup', itemId),
    onCustomAmountReceived: (callback) => ipcRenderer.on('custom-amount-received', (event, amount) => callback(amount)),
    onUpdateQuantity: (callback) => ipcRenderer.on('update-quantity', (event, itemId, customAmount) => {
      callback(itemId, customAmount);
    }),
    sendCustomAmount: (customAmount) => ipcRenderer.send('custom-amount', customAmount)  // New function for the popup
  });