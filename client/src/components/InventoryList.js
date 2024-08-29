import React from "react";

const InventoryList =({inventory, onDeleteItem}) =>{
    //log the inventory data being rendered
    console.log('Rendering Inventroy List:  ', inventory);
    return(
        <div>
            <h2>InventoryList</h2>
            <ul>
                {inventory.map((item) => (
                <li key={item.ID}> id - {item.ID}: 
                    {item.Name} - Quantity: {item.Quantity}
                    <button onClick={() => onDeleteItem(item.ID)}>Delete</button>
                </li>
                ))}
            </ul>
        </div>
    );
};

export default InventoryList;