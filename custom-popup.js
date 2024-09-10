//const { ipcRenderer } = require('electron');

// Receive the item data from main process
window.electronAPI.populateCustomPopup(({ name, currentQuantity }) => {
    // Display the item name in the popup
    document.getElementById('itemName').innerText = name;
  
    // Set the default value of the quantity input
    document.getElementById('customAmount').value = currentQuantity;
  });

document.getElementById('submitBtn').addEventListener('click', () => {
  const customAmount = document.getElementById('customAmount').value;
  console.log('Submit button clicked. Custom amount entered:', customAmount); 

  if (customAmount) {
    window.electronAPI.sendCustomAmount(customAmount);
    //ipcRenderer.send('custom-amount', customAmount);  // Send the custom amount back to the main window
  } else {
    window.electronAPI.sendCustomAmount(null);
    console.log('No custom amount entered, sending null');
    //ipcRenderer.send('custom-amount', null);  // Send the custom amount back as null
  }

  window.close();  // Close the custom popup after submission
});
