const xlsx = require('xlsx');
const path = require('path');
try {
    const filePath = path.join(__dirname, '..', 'guestsmanagement.xlsx');
    console.log("Reading file:", filePath);
    const wb = xlsx.readFile(filePath, { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
    console.log(JSON.stringify(data.slice(0, 10), null, 2));
} catch (err) {
    console.error(err);
}
