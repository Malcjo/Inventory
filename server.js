const express = require('express');
const fs = require('fs'); //built in filesystem with node.js
const path = require('path');
const multer = require('multer');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors'); //Cross origin resourse sharing
const { error } = require('console');
//const { CsvWriter } = require('csv-writer/src/lib/csv-writer');

console.log('starting server');
const app = express();
app.use(cors());
app.use(express.json());

let csvFilePath = 'uploads/inventory.csv';
let inventory = [];

//configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req,file, cb) =>{
        cb(null, 'uploads/');
    },
    filename: (req,file, cb)=>{
        cb(null,file.originalname);// save file with original name
    }
});

const upload = multer({storage: storage});

//load csv data into memory
const loadCSVData = () => {

    if(!csvFilePath){
        console.error("CSV file path is not defined");
        return;
    }
    
    console.log("loading CSV file from file path", csvFilePath);
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
    }).catch(error =>{
        console.error("error updating CSV file: ", error)
    });
};

loadCSVData();

// Get all inventory items

// endpoint to change the csv file path or upload a new csv


app.post('/change-csv', upload.single('csvFile'), (req,res) =>{
    if(!req.file){
        console.error("No CSV file path provided!");
        return res.status(400).json({message: 'No File uploaded'});
    }

    csvFilePath = path.join(__dirname, req.file.path);

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

