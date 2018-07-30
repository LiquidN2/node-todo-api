const {ObjectID} = require('mongodb');

const mongoose = require('./../server/db/mongoose');
const {Todo} = require('./../server/models/todo');
const {User} = require('./../server/models/user');

const id = '5b5ab55d5555231d36c970cc';
const text = 'Buy Milk';

const handleResult = results => {
    if (!results) {
        return console.log('Unable to find doc(s)');
    }
    console.log('Results:', results);
};

const handleError = err => console.log(err);

if(!ObjectID.isValid(id)) {
    console.log('id not valid');    
}

// find and return an array of matches
// Todo.find({text: text})
//     .then(todos => { 
//         if (!todos) {
//             return console.log('Unable to find doc');
//         }

//         console.log('Todos', todos)
//     })
//     .catch(err => console.log(err));

Todo.find({text: text})
    .then(handleResult)
    .catch(handleError);

// find and return one match
Todo.findOne({_id: id})
    .then(todo => { 
        if (!todo) {
            return console.log('Unable to find doc');
        }
        
        console.log('Todo', todo); 
    })
    .catch(err => console.log(err));

Todo.findById(id)
    .then(todo => { 
        if (!todo) {
            return console.log('Unable to find doc');
        }
        
        console.log('Todo', todo); 
    })
    .catch(err => console.log(err));


User.find({email: 'johndoe@example.com'})
    .then(handleResult)
    .catch(handleError);