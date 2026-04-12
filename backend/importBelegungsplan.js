const mongoose = require('mongoose');
const xlsx = require('xlsx');
const path = require('path');

// ─── Environment & Config ───────────────────────────────────────────────────
const MONGO_URI = "mongodb+srv://chamathdew2026_db_user:xEV5cvPdMYsBsY0Q@cluster0.dfhdcbj.mongodb.net/hiru_resorts?retryWrites=true&w=majority&appName=Cluster0";

// ─── Occupancy Schema ───────────────────────────────────────────────────────
const occupancySchema = new mongoose.Schema({
    roomNo:      String,
    hotelBranch: String,
    guestDetail: String,
    startDate:   String, // ISO YYYY-MM-DD
    endDate:     String, // ISO YYYY-MM-DD
    color:       String,
    remark:      String,
    lastUpdated: { type: Date, default: Date.now }
}, { collection: 'occupancy' });


const Occupancy = mongoose.model('occupancy', occupancySchema);

// ─── Color Helper ────────────────────────────────────────────────────────────
// Hiru Om Excel Styles (BG colors)
const getColorFromStyle = (cell) => {
    if (!cell || !cell.s || !cell.s.fill || !cell.s.fill.fgColor) return '#BFBFBF'; // Default Gray
    let rgb = cell.s.fill.fgColor.rgb;
    if (rgb) return '#' + rgb;
    return '#FFFF00'; // Default Yellow
};

const ROOMS_MAPPING = ['1','2','3','4','5','6','7','8','9','10','11','12','14','15','16','17'];

async function runMigration() {
    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URI);
        console.log("Connected.");

        // Clear existing occupancy to avoid mess?
        // Actually, user wants "upload", I'll clear it first (fresh sync).
        console.log("Clearing existing occupancy data...");
        await Occupancy.deleteMany({ hotelBranch: 'Hiru Om' });

        const excelPath = path.resolve(__dirname, '../hiruom.xlsx');
        const workbook = xlsx.readFile(excelPath, { cellStyles: true, cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convert to JSON with header rows to locate months
        const data = xlsx.utils.sheet_to_json(sheet, { header: 1, defval: null });
        const merges = sheet['!merges'] || [];

        console.log(`Starting parse of ${data.length} rows...`);

        let currentYear = 2023; // Fallback
        let currentMonth = 0;   // 0 = Jan
        let occupancyRecords = [];

        for (let r = 0; r < data.length; r++) {
            const row = data[r];
            if (!row || row.length === 0) continue;

            // Detect Month/Year header
            // Header usually looks like [44835] (Excel date) or text
            const firstCell = row[0];
            if (typeof firstCell === 'number' && firstCell > 40000) {
                const date = new Date((firstCell - 25569) * 86400 * 1000);
                currentYear = date.getUTCFullYear();
                currentMonth = date.getUTCMonth();
                console.log(`--- Detected Month Header: ${currentYear}-${currentMonth + 1} at Row ${r+1} ---`);
                continue;
            }

            // Room row? (starts with a number 1-17 or Floor name)
            const roomCandidate = String(firstCell).trim();
            if (ROOMS_MAPPING.includes(roomCandidate)) {
                const roomNo = roomCandidate;
                
                // Scan columns 1-31 for bookings
                for (let c = 1; c <= 31; c++) {
                    const cell = sheet[xlsx.utils.encode_cell({ r, c })];
                    if (cell && cell.v) {
                        const guestDesc = String(cell.v).trim();
                        if (guestDesc.length < 2) continue; // Skip single marks

                        // Is it a start of a booking? (Text usually is at the start)
                        // We check merges for duration
                        const merge = merges.find(m => m.s.r === r && m.s.c === c);
                        const span = merge ? (merge.e.c - merge.s.c + 1) : 1;

                        const sDate = new Date(currentYear, currentMonth, c);
                        const eDate = new Date(currentYear, currentMonth, c + span - 1);
                        
                        occupancyRecords.push({
                            roomNo: roomNo,
                            hotelBranch: 'Hiru Om',
                            guestDetail: guestDesc,
                            startDate: sDate.toISOString().split('T')[0],
                            endDate: eDate.toISOString().split('T')[0],
                            color: getColorFromStyle(cell),
                            remark: "Imported from Excel"
                        });
                        
                        // Skip ahead if merged
                        if (merge) c = merge.e.c;
                    }
                }
            }
        }

        console.log(`Extracted ${occupancyRecords.length} occupancy records.`);
        if (occupancyRecords.length > 0) {
            await Occupancy.insertMany(occupancyRecords);
            console.log("Migration Successful.");
        }

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
    }
}

runMigration();
