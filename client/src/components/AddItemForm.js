import React, {useState} from "react";

const AddItemForm = ({ onAddItem}) => {
    const [Name, setName] = useState('');
    const [Quantity, setQuantity] = useState('');

    const handleSubmit = (e) =>{
        e.preventDefault();
        const newItem = { ID: Date.now().toString(), Name: Name, Quantity: parseInt(Quantity, 10) };
        onAddItem({newItem});
        setName('');
        setQuantity('');
    };

    return (
        <form onSubmit={handleSubmit}>
            <div>
                <label>Name:</label>
                <input
                    type="text"
                    value={Name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
            </div>
            <div>
                <label>Quantity:</label>
                <input 
                    type="number"
                    value={Quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                />
            </div>
            <button type="submit">Add Item</button>
        </form>
    );
};

export default AddItemForm;