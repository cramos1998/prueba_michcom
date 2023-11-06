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
        require: true,
    },
    rut: {
        type: String,
        require: true,
    },
    status: {
        type: String,
        require: true,
        }
});


module.exports = model('User', userSchema);