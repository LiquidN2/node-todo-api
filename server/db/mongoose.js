const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema;


const dbName = '';
const dbUrl = process.env.MONGODB_URI;
const dbOptions = { useNewUrlParser: true };

mongoose.Promise = global.Promise;

// mongoose.connect(dbUrl, dbOptions);
mongoose.connect(dbUrl, dbOptions).then(() => {
    console.log('Connected to MongoDB server');
}, error => {
    console.log(error.message);
});

module.exports = { mongoose };