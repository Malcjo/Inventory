const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const net = require('net');

function checkPortInUse(port, callback) {
    const server = net.createServer((socket) => {
        socket.write('Echo server\r\n');
        socket.pipe(socket);
    });

    server.on('error', () => {
        callback(true);
    });

    server.on('listening', () => {
        server.close();
        callback(false);
    });

    server.listen(port, '127.0.0.1');
}

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'), // Load the preload script
            contextIsolation: true, // Recommended for security reasons
            enableRemoteModule: false // Recommended to disable remote module
        },
    });

    const startUrl = `file://${path.join(__dirname, 'client', 'build', 'index.html')}`;
    console.log('loading', startUrl);
    mainWindow.loadURL(startUrl);

    mainWindow.webContents.openDevTools();

    checkPortInUse(5000, (inUse) => {
        if (!inUse) {
            const serverProcess = exec('node server.js', { cwd: __dirname });

            serverProcess.stdout.on('data', (data) => {
                console.log(`Server: ${data}`);
            });

            serverProcess.stderr.on('data', (data) => {
                console.error(`Server Error: ${data}`);
            });

            serverProcess.on('close', (code) => {
                console.log(`Server process exited with code ${code}`);
            });

            mainWindow.on('closed', () => {
                serverProcess.kill();
            });
        } else {
            console.log("Server already running on port 5000");
        }
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
