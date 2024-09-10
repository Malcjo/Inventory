import React, { useState } from 'react';
import InventoryList from './components/InventoryList';
import AddItemForm from './components/AddItemForm';

const App = () => {
  const [inventory, setInventory] = useState([]);  // Manage inventory state
  const [csvFilePath, setCsvFilePath] = useState(null);  // Manage CSV file path

  // Open and load CSV data
  const handleOpenCSV = () => {
    window.electronAPI.openCSV().then(({ data, path }) => {
      const parsedData = data
        .split('\n')
        .map(row => {
          const [ID, Name, Quantity] = row.split(',');
          return { ID, Name, Quantity: parseInt(Quantity, 10) };
        })
        .filter(item => item.ID && item.Name && !isNaN(item.Quantity));  // Filter out invalid data

      setInventory(parsedData);  // Update inventory state
      setCsvFilePath(path);  // Update file path state
    });
  };

  // Save the currently loaded CSV
  const handleSaveCSV = () => {
    if (csvFilePath) {
      const csvData = inventory.map(item => `${item.ID},${item.Name},${item.Quantity}\n`).join('');
      window.electronAPI.saveCSV({ data: csvData, path: csvFilePath });
    }
  };

  // Save as a new CSV file
  const handleSaveAsCSV = () => {
    const csvData = inventory.map(item => `${item.ID},${item.Name},${item.Quantity}\n`).join('');
    window.electronAPI.saveCSV({ data: csvData });
  };

  // Add a new item to the inventory
  const addItem = () => {
    const newItem = { ID: Date.now().toString(), Name: 'New Item', Quantity: 1 };
    setInventory([...inventory, newItem]);
  };

  // Update item quantity
  const updateItemQuantity = (itemId, amount) => {
    setInventory(inventory.map(item =>
      item.ID === itemId ? { ...item, Quantity: item.Quantity + amount } : item
    ));
  };

  // Delete an item from the inventory
  const deleteItem = (itemId) => {
    setInventory(inventory.filter(item => item.ID !== itemId));
  };

  return (
    <div>
      <h1>Inventory Management</h1>
      <button onClick={handleOpenCSV}>Open CSV</button>
      <button onClick={handleSaveCSV}>Save CSV</button>
      <button onClick={handleSaveAsCSV}>Save As CSV</button>
      {/*<button onClick={addItem}>Add Item</button>*/}

    <AddItemForm onAddItem={addItem}></AddItemForm>

    <InventoryList 
      inventory={inventory}
      updateItemQuantity={updateItemQuantity}
      deleteItem={deleteItem}
    />

    {/*  <ul>
        {inventory.map(item => (
          <li key={item.ID}>
            {item.Name} - Quantity: {item.Quantity}
            <button onClick={() => updateItemQuantity(item.ID, 1)}>+</button>
            <button onClick={() => updateItemQuantity(item.ID, -1)}>-</button>
            <button onClick={() => deleteItem(item.ID)}>Delete</button>
          </li>
        ))}
      </ul>
    */}
    </div>
  );
};

export default App;
