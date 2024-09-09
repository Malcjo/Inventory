import React, { useState } from "react";

const InventoryList =({inventory, onDeleteItem, handleQuantityChange ,updateItemQuantity}) =>{
    //log the inventory data being rendered
    const [popupVisible, setPopupVisible] = useState(false);
    const [customValue, setCustomValue] = useState(0);
    const [selectedItemId, setSelectedItemId] = useState(null);

    //Handle increment button
    const handleIncrement = (itemId) =>{
        updateItemQuantity(itemId, 1);
    };
    //handle decrement button
    const handleDecrement = (itemId) =>{
        updateItemQuantity(itemId, -1);
    };

    //show the custom vlaue popup
    const showCustomPopup = (itemId, currentQuantity) =>{
        setSelectedItemId(itemId);
        setCustomValue(currentQuantity);
        setPopupVisible(true);
    }
    //handle closing popup
    const handleCustomSubmit = () =>{
        updateItemQuantity(selectedItemId, customValue, true);
        setPopupVisible(false);
    }

    console.log('Rendering Inventroy List:  ', inventory);
    return(
        <div>
            <h2>InventoryList</h2>
            <ul>
                {inventory.map((item) => (
                <li key={item.ID}> id - {item.ID}: 
                    {item.Name} 
                    - Quantity:
                    {item.Quantity}
                    <button onClick={() => handleDecrement(item.ID)}>-</button>
                    <button onClick={() => handleIncrement(item.ID)}>+</button>
                    <button onClick={() => showCustomPopup(item.ID, item.Quantity)}>Enter Custom Value</button>
                    {/*<button onClick={() => updateItemQuantity(item.ID)}>Confirm Update Quantity</button>*/}
                    <button onClick={() => onDeleteItem(item.ID)}>Delete</button>
                </li>
                ))}
            </ul>

            {/* Custom value pop-up */}
            {popupVisible && (
                <div className="custom-popup">
                    <h3>Enter Custom Quantity</h3>
                    <input
                        type ="number"
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                    />
                    <button onClick={handleCustomSubmit}>OK</button>
                    <button onClick={()=> setPopupVisible(false)}>Cancel</button>
                </div>
            )}
        </div>
    );
};

export default InventoryList;