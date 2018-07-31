const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const id = new ObjectID();
const idString = id.toString();

const todosTestData = [
    {
        _id: id, 
        text: "First todo text"
    },
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


describe('GET /todos/:id', () => {
    it('should get todo doc by id', done => {
        request(app)
            .get(`/todos/${idString}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(idString);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(idString)
                    .then(todo => {
                        // expect(todo._id.toString()).toBe(idString);
                        expect(todo).toInclude({_id: id});
                        done();
                    })
                    .catch(err => done(err));
            })
    });

    it('should respond 404 error and empty body when id is invalid', done => {
        const invalidId = '1234';
        request(app)
            .get(`/todos/${invalidId}`)
            .expect(404)
            .expect(res => {
                const numProp = Object.keys(res.body).length;
                expect(numProp).toBe(0);
            })
            .end((err,res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    })

    it('should respond 404 error and inform user when id is valid but not existing in collection', done => {
        const randomId = new ObjectID();
        const randomIdString = randomId.toString();
        request(app)
            .get(`/todos/${randomIdString}`)
            .expect(404)
            .expect(res => {
                expect(res.body).toInclude({
                    message: 'Unable to find doc matching requested id'
                });
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(randomIdString)
                    .then(todo => {
                        expect(todo).toNotExist();
                        done();
                    })
                    .catch(err => done(err));
            });
    })
})


describe('DELETE /todos/:id', () => {
    it('should remove doc with id', done => {
        request(app)
            .delete(`/todos/${idString}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo).toInclude({_id: id});
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                
                Todo.findById(idString)
                    .then(todo => {
                        if(todo) { 
                            return done(err);
                        }
                        done();
                    }).catch(err => done(err))
            });
    });

    it('should respond 404 error and empty body when id is invalid', done => {
        const invalidId = '1234';
        request(app)
            .delete(`/todos/${invalidId}`)
            .expect(404)
            .expect(res => {
                const numProp = Object.keys(res.body).length;
                expect(numProp).toBe(0);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                done();
            })
    });

    it('should respond 404 error and inform user when id is valid but not existing in collection', done => {
        const randomId = new ObjectID();
        const randomIdString = randomId.toString();
        
        request(app)
            .delete(`/todos/${randomIdString}`)
            .expect(404)
            .expect(res => {
                expect(res.body).toInclude({
                    message: 'Unable to find doc matching requested id'
                });
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                Todo.findById(randomIdString)
                    .then(todo => {
                        expect(todo).toNotExist();
                        done();
                    })
                    .catch(err => done(err));
            });
    })
});