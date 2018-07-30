const mongoose = require('mongoose');

const dbName = 'TodoApp';
const dbUrl = `mongodb://localhost:27017/${dbName}`;
const dbOption = { useNewUrlParser: true };

mongoose.connect(dbUrl, dbOption)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log(err));

const Todo = mongoose.model('Todo', {});

Todo.find({text: 'First todo text'})
    .then(results => {
        console.log(results);
    })
    .catch(err => console.log(err));