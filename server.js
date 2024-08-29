const express = require('express');
const fs = require('fs'); //built in filesystem with node.js
const path = require('path');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors'); //Cross origin resourse sharing
//const { CsvWriter } = require('csv-writer/src/lib/csv-writer');

console.log('starting server');
const app = express();
app.use(cors());
app.use(express.json());

let csvFilePath = 'inventory.csv';
let inventory = [];

//load csv data into memory
const loadCSVData = () => {
    inventory = []; 
    fs.createReadStream(csvFilePath)
      .pipe(csvParser())
      .on('data', (data) => {
        // Check if each row has valid data for ID, Name, and Quantity
        if (data.ID && data.Name && data.Quantity) {
          // Convert quantity to a number if necessary
          data.Quantity = Number(data.Quantity);
          inventory.push(data);
          console.log('Loaded item:', data);
        }
        else{
            console.log('Skipped invalid row:', data);
        }
      })
      .on('end', () => {
        console.log('CSV loaded into memory.', inventory);
      })
      .on('error', (error) => {
        console.error('Error loading CSV file:', error);
      });
  };

//Update CSV File
const updateCSVFile = () =>{
    const CSVWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            {id: 'ID', title: 'ID'},
            {id: 'Name', title: 'Name'},
            {id: 'Quantity', title: 'Quantity'},
        ],
    });

    CSVWriter.writeRecords(inventory).then(() =>{
        console.log('CSV file has been update');
    });
};

loadCSVData();

// Get all inventory items

app.post('/change-csv', (req,res) =>{
    csvFilePath = req.body.filePath;
    loadCSVData();
    res.status(200).json({message: 'CSV file path updated'});
});

app.get('/inventory', (req, res) =>{
    res.json(inventory);
});

app.post('/inventory', (req, res) => {
    const newItem = {
        ID: Date.now().toString(),
        Name: req.body.name,
        Quantity: req.body.quantity,
    };

    inventory.push(newItem);
    updateCSVFile();

    res.status(201).json(newItem);
});

app.delete('/inventory/:id', (req, res) =>{ 
    const itemId = req.params.id;
    const itemIndex = inventory.findIndex(item => item.ID === itemId);
    
    if(itemIndex !== -1){
        //Remove the item from the inventory array
        inventory.splice(itemIndex, 1);

        //Update the csv file after deletionn
        updateCSVFile();

        res.status(200).json({ message: 'Item deleted successfully'});
    } else {
        res.status(404).json({ message: 'Item not found'});
    }
});

app.listen(5000, () =>{
    console.log('Server running on port 5000');
})

