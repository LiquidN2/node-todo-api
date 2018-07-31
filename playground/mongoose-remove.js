const mongoose = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');

// remove all documents in collection
// Todo.remove({})
//     .then(result => console.log(result))
//     .catch(err => console.log(err));

// Todo.findOneAndRemove({text: "Buy milk"})
//     .then(result => console.log(result))
//     .catch(err => console.log(err));

// const id = "5b5f9cf46135502053fcf028";
// Todo.findByIdAndRemove(id)
//     .then(result => console.log(result))
//     .catch(err => console.log(err));