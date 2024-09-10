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

// Expose an API for the React front-end to call
contextBridge.exposeInMainWorld('electronAPI', {
    saveCSV: (data) => ipcRenderer.send('save-csv', data),  // Save CSV with or without a specified path
    openCSV: () => ipcRenderer.invoke('open-csv').then(result => result),  // Open CSV functionality
    openCustomPopup: () => ipcRenderer.send('open-custom-popup'),
    onCustomAmountReceived: (callback) => ipcRenderer.on('custom-amount-recived', (event, amount) => callback(amount)),
});