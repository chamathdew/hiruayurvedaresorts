const mongoose = require('mongoose');

const MONGO_URI = "mongodb+srv://chamathdew2026_db_user:xEV5cvPdMYsBsY0Q@cluster0.dfhdcbj.mongodb.net/hiru_resorts?retryWrites=true&w=majority&appName=Cluster0";

const occupancySchema = new mongoose.Schema({}, { strict: false, collection: 'occupancy' });
const Occupancy = mongoose.model('occupancy', occupancySchema);

async function cleanData() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB.");

        const allOccupancy = await Occupancy.find({}).sort({ roomNo: 1, startDate: 1 });
        console.log(`Found ${allOccupancy.length} records to inspect.`);

        let rooms = {};
        allOccupancy.forEach(occ => {
            if (!rooms[occ.roomNo]) rooms[occ.roomNo] = [];
            rooms[occ.roomNo].push(occ);
        });

        let deleteIds = [];
        let updates = [];

        for (const roomNo in rooms) {
            let bookings = rooms[roomNo];
            for (let i = 0; i < bookings.length - 1; i++) {
                let current = bookings[i];
                let next = bookings[i+1];

                const curEnd = new Date(current.endDate);
                const nextStart = new Date(next.startDate);
                
                // Diff in days
                const diffTime = nextStart - curEnd;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                const isFragment = next.guestDetail === "Guest" || next.guestDetail === "Gue" || next.guestDetail === "S" || next.guestDetail === "Self";
                
                if (diffDays <= 1 && (isFragment || current.guestDetail === next.guestDetail)) {
                    console.log(`Merging ${next.guestDetail} into ${current.guestDetail} in Room ${roomNo}`);
                    
                    current.endDate = next.endDate;
                    updates.push({
                        id: current._id,
                        endDate: next.endDate
                    });
                    deleteIds.push(next._id);
                    
                    // Remove from list so we don't merge it again
                    bookings.splice(i + 1, 1);
                    i--; // Re-check current with the one after the deleted one
                }
            }
        }

        console.log(`Planned: ${updates.length} extensions, ${deleteIds.length} deletions.`);

        for (const up of updates) {
            await Occupancy.updateOne({ _id: up.id }, { endDate: up.endDate });
        }
        if (deleteIds.length > 0) {
            await Occupancy.deleteMany({ _id: { $in: deleteIds } });
        }

        console.log("Cleaning Complete.");
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
    }
}

cleanData();
