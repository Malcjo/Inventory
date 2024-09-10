const { ipcRenderer } = require('electron');

document.getElementById('submitBtn').addEventListener('click', () => {
  const customAmount = document.getElementById('customAmount').value;

  if (customAmount) {
    ipcRenderer.send('custom-amount', customAmount);  // Send the custom amount back to the main window
  } else {
    ipcRenderer.send('custom-amount', null);  // Send the custom amount back as null
  }

  window.close();  // Close the custom popup after submission
});
