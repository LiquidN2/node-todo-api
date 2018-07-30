const mongoose = require('mongoose');

const dbName = 'TodoApp';
const dbUrl = `mongodb://localhost:27017/${dbName}`;
const dbOption = { useNewUrlParser: true };

mongoose.connect(dbUrl, dbOption)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

/** Create collection schema */
const todoSChema = new mongoose.Schema({
    text: {
        type: String,
        require: true,
        trim: true,
        minlength: 1
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

/** compile todo collection */
const Todo = mongoose.model('Todo', todoSChema);

/** define new doc */
const todo = new Todo({
    text: 'Buy Milk'
});

/** save doc */
todo.save()
    .then(doc => console.log(doc))
    .catch(err => console.log(err));
