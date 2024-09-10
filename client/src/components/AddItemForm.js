import React, { useState } from "react";

const AddItemForm = ({ onAddItem }) => {
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    if (name && quantity) {
      const newItem = { ID: Date.now().toString(), Name: name, Quantity: parseInt(quantity, 10) };
      onAddItem(newItem);
      setName('');
      setQuantity('');
    } else {
      alert('Please provide both name and quantity.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Quantity:</label>
        <input
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>
      <button type="submit">Add Item</button>
    </form>
  );
};

export default AddItemForm;
