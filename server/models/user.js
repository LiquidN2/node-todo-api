const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema;

// define schima for 'User' collection
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1
    }
});

const User = mongoose.model('User', userSchema);

module.exports = {User};