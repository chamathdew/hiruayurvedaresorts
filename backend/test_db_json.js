require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        fs.writeFileSync('db_error.json', JSON.stringify({ status: 'success' }));
        process.exit(0);
    })
    .catch((err) => {
        fs.writeFileSync('db_error.json', JSON.stringify(err, Object.getOwnPropertyNames(err), 2));
        process.exit(1);
    });
