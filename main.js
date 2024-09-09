const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const net = require('net');

const fs = require('fs');

let serverProcess;

function saveCSVFile({data, path}){
    let savePath = path;

    if(!savePath){
        savePath = dialog.showSaveDialogSync({
            title: 'Save inventory CSV',
            defaultPath: 'inventory.csv',
            filters:[
                {name:'CSV Files,', extensions:['CSV']}
            ]
        });
    }

    if(savePath){
        fs.writeFileSync(savePath, data, 'utf-8');
        console.log(`CSV file saved at: ${savePath}`);
    }
    else{
        console.log('Save canceled or no file selected');
    }
}

function openCSVFile() {
    const filePaths = dialog.showOpenDialogSync({
        title: 'Select CSV File',
        properties: ['openFile'],
        filters: [{ name: 'CSV Files', extensions: ['csv'] }]
    });

    if (filePaths && filePaths[0]) {
        const filePath = filePaths[0];
        const csvData = fs.readFileSync(filePath, 'utf-8');
        console.log(`CSV file opened from: ${filePath}`);
        return {data: csvData, path: filePath};
    } else {
        console.log('Open file operation canceled');
        return { data: null, path: null};
    }
}


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

require('dotenv').config();
const isDev = process.env.NODE_ENV === 'development';
app.on('will-quit', (event) =>{
    if(isDev){
        console.log("App is quitting in development mode");
        console.log("Stopping server before app closes");

        event.preventDefault();
    
            // Run the kill-port command for port 5000
            exec('npx kill-port 5000', (err, stdout, stderr) => {
                if (err) {
                    console.error(`Error killing port 5000: ${err.message}`);
                } else {
                    console.log(`Port 5000 successfully killed`);
                    console.log(`stdout: ${stdout}`);
                    console.log(`stderr: ${stderr}`);
                }
        
                // Allow the app to quit after the command completes
                app.quit();
            });
    }
    else{
        console.log("App is quitting in production mode");
    }

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

//~~~~~~~~~~~~~~~~~~~~~~IPCMAIN used for handling file opening and saving~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//save CSV file when triggered by renderer
ipcMain.on('save-csv', (event,{ data, path}) =>{
    saveCSVFile({data, path});
});

//open CSV file when trigered by renderer
ipcMain.handle('open-csv', async (event) =>{
    return openCSVFile();
})
