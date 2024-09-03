const {app, BrowserWindow} = require('electron');
const path = require('path');
const {exec} = require('child_process');

function createWindow(){
    //create the browser window

    const mainWindow = new BrowserWindow({
        width: 800,
        height:600,
        webPreferences:{
            //preload: path.join(__dirname, 'preload.js'),//preload.js to expose node.js in the renderer process
            nodeIntegration: true,
            contextIsolation: false,
        },
    });

    //load the react app
    const startUrl = `file://${path.join(__dirname, 'client', 'build', 'index.html')}`;
    console.log('loading', startUrl);
    mainWindow.loadURL(startUrl);

    //open devtools if needed
    mainWindow.webContents.openDevTools();

    //start express server
    const serverProcess = exec('node server.js', {cwd: __dirname});

serverProcess.stdout.on('data', (data) =>{
    console.log(`Server:${data}`);
});

serverProcess.stderr.on('data', (data) =>{
    console.error(`Server Error:  ${data}`);
});

serverProcess.on('close', (code) =>{
    console.log(`Server process exited with code ${code}`);
});

mainWindow.on('closed', () =>{
    serverProcess.kill();
});

}


app.on('ready', createWindow);

//Quit the app when all windows are closed
app.on('window-all-closed', () =>{
    if(process.platform !== 'darwin'){
        app.quit();
    }
});

app.on('activate', () => {
    if(BrowserWindow.getAllWindows().length === 0){
        createWindow();
    }
});