const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

const {mongoose} = require('./db/mongoose'); 
const {Todo} = require('./models/todo');
const {User} = require('./models/user');

const app = express();
const port = process.env.PORT || 3000;

// parsing JSON in the body of the quest
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
    // console.log(req.body);
    const todo = new Todo({
        text: req.body.text
    });

    todo.save().then(doc => {
        res.send(doc);
    }, err => {
        res.status(400).send(err);
    });
});

app.get('/todos', (req, res) => {
    Todo.find().then(todos => {
        res.send({todos});
    }, err => {
        res.status(400).send(err);
    })
});

app.get('/todos/:id', (req, res) => {
    const id = req.params.id;

    if (!ObjectID.isValid(id)) {
        return res.status(404).send();
    }

    Todo.findById(id)
        .then(todo => {
            if(!todo) {
                return res.status(400).send({
                    message: 'Unable to find doc matching requested id'
                });
            }
            
            res.status(200).send({todo});
        })
        .catch(err => res.status(400).send());

});

app.post('/users', (req, res) => {
    const user = new User({
        email: req.body.email
    });

    user.save().then(doc => {
        res.send(doc);
    }, err => {
        res.status(400).send(err);
    });
});

app.listen(port, () => {
    console.log('Started on port', port);
});

module.exports = {app};