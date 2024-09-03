import React, { useState, useEffect} from 'react';
import InventoryList from './components/InventoryList';
import AddItemForm from './components/AddItemForm';


const App = () =>{
  const [inventory, setInventory] = useState([]);
  const [csvFilePath, setCsvFilePath] = useState('inventory.csv');


  const handleFileChange = async (event) =>{
    const file = event.target.files[0];
    if(file){
      console.log('Selected file path:' , file);

      const formData = new FormData();
      formData.append('csvFile', file);

      //const filePath = file.path;
      //setCsvFilePath(filePath);

      try {
        const response = await fetch('http://localhost:5000/change-csv', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update CSV file path: ${response.status}`);
        }
        fetchInventory();
      } catch (error) {
        console.error('Failed to update CSV file path:', error);
      }
    }
  };

  const fetchInventory = async () =>{
    try {
      const response = await fetch('http://localhost:5000/inventory');
      if(!response.ok){
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setInventory(data);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
    }
  };

  const addItem = async (item) =>{
    try {
      const response = await fetch('http://localhost:5000/inventory', {
        method: 'POST',
        headers:{
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(item),
      });
      
      if(response.ok){
        fetchInventory();//reload inventory after adding
      }
      else{
        console.error('Failed to add item');
      }

    } catch (error) {
      console.error('Failed to add item:', error);
    }

  };

  const deleteItem = async (itemId) =>{
    try {
      console.log('Deleting item with ID: ', itemId);
      const response = await fetch(`http://localhost:5000/inventory/${itemId}`, {
        method: 'DELETE',
      });

      if (response.ok){
        console.log(`Item ${itemId} successfully deleted!`);
        fetchInventory(); //reload the inventory after deletion
      } else{
        console.error('failed to delete item', itemId);
      }
    } catch (error) {
      console.error('failed to delete item: ', error);
    }
  }
  useEffect(() =>{
    fetchInventory();
  }, [csvFilePath]); //reload inventory when csv file path changes
  return(
    <div className='App'>
      <h1> Inventory managament system</h1>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <AddItemForm onAddItem={addItem}/>
      <InventoryList inventory={inventory} onDeleteItem={deleteItem} />
    </div>
  );
};



export default App;
