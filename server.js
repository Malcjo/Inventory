const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const csvParser = require('csv-parser');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const cors = require('cors');
const { CsvWriter } = require('csv-writer/src/lib/csv-writer');

console.log('starting server');
const app = express();
app.use(cors());
app.use(express.json());

let csvFilePath = 'uploads/newInventory.csv';
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
    let rowCount = 0;

    if(fs.existsSync(csvFilePath)){
        fs.createReadStream(csvFilePath)
            .pipe(csvParser())
            .on('data', (data) => {
            
            rowCount++;
            console.log('rowCount: ', rowCount);
            console.log('Raw data row: ', data);

            // check if the row contans valid data
            if (data.ID && data.Name && data.Quantity) {
                console.log(`Valid row detected: ID=${data.ID}, Name=${data.Name}, Quantity=${data.Quantity}`);
                
                if(!data.ID || data.ID.length < 10){
                    console.log("ID is too short");
                    data.ID = Date.now().toString(); 
                    console.log('new id: ', data.ID);
                }
            
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
    }
    else{
        console.log("CSV file does not exist, intializin empty inventory.");
    }
};


const updateOrAppendCSVFile = () =>{
    const CSVWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'ID', title: 'ID' },
            { id: 'Name', title: 'Name' },
            { id: 'Quantity', title: 'Quantity' },
        ],
        append: fs.existsSync(csvFilePath),
    });

    CsvWriter.writeRecords(inventory).then(() => {
        console.log("CSV file updated or appended successfully")
    })
}

// Update CSV File
const updateCSVFile = () => {
    const CSVWriter = createCsvWriter({
        path: csvFilePath,
        header: [
            { id: 'ID', title: 'ID' },
            { id: 'Name', title: 'Name' },
            { id: 'Quantity', title: 'Quantity' },
        ],
        append: fs.existsSync(csvFilePath),
    });

    const filteredInventory = inventory.filter(item => item.ID && item.Name && item.Quantity);

    if(filteredInventory.length !== inventory.length){
        console.log('Warning: Some invalid items were removed before saving.');
    }

    CSVWriter.writeRecords(filteredInventory)
    .then(() => {
        console.log('CSV file has been updated');
    })
    .catch(error => {
        console.error("error updating CSV file: ", error)
    });
    loadCSVData();
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
    //updateOrAppendCSVFile();
    updateCSVFile();
    res.status(201).json(newItem);
});

app.put('/inventory/:id', (req,res) =>{
    const itemId = parseInt(req.params.id);
    const newQuantity = req.body.quantity;//extract the quantity from request body

    const itemIndex = inventory.findIndex(item => parseInt(item.ID) === itemId);

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

app.post('/save-blank-csv', (req, res) => {
    fs.writeFileSync(csvFilePath, 'ID,Name,Quantity\n', 'utf-8');
    inventory = [];
    res.status(200).json({message: "Bland CSV created and loaded for editing"});
})

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
