require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose'); 
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
const {authenticate} = require('./middleware/authenticate');

const app = express();
const port = process.env.PORT;

// parsing JSON in the body of the quest
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    const body = _.pick(req.body, ['text']);

    const todo = new Todo(body);

    todo.save().then(doc => {
        res.send(doc);
    }, err => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then(todos => {
        res.status(200).send({todos});
    }, err => {
        res.status(400).send(err);
    })
});

app.get('/todos/:id', (req, res) => {
    // get the id
    const id = req.params.id;

    // validate id -> not valid return 404
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id)
        .then(todo => {
            if(!todo) {
                return res.status(404).send({
                    message: 'Unable to find doc matching requested id'
                });
            }

            res.status(200).send({todo});
        })
        .catch(err => res.status(400).send());

});

app.delete('/todos/:id', (req, res) => {
    // get the id
    const id = req.params.id;
    
    // validate id -> not valid return 404
    if(!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    // check if doc exists in collection
    Todo.findByIdAndRemove(id)
        .then(todo => {
            if(!todo) {
                return res.status(404).send({
                    message: 'Unable to find doc matching requested id'
                });
            }
            res.status(200).send({todo});
        })
        .catch(err => res.status(400).send());

});

app.patch('/todos/:id', (req, res) => {
    const id = req.params.id;
    const body = _.pick(req.body, ['text', 'completed']); // return a new body obj with only 'text' and 'completed' 
    
    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    if (_.isBoolean(body.completed) && body.completed) {
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    Todo.findByIdAndUpdate(id, {$set: body}, {new: true})
        .then(todo => {
            if(!todo) {
                return res.status(404).send({
                    message: 'Unable to find doc matching requested id'
                });
            }

            res.status(200).send({todo});
        })
        .catch(err => res.status(400).send());
});

app.post('/users', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    
    const user = new User(body);

    user.save().then(() => {
        return user.generateAuthToken();
        // res.send(doc);
    }).then(token => {
        res.header('x-auth', token).send(user);
    }).catch(err => res.status(400).send());
});

app.post('/users/login', (req, res) => {
    const body = _.pick(req.body, ['email', 'password']);
    let foundUser;

    User.findByCredential(body.email, body.password)
        .then(user => {
            // res.send(user);
            foundUser = user;
            return user.generateAuthToken();
        })
        .then(token => {
            res.header('x-auth', token).send(foundUser);
        })
        .catch(err => {
            res.status(400).send();
        });
})

app.get('/users/me', authenticate, (req, res) => {
    res.send(req.user);
});

app.listen(port, () => {
    console.log('Started on port', port);
});

module.exports = {app};