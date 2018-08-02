const {ObjectID} = require('mongodb');

const {Todo} = require('./../../models/todo');

const id = new ObjectID();
const idString = id.toHexString();
const idC = new ObjectID();
const idCString = idC.toHexString();

const todosTestData = [
    {
        _id: id, 
        text: "First todo text 1"
    },{
        _id: idC,
        text: "Second todo text 2",
        complete: true,
        completedAt: new Date().getTime()
    }
];

const timeOut = 3000;

const populateTodos = function(done) {
    this.timeout(timeOut); // sets timeout longer as building indexing user email for unique value takes time
    Todo.remove({})
        .then(() => Todo.insertMany(todosTestData))
        .then(() => done());
};

module.exports = {
    id,
    idString,
    idC,
    idCString,
    todosTestData,
    timeOut,
    populateTodos
};