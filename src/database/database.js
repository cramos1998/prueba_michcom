const mongoose = require('mongoose');
require('dotenv').config();


const username = process.env.DB_USERNAME;
const password = process.env.DB_PASSWORD;
const database = process.env.DB_DATABASE;

const DB_URI = `mongodb+srv://${username}:${password}@cluster0.ornhf.mongodb.net/${database}`;

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(db => console.log('DB is connected'))
.catch(err => console.log(err));

