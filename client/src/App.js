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
  useEffect(() =>{
    fetchInventory();
  }, []);
  return(
    <div className='App'>
      <h1> Iventory managament system</h1>
      <AddItemForm onAddItem={addItem}/>
      <InventoryList inventory={inventory} />
    </div>
  );
};



export default App;
