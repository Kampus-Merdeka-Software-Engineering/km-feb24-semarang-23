const fs = require('fs');
const csv = require('csv-parser');

// Array to store JSON objects
let jsonArray = [];

// Read the CSV file and convert to JSON
fs.createReadStream('D:/ITSK/MBKM/pizza-sales.csv')
  .pipe(csv())
  .on('data', (row) => {
    jsonArray.push(row);
  })
  .on('end', () => {
    // Convert array to JSON string
    const jsonString = JSON.stringify(jsonArray, null, 2);

    // Write JSON string to a file
    fs.writeFileSync('datas.json', jsonString);

    console.log('CSV file successfully converted to JSON!');
  });