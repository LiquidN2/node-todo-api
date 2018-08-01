const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const timeOut = 3000;

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


/** Before each test:
 * 1. wipe Todo collection
 * 2. add dummy data
 */

beforeEach(function(done) {
    this.timeout(timeOut); // sets timeout longer as building indexing user email for unique value takes time
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
    });
});


describe('PATCH /todos/:id', () => {
    it('should update time todo item is completed', done => {
        const body = {
            text: 'This is an updated text',
            completed: true
        };

        request(app)
            .patch(`/todos/${id}`)
            .send(body)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toNotBe(null);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(id)
                    .then(todo => {
                        expect(todo.text).toBe(body.text);
                        expect(todo.completed).toBe(true);
                        expect(todo.completedAt).toNotBe(null);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should clear time when todo is not completed', done => {
        const body = {
            text: 'this is some random text',
            completed: false
        };

        request(app)
            .patch(`/todos/${idC}`)
            .send(body)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBe(null);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(idC)
                    .then(todo => {
                        expect(todo.text).toBe(body.text);
                        expect(todo.completed).toBe(false);
                        expect(todo.completedAt).toBe(null);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should respond 404 and empty body when id is invalid', done => {
        const invalidId = '1234';
        const body = {
            completed: true
        };
        
        request(app)
            .patch(`/todos/${invalidId}`)
            .send(body)
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
        const body = {
            completed: true
        };
        
        request(app)
            .patch(`/todos/${randomIdString}`)
            .send(body)
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
    });
});
