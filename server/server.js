const express = require('express');
const bodyParser = require('body-parser');

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
    })
});

app.post('/users', (req, res) => {
    const user = new User({
        email: req.body.email
    });

    user.save().then(doc => {
        res.send(doc);
    }, err => {
        res.status(400).send(err);
    })
});

app.listen(port, () => {
    console.log('Started on port', port);
});