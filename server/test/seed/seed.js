const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const seedUsers = [
    {
        _id: userOneId,
        email: 'johndoe@example.com',
        password: 'userOnePass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userOneId, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    }, {
        _id: userTwoId,
        email: 'adamsmith@test.net',
        password: 'userTwoPass',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: userTwoId, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    }
];

const seedTodos = [
    {
        _id: new ObjectID(),
        text: "First todo text 1",
        _creator: userOneId
    },{
        _id: new ObjectID(),
        text: "Second todo text 2",
        complete: true,
        completedAt: new Date().getTime(),
        _creator: userTwoId
    }
];


const timeOut = 2500;

const populateTodos = function(done) {
    this.timeout(timeOut); // sets timeout longer as building indexing user email for unique value takes time
    Todo.remove({})
        .then(() => Todo.insertMany(seedTodos))
        .then(() => done());
};

const populateUsers = function(done) {
    this.timeout(timeOut);
    User.remove({})
        .then(() => {
            const userOne = new User(seedUsers[0]).save();
            const userTwo = new User(seedUsers[1]).save();

            return Promise.all([userOne, userTwo]);
        })
        .then(() => done());
}

module.exports = {
    seedTodos,
    seedUsers,
    timeOut,
    populateTodos,
    populateUsers
};