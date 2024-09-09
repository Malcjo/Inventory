const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors');

console.log('starting server');
const app = express();
app.use(cors());
app.use(express.json());

let csvFilePath = 'inventory.csv';
let inventory = [];

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Save file with original name
    }
});

const upload = multer({ storage: storage });

// Load CSV data into memory
const loadCSVData = () => {
    if (!csvFilePath) {
        console.error("CSV file path is not defined");
        return;
    }

    console.log("loading CSV file from file path", csvFilePath);
    inventory = [];
    fs.createReadStream(csvFilePath)
        .pipe(csvParser())
        .on('data', (data) => {
            if (data.ID && data.Name && data.Quantity) {
                data.Quantity = Number(data.Quantity);
                inventory.push(data);
                console.log('Loaded item:', data);
            } else {
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

// Update CSV File
const updateCSVFile = () => {
    const CSVWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'ID', title: 'ID' },
            { id: 'Name', title: 'Name' },
            { id: 'Quantity', title: 'Quantity' },
        ],
    });

    CSVWriter.writeRecords(inventory).then(() => {
        console.log('CSV file has been updated');
    }).catch(error => {
        console.error("error updating CSV file: ", error)
    });
};



loadCSVData();

app.post('/change-csv', upload.single('csvFile'), (req, res) => {
    if (!req.file) {
        console.error("No CSV file path provided!");
        return res.status(400).json({ message: 'No File uploaded' });
    }

    csvFilePath = path.resolve(req.file.path);
    loadCSVData();
    res.status(200).json({ message: 'CSV file path updated' });
});

app.get('/inventory', (req, res) => {
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

app.put('/inventory/:id', (req,res) =>{
    const itemId = String(req.params.id);
    const newQuantity = req.body.quantity;//extract the quantity from request body

    const itemIndex = inventory.findIndex(item => item.ID === itemId);

    if(itemIndex !== -1){
        console.log("item index != -1 ");
        inventory[itemIndex].Quantity = newQuantity;//update the quanitiy


        updateCSVFile();//Persist the update to the CSV file
        console.log("Update successful");
        res.status(200).json({message: "Quantity updated successfully"});
    }
    else{
        console.log("Update failed, item not found");
        res.status(404).json({message: "Item no found"});
    }
});

app.delete('/inventory/:id', (req, res) => {
    const itemId = req.params.id;
    const itemIndex = inventory.findIndex(item => item.ID === itemId);

    if (itemIndex !== -1) {
        inventory.splice(itemIndex, 1);
        updateCSVFile();
        res.status(200).json({ message: 'Item deleted successfully' });
    } else {
        res.status(404).json({ message: 'Item not found' });
    }
});

app.listen(5000, () => {
    console.log('Server running on port 5000');
});
