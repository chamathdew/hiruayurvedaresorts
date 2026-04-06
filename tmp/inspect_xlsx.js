const xlsx = require('xlsx');
try {
    const wb = xlsx.readFile('c:/Users/dewmo/Pictures/hiruayurvedaresort/guestsmanagement.xlsx', { cellDates: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
    console.log(JSON.stringify(data.slice(0, 15), null, 2));
} catch (err) {
    console.error(err);
}
