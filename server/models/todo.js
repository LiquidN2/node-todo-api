const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema;

// define schema for 'todo' collection
const todoSchema = new Schema({
    text: { 
        type: String,
        required: true,
        minlength: 1,
        trim: true 
    },
    completed: { 
        type: Boolean,
        default: false
    },
    completedAt: { 
        type: Number,
        default: null 
    }
});

// compile 'Todo' collection
const Todo = mongoose.model('Todo', todoSchema);

module.exports = {Todo};