const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todosTestData = [
    {text: "First todo text"},
    {text: "Second todo text"}
];

/** Before each test:
 * 1. wipe Todo collection
 * 2. add dummy data
 */
beforeEach(done => {
    Todo.remove({})
        .then(() => Todo.insertMany(todosTestData))
        .then(() => done());
});

describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = 'Test todo text';
        
        request(app)
            .post('/todos')
            .send({text})
            .expect(200) // check response status code
            .expect(res => {
                // check if the server response body 
                expect(res.body.text).toBe(text).toBeA('string');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                /** check if the document is added to the todo collection */
                Todo.find({text})
                    .then(todos => {
                        expect(todos.length).toBe(1);
                        expect(todos[0].text).toBe(text);
                        done();
                    })
                    .catch(err => done(err));
            })
    });

    it('should not create a new todo list with invalid body data', done => {
        request(app)
            .post('/todos')
            .send({text: ''})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find()
                    .then(todos => {
                        expect(todos.length).toBe(todosTestData.length);
                        done();
                    })
                    .catch(err => done(err));
            });
    });
});


describe('GET /todos', () => {
    it('should get all todos docs', done => {
        request(app)
            .get('/todos')
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(todosTestData.length);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find()
                    .then(todos => {
                        expect(todos.length).toBe(todosTestData.length);
                        done();
                    })
                    .catch(err => done(err));
            });
    });
});