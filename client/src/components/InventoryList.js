import React from "react";

const InventoryList =({inventory, onDeleteItem, handleQuantityChange ,updateItemQuantity}) =>{
    //log the inventory data being rendered
    console.log('Rendering Inventroy List:  ', inventory);
    return(
        <div>
            <h2>InventoryList</h2>
            <ul>
                {inventory.map((item) => (
                <li key={item.ID}> id - {item.ID}: 
                    {item.Name} 
                    - Quantity:
                    <input
                        type = "number"
                        value ={item.Quantity}
                        onChange={(e) => handleQuantityChange(e, item.ID)}
                    />
                    {item.Quantity}
                    <button onClick={() => updateItemQuantity(item.ID)}>Confirm Update Quantity</button>
                    <button onClick={() => onDeleteItem(item.ID)}>Delete</button>
                </li>
                ))}
            </ul>
        </div>
    );
};

export default InventoryList;