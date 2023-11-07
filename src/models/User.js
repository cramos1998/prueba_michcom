const { Schema, model } = require('mongoose');


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        require: true,
    },
    scope: {
        type: String,
    },
    rut: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        }
});


module.exports = model('User', userSchema);