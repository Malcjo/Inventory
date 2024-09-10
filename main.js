const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');

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
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Load preload script
      contextIsolation: true, // Security reasons
    }
  });

  // Load the React app from the build folder
  mainWindow.loadURL(`file://${path.join(__dirname, 'client', 'build', 'index.html')}`);
  
  // Open DevTools for debugging (optional)
  mainWindow.webContents.openDevTools();
}

app.whenReady().then(createWindow);

ipcMain.on('save-csv', (event, { data, path }) => saveCSVFile({ data, path }));
ipcMain.handle('open-csv', () => openCSVFile());


