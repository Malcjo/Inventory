import React, { useState, useEffect } from 'react';
import InventoryList from './components/InventoryList';
import AddItemForm from './components/AddItemForm';

const App = () => {
  const [inventory, setInventory] = useState([]);
  const [error, setError] = useState(null);
  const [csvFilePath, setCsvFilePath] = useState(null);


  const handleSaveCSV = () =>{
    if(csvFilePath){
      const csvData = inventory.map(item => `${item.ID},${item.Name},${item.Quantity}\n`).join('');

      window.electronAPI.saveCSV({data: csvData, path:csvFilePath});
    }
    else{
      console.error('No CSV file loaded to save.');
    }
  };

  const handleSaveAsCSV = () => {
    const csvData = inventory.map(item => `${item.ID},${item.Name},${item.Quantity}\n`).join('');
    window.electronAPI.saveCSV({ data: csvData });
  };

  const handleOpenCSV = () =>{
    window.electronAPI.openCSV().then(({data, path}) =>{
      if(data && path){
        const parsedData = data.split('\n').map(row =>{
          const [ID, Name, Quantity] = row.split(',');
          return {ID, Name, Quantity: parseInt(Quantity, 10) };
        });

        setInventory(parsedData);
        setCsvFilePath(path);
        console.log('Loaded CSV data:', parsedData);
      }
    });
  };
  // Function to fetch inventory from the server
  const fetchInventory = async () => {
    try {
      const response = await fetch('http://localhost:5000/inventory');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInventory(data);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setError('Failed to fetch inventory.');
    }
  };

  // Function to handle file change for uploading a new CSV file
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      console.log('Selected file:', file);

      const formData = new FormData();
      formData.append('csvFile', file);

      try {
        const response = await fetch('http://localhost:5000/change-csv', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Failed to update CSV file path: ${response.status}`);
        }
        fetchInventory(); // Reload inventory after file upload
      } catch (error) {
        console.error('Failed to update CSV file path:', error);
        setError('Failed to update CSV file path.');
      }
    }
  };

  // Function to add a new item to the inventory
  const addItem = async (item) => {
    try {
      const response = await fetch('http://localhost:5000/inventory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });

      if (response.ok) {
        fetchInventory(); // Reload inventory after adding
      } else {
        console.error('Failed to add item');
      }
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  /*
  const handleQuantityChange = (e, id) =>{
    console.log('id:', id);
    console.log('value: ', e.target.value)
    setNewQuantity({
      ...newQuantity,//spread operator, copies all existing values from newQuantity state
      [id]: e.target.value//bracket notation dynamically setting a new key-value pair [id] is key, e.target.value is value
    });
  };
  */

  const updateItemQuantity = async (itemId, amount, isCustom = false) =>{
    const itemIndex = inventory.findIndex(item => item.ID === itemId);
    let updatedItem;
    if(itemIndex !== -1){
      updatedItem = {...inventory[itemIndex]};
      updatedItem.Quantity = isCustom ? parseInt(amount, 10) : (parseInt(updatedItem.Quantity, 10) + parseInt(amount, 10));
      //parseInt(amount, 10) means "convert the amount string to an integer, interpreting it as a base-10 (decimal) number."
    }

    try {
      const response = await fetch(`http://localhost:5000/inventory/${itemId}`, {
        method: 'PUT',
        headers:{
          'Content-type':'application/json',        
        },
        body: JSON.stringify({quantity: updatedItem.Quantity}),
      });

      if(response.ok){
        const updatedInventory = [...inventory];
        updatedInventory[itemIndex] = updatedItem;
        setInventory(updatedInventory);
      }
      else{
        console.error('Failed to update Item');
      }

    } catch (error) {
      console.error('Failed to update item: ', error);
    }
  };

  // Function to delete an item from the inventory
  const deleteItem = async (itemId) => {
    try {
      console.log('Deleting item with ID:', itemId);
      const response = await fetch(`http://localhost:5000/inventory/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        console.log(`Item ${itemId} successfully deleted!`);
        fetchInventory(); // Reload the inventory after deletion
      } else {
        console.error('Failed to delete item', itemId);
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  // UseEffect hook to fetch inventory on component mount
  useEffect(() => {
    fetchInventory();
  }, []); // Empty dependency array means this runs once when the component mounts

  return (
    <div className="App">
      <h1>Inventory Management System</h1>
      <input type="file" accept=".csv" onChange={handleOpenCSV} />
      <button onClick={handleSaveCSV}>Save CSV</button>
      <button onClick={handleSaveAsCSV}>Save As CSV</button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <AddItemForm onAddItem={addItem} />
      
      <InventoryList 
      inventory={inventory} 
      onDeleteItem={deleteItem}
      updateItemQuantity={updateItemQuantity}
      />
    </div>
  );
};

export default App;
