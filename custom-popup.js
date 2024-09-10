const { ipcRenderer } = require('electron');

document.getElementById('submitBtn').addEventListener('click', () => {
  const customAmount = document.getElementById('customAmount').value;
  ipcRenderer.send('custom-amount', customAmount);  // Send the custom amount back to the main window
});
