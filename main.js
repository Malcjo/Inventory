const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

let mainWindow;
let selectedItemId = null;  // Track the selected item

function saveCSVFile({ data, path }) {
  const savePath = path || dialog.showSaveDialogSync({
    title: 'Save CSV File',
    defaultPath: 'inventory.csv',
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (savePath) {
    fs.writeFileSync(savePath, data, 'utf-8');
  }
}

function openCSVFile() {
  const filePaths = dialog.showOpenDialogSync({
    title: 'Open CSV File',
    properties: ['openFile'],
    filters: [{ name: 'CSV Files', extensions: ['csv'] }]
  });

  if (filePaths && filePaths[0]) {
    const csvData = fs.readFileSync(filePaths[0], 'utf-8');
    return { data: csvData, path: filePaths[0] };
  }

  return { data: null, path: null };
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),  // Load preload script
      contextIsolation: true,  // Security reasons
    }
  });

  // Load the React app from the build folder
  mainWindow.loadURL(`file://${path.join(__dirname, 'client', 'build', 'index.html')}`);
  
  // Open DevTools for debugging (optional)
  mainWindow.webContents.openDevTools();
}

// Function to open the custom popup window
function createCustomPopup(item) {
  selectedItemId = item.ID;
  console.log('Opening custom popup for item ID:', selectedItemId); 

  const customPopup = new BrowserWindow({
    width: 400,
    height: 200,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: true,
      enableRemoteModule: true,
    }
  });

  customPopup.loadURL(`file://${path.join(__dirname, 'custom-popup.html')}`);

  customPopup.webContents.once('did-finish-load', () => {
    customPopup.webContents.send('populate-custom-popup', {
        name: item.Name,
        currentQuantity: item.Quantity
    });
  });
  //customPopup.webContents.openDevTools();
}

app.whenReady().then(createWindow);

// Handle the opening of the custom popup
ipcMain.on('open-custom-popup', (event, itemId) => {
  createCustomPopup(itemId);
});

// Listen for custom amount sent from the popup
ipcMain.on('custom-amount', (event, customAmount) => {
  if (customAmount !== null) {
    mainWindow.webContents.send('update-quantity', selectedItemId, parseInt(customAmount, 10));
  }
});

ipcMain.on('save-csv', (event, { data, path }) => saveCSVFile({ data, path }));
ipcMain.handle('open-csv', () => openCSVFile());
