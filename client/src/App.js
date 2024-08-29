import React, { useState, useEffect} from 'react';
import InventoryList from './components/InventoryList';
import AddItemForm from './components/AddItemForm';


const App = () =>{
  const [inventory, setInventory] = useState([]);

  const fetchInventory = async () =>{
    const response = await fetch('http://localhost:5000/inventory');
    const data = await response.json();
    setInventory(data);
  };

  const addItem = async (item) =>{
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
  }, []);
  return(
    <div className='App'>
      <h1> Iventory managament system</h1>
      <AddItemForm onAddItem={addItem}/>
      <InventoryList inventory={inventory} onDeleteItem={deleteItem} />
    </div>
  );
};



export default App;
