const mongoose = require('mongoose');
const xlsx = require('xlsx');

const uri = "mongodb+srv://chamathdew2026_db_user:xEV5cvPdMYsBsY0Q@cluster0.dfhdcbj.mongodb.net/hiru_resorts?retryWrites=true&w=majority&appName=Cluster0";

const guestSchema = new mongoose.Schema({
    fullName: String,
    nationality: String,
    passportNumber: String,
    arrivalDate: Date,
    visaExpiryDate: Date,
    agent: String,
    dateOfBirth: Date,
    email: String,
    contactNumber: String,
    hotelBranch: { type: String, default: "Hiru Om" },
    paymentStatus: { type: String, default: "Pending" },
    pax: { type: Number, default: 1 }
}, { strict: false });

const Guest = mongoose.model('Guest', guestSchema, 'guests');

function parseDate(v) {
   if (!v) return null;
   let date;
   if (v instanceof Date) {
      date = v;
   } else if (typeof v === 'number') {
      const utc_days  = Math.floor(v - 25569);
      date = new Date(utc_days * 86400000);
   } else if (typeof v === 'string') {
      const parts = v.split('.');
      if (parts.length === 3 && parts[0].length <= 2) {
         date = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      } else {
         date = new Date(v);
      }
   }
   
   if (date && !isNaN(date.getTime())) {
      return date;
   }
   return null;
}


async function run() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB.");

        const wb = xlsx.readFile('../guestsmanagement.xlsx', { cellDates: true });
        let allGuestsToInsert = [];

        for (const sheetName of wb.SheetNames) {
            console.log(`Processing sheet: ${sheetName}`);
            const ws = wb.Sheets[sheetName];
            const data = xlsx.utils.sheet_to_json(ws, { header: 1 });
            
            // Data usually starts at index 6 after headers and month rows
            const rows = data.slice(5).filter(row => row && row[1]); 
            
            const guestsFromSheet = rows.map((row, idx) => {
                // Determine if row is a month header or has valid data
                if (typeof row[1] !== 'string' || row[1].trim() === "") return null;
                
                return {
                    fullName: row[1].trim(),
                    nationality: row[2] || "",
                    passportNumber: row[3] ? String(row[3]).trim() : "",
                    arrivalDate: parseDate(row[4]),
                    visaExpiryDate: parseDate(row[5]),
                    applicantType: row[6] || "",
                    agent: row[7] || "",
                    dateOfBirth: parseDate(row[8]),
                    email: row[9] || "",
                    contactNumber: row[10] ? String(row[10]).trim() : "",
                    hotelBranch: "Hiru Om",
                    createdAt: new Date(),
                    updatedAt: new Date()
                };
            }).filter(g => g !== null);

            allGuestsToInsert = allGuestsToInsert.concat(guestsFromSheet);
            console.log(`Found ${guestsFromSheet.length} guests in sheet ${sheetName}`);
        }

        console.log(`Total prepared guests for insertion: ${allGuestsToInsert.length}`);
        
        if (allGuestsToInsert.length > 0) {
            // Optional: Clear existing guests if desired, otherwise append
            console.log("Clearing existing Hiru Om guests for a fresh import...");
            await Guest.deleteMany({ hotelBranch: "Hiru Om" }); 
            
            await Guest.insertMany(allGuestsToInsert);

            console.log("All sheets imported successfully!");
        } else {
            console.log("No valid rows found to insert.");
        }
    } catch (err) {
        console.error("Error during insertion:", err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}
run();

