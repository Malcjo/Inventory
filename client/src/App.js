import React, { useState, useEffect } from 'react';
import InventoryList from './components/InventoryList';
import AddItemForm from './components/AddItemForm';

const App = () => {
  const [inventory, setInventory] = useState([]);
  const [csvFilePath, setCsvFilePath] = useState(null);

  const handleOpenCSV = () => {
    window.electronAPI.openCSV().then(({ data, path }) => {
      const parsedData = data
        .split('\n')
        .map(row => {
          const [ID, Name, Quantity] = row.split(',');
          return { ID, Name, Quantity: parseInt(Quantity, 10) };
        })
        .filter(item => item.ID && item.Name && !isNaN(item.Quantity));

      setInventory(parsedData);
      setCsvFilePath(path);
    });
  };

  const handleCustomPopup = (itemId) => {
    window.electronAPI.openCustomPopup(itemId);
  };

  useEffect(() => {
    window.electronAPI.onUpdateQuantity((itemId, customAmount) => {
      if (customAmount !== null) {
        setInventory(inventory.map(item =>
          item.ID === itemId ? { ...item, Quantity: item.Quantity + customAmount } : item
        ));
      }
    });
  }, [inventory]);

  const handleSaveCSV = () => {
    if (csvFilePath) {
      const csvData = inventory.map(item => `${item.ID},${item.Name},${item.Quantity}\n`).join('');
      window.electronAPI.saveCSV({ data: csvData, path: csvFilePath });
    }
  };

  const handleSaveAsCSV = () => {
    const csvData = inventory.map(item => `${item.ID},${item.Name},${item.Quantity}\n`).join('');
    window.electronAPI.saveCSV({ data: csvData });
  };

  const addItem = (newItem) => {
    setInventory([...inventory, newItem]);
  };

  const updateItemQuantity = (itemId, amount) => {
    setInventory(inventory.map(item =>
      item.ID === itemId ? { ...item, Quantity: item.Quantity + amount } : item
    ));
  };

  const deleteItem = (itemId) => {
    setInventory(inventory.filter(item => item.ID !== itemId));
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      <button onClick={handleOpenCSV}>Open CSV</button>
      <button onClick={handleSaveCSV}>Save CSV</button>
      <button onClick={handleSaveAsCSV}>Save As CSV</button>

      <AddItemForm onAddItem={addItem} />

      <InventoryList 
        inventory={inventory}
        updateItemQuantity={updateItemQuantity}
        deleteItem={deleteItem}
        onCustomPopup={handleCustomPopup}
      />
    </div>
  );
};

export default App;
