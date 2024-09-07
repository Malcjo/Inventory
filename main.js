const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const net = require('net');
const find = require('find-process');

let serverProcess;

function checkPortInUse(port, callback) {

    const server = net.createServer();

    server.once('error', (err) =>{
        if(err.code === 'EADDRINUSE'){
            callback(true);
        }
        else{
            callback(false);
        }
    });

    server.once('listening', () =>{
        server.close();
        callback(false);
    });

    server.listen(port);


    /*
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
    */
}

function startServer(){
    if(serverProcess){
        console.log('Server i9s already running, not starting a new one');
        return;
    }
    serverProcess = exec('node server.js', { cwd: __dirname });

    serverProcess.stdout.on('data', (data) => {
        console.log(`Server: ${data}`);
    });

    serverProcess.stderr.on('data', (data) => {
        console.error(`Server Error: ${data}`);
    });

    serverProcess.on('close', (code) => {
        console.log(`Server process exited with code ${code}`);
    });
}

function stopServer(){
    if (serverProcess) {
        serverProcess.kill();
        serverProcess = null;
        console.log('server stopped: ', serverProcess);
    }
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
            startServer();
        } else {
            console.log("Server already running on port 5000");
        }
    });
    mainWindow.on('closed', ()=>{
        stopServer();
    })
}




app.on('ready', createWindow);



// Ensure the server is stopped before quitting
app.on('before-quit', () => {
    console.log("stopping server before app close");
    //stopServer();
    find('port', 5000)
        .then((list) => {
            if (list[0] != null) { // If there is a process using port 5000
                console.log(`Killing process on port 5000: PID ${list[0].pid}`);
                process.kill(list[0].pid, 'SIGHUP'); // Gracefully kill the process
            }
        })
        .catch((err) => {
            console.error('Error finding process:', err);
        });
});

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
