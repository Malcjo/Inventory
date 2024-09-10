import React from 'react';

const InventoryList = ({ inventory, updateItemQuantity, deleteItem }) => {
  return (
    <div>
      <h2>Inventory List</h2>
      <ul>
        {inventory.map(item => (
          <li key={item.ID}>
            {item.Name} - Quantity: {item.Quantity}
            <button onClick={() => updateItemQuantity(item.ID, 1)}>+</button>
            <button onClick={() => updateItemQuantity(item.ID, -1)}>-</button>
            <button onClick={() => deleteItem(item.ID)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InventoryList;
