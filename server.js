const express = require('express');
const fs = require('fs'); //built in filesystem with node.js
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors'); //Cross origin resourse sharing
//const { CsvWriter } = require('csv-writer/src/lib/csv-writer');

console.log('starting server');
const app = express();
app.use(cors());
app.use(express.json());

const csvFilePath = 'inventory.csv';

let inventory = [];

//load csv data into memory
const loadCSVData = () =>{
    inventory = [];
    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (data) => inventory.push(data))
        .on('end', () =>{
            console.log('CSV loaded into memory');
        });
};

//Update CSV File
const updateCSVFile = () =>{
    const CSVWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            {id: 'id', title: 'ID'},
            {id: 'name', title: 'Name'},
            {id: 'quantity', title: 'Quantity'},
        ],
    });

    CSVWriter.writeRecords(inventory).then(() =>{
        console.log('CSV file has been update');
    });
};

loadCSVData();

// Get all inventory items

app.get('/inventory', (req, res) =>{
    res.json(inventory);
});

app.post('/inventory', (req, res) => {
    const newItem = {
        id: Date.now().toString(),
        name: req.body.name,
        quantity: req.body.quantity,
    };

    inventory.push(newItem);
    updateCSVFile();

    res.status(201).json(newItem);
});

app.listen(5000, () =>{
    console.log('Server running on port 5000');
})