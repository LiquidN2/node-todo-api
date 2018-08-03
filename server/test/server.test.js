const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

// seed data
const {seedTodos, populateTodos, seedUsers, populateUsers} = require('./seed/seed');

/** Before each test:
 * 1. wipe Todos & Users collection
 * 2. add seed data
 */
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo for autheticated user', done => {
        const token = seedUsers[0].tokens[0].token;
        // const text = 'New todo text by user one';
        const body = {
            text: 'New todo text by user one',
            _creator: seedUsers[0]._id
        }

        request(app)
            .post('/todos')
            .set('x-auth', token)
            .send(body)
            .expect(200) // check response status code
            .expect(res => {
                // check if the server response body 
                expect(res.body.text).toBe(body.text).toBeA('string');
                expect(res.body._creator).toBe(body._creator.toHexString()).toBeA('string');
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                /** check if the document is added to the todo collection */
                Todo.find({"_creator": seedUsers[0]._id.toHexString()})
                    .then(todos => {
                        expect(todos.length).toBe(2);
                        expect(todos[1].text).toBe(body.text);
                        done();
                    })
                    .catch(err => done(err));
            })
    });

    it('should not create a new todo list with invalid body data', done => {
        const token = seedUsers[0].tokens[0].token;

        request(app)
            .post('/todos')
            .set('x-auth', token)
            .send({text: ''})
            .expect(400)
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find()
                    .then(todos => {
                        expect(todos.length).toBe(seedTodos.length);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should respond 401 if user not authenticated', done => {
        request(app)
            .post('/todos')
            .set('x-auth', 'dummytoken')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});


describe('GET /todos', () => {
    it('should get all todos docs for authenticated user', done => {
        const token = seedUsers[0].tokens[0].token;
    
        request(app)
            .get('/todos')
            .set('x-auth', token)
            .expect(200)
            .expect(res => {
                expect(res.body.todos.length).toBe(1);
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.find({"_creator": seedUsers[0]._id.toHexString()})
                    .then(todos => {
                        expect(todos.length).toBe(1);
                        done();
                    })
                    .catch(err => done(err));
            });

    });

    it('should respond 401 if user not authenticated', done => {
        request(app)
            .get('/todos')
            .set('x-auth', 'dummytoken')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});


describe('GET /todos/:id', () => {
    it('should get todo doc by id', done => {
        const token = seedUsers[0].tokens[0].token;
        request(app)
            .get(`/todos/${seedTodos[0]._id.toHexString()}`)
            .set('x-auth', token)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(seedTodos[0]._id.toHexString());
                expect(res.body.todo._creator).toBe(seedUsers[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findOne({
                    _id: seedTodos[0]._id.toHexString(),
                    _creator: seedUsers[0]._id.toHexString()
                }).then(todo => {
                    expect(todo).toExist();
                    done();
                }).catch(err => done(err));
            })
    });

    it('should respond 404 error and empty body when id is invalid', done => {
        const invalidId = '1234';
        const token = seedUsers[0].tokens[0].token;
        request(app)
            .get(`/todos/${invalidId}`)
            .set('x-auth', token)
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });

    it('should respond 404 error when one authenticated user attempting to get todo of another user', done => {
        const tokenOne = seedUsers[0].tokens[0].token;
        // const randomId = new ObjectID().toHexString();
        const todoIdTwo = seedTodos[1]._id.toHexString();

        request(app)
            .get(`/todos/${todoIdTwo}`)
            .set('x-auth', tokenOne)
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

                Todo.findOne({
                    '_id': todoIdTwo,
                    '_creator': seedUsers[0]._id.toHexString()
                }).then(todo => {
                    expect(todo).toNotExist();
                    done();
                }).catch(err => done(err));
            });
    });

    it('should respond 401 if user not authenticated', done => {
        request(app)
            .get(`/todos/${seedTodos[0]._id.toHexString()}`)
            .set('x-auth', 'dummytoken')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});


describe('DELETE /todos/:id', () => {
    it('should remove doc with id', done => {
        const token = seedUsers[0].tokens[0].token;

        request(app)
            .delete(`/todos/${seedTodos[0]._id.toHexString()}`)
            .set('x-auth', token)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(seedTodos[0]._id.toHexString());
                expect(res.body.todo._creator).toBe(seedUsers[0]._id.toHexString());
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                
                Todo.findOne({
                    _id: seedTodos[0]._id.toHexString(),
                    _creator: seedUsers[0]._id.toHexString()
                }).then(todo => {
                    expect(todo).toNotExist();    
                    done();
                }).catch(err => done(err));
            });
    });

    it('should respond 404 error and empty body when id is invalid', done => {
        const token = seedUsers[0].tokens[0].token;
        const invalidId = '1234';

        request(app)
            .delete(`/todos/${invalidId}`)
            .set('x-auth', token)
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });

    it('should respond 404 error when one authenticated user attempting to delete todo of another user', done => {
        const tokenOne = seedUsers[0].tokens[0].token;
        // const randomId = new ObjectID().toHexString();
        const todoIdTwo = seedTodos[1]._id.toHexString();
        
        request(app)
            .delete(`/todos/${todoIdTwo}`)
            .set('x-auth', tokenOne)
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

                Todo.findOne({
                    _id: todoIdTwo,
                    _creator: seedUsers[0]._id.toHexString()
                }).then(todo => {
                    expect(todo).toNotExist();    
                    done();
                }).catch(err => done(err));
            });
    });

    it('should respond 401 if user not authenticated', done => {
        request(app)
            .delete(`/todos/${seedTodos[0]._id.toHexString()}`)
            .set('x-auth', 'dummytoken')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});


describe('PATCH /todos/:id', () => {
    it('should update time todo item is completed', done => {
        const token = seedUsers[0].tokens[0].token;
        const body = {
            text: 'This is an updated text',
            completed: true
        };

        request(app)
            .patch(`/todos/${seedTodos[0]._id.toHexString()}`)
            .set('x-auth', token)
            .send(body)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(true);
                expect(res.body.todo.completedAt).toNotBe(null);
                expect(res.body.todo._creator).toBe(seedUsers[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findOne({
                    _id: seedTodos[0]._id.toHexString(),
                    _creator: seedUsers[0]._id.toHexString()
                }).then(todo => {
                    expect(todo.text).toBe(body.text);
                    expect(todo.completed).toBe(true);
                    expect(todo.completedAt).toNotBe(null);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should clear time when todo is not completed', done => {
        const token = seedUsers[1].tokens[0].token;
        const body = {
            text: 'this is some random text',
            completed: false
        };

        request(app)
            .patch(`/todos/${seedTodos[1]._id.toHexString()}`)
            .set('x-auth', token)
            .send(body)
            .expect(200)
            .expect(res => {
                expect(res.body.todo.text).toBe(body.text);
                expect(res.body.todo.completed).toBe(false);
                expect(res.body.todo.completedAt).toBe(null);
                expect(res.body.todo._creator).toBe(seedUsers[1]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findOne({
                    _id: seedTodos[1]._id.toHexString(),
                    _creator: seedUsers[1]._id.toHexString()
                }).then(todo => {
                    expect(todo.text).toBe(body.text);
                    expect(todo.completed).toBe(false);
                    expect(todo.completedAt).toBe(null);
                    done();
                }).catch(err => done(err));
            });
    });

    it('should respond 404 and empty body when id is invalid', done => {
        const token = seedUsers[0].tokens[0].token;
        const invalidId = '1234';
        const body = {
            completed: true
        };
        
        request(app)
            .patch(`/todos/${invalidId}`)
            .set('x-auth', token)
            .send(body)
            .expect(404)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });

    it('should respond 404 error when authenticated user trying to patch todo of another user', done => {
        const tokenOne = seedUsers[0].tokens[0].token;
        // const randomId = new ObjectID().toHexString();
        const todoIdTwo = seedTodos[1]._id.toHexString();
        const body = {
            completed: false
        };
        
        request(app)
            .patch(`/todos/${todoIdTwo}`)
            .set('x-auth', tokenOne)
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

                Todo.findOne({
                    _id: todoIdTwo,
                    _creator: seedUsers[0]._id.toHexString()
                }).then(todo => {
                    expect(todo).toNotExist();    
                    done();
                }).catch(err => done(err));
            });
    });

    it('should respond 401 if user not authenticated', done => {
        request(app)
            .patch(`/todos/${seedTodos[0]._id.toHexString()}`)
            .set('x-auth', 'dummytoken')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});


describe('GET /users/me', () => {
    it('should return user if authenticate', done => {
        const token = seedUsers[0].tokens[0].token;
        request(app)
            .get('/users/me')
            .set('x-auth', token)
            .expect(200)
            .expect(res => {
                expect(res.body._id).toBe(seedUsers[0]._id.toHexString());
                expect(res.body.email).toBe(seedUsers[0].email);
            })
            .end(done);
    });

    it('should return 401 if not authenticated', done => {
        request(app)
            .get('/users/me')
            .set('x-auth', 'dummytoken')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});


describe('POST /users', () => {
    it('should create a user', done => {
        const email = 'johnhandcock@example.com';
        const password = 'userThreePass';
        
        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body._id).toExist();
                expect(res.body.email).toBe(email);
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                User.findOne({email})
                    .then(user => {
                        expect(user).toExist();
                        expect(user.password).toNotBe(password);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should return validation erros if request invalid', done => {
        const email = 'invalid@example';
        const password = 'user';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });

    it('should not create user if email in use', done => {
        const email = seedUsers[0].email;
        const password = 'userOnePass!';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(400)
            .end(done);
    });
});


describe('POST /users/login', () => {
    it('should login user and return auth token', done => {
        const email = seedUsers[1].email;
        const password = seedUsers[1].password;

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(200)
            .expect(res => {
                expect(res.headers['x-auth']).toExist();
                expect(res.body.email).toBe(email)
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                // assert the newly added token in DB is same as the res header
                User.findById(seedUsers[1]._id)
                    .then(user => {
                        expect(user.tokens[1]).toInclude({
                            access: 'auth',
                            token: res.headers['x-auth']
                        });
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should reject invalid login', done => {
        const email = seedUsers[1].email;
        const password = seedUsers[1].email + '!';

        request(app)
            .post('/users/login')
            .send({email, password})
            .expect(400)
            .expect(res => {
                // assert no token in response's header and body is empty
                expect(res.headers['x-auth']).toNotExist();
                expect(res.body).toEqual({});
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }

                // assent no tokens injected to DB
                User.findById(seedUsers[1]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(1);
                        done();
                    })
                    .catch(err => done(err));
            });
    });
});


describe('DELETE /users/me/token', () => {
    it('should remove token on logout', done => {
        const token = seedUsers[0].tokens[0].token;

        request(app)
            .delete('/users/me/token')
            .set('x-auth', token)
            .expect(200)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                User.findById(seedUsers[0]._id)
                    .then(user => {
                        expect(user.tokens.length).toBe(0);
                        done();
                    })
                    .catch(err => done(err));
            });
    });

    it('should respond 401 if token invalid', done => {
        request(app)
            .delete('/users/me/token')
            .set('x-auth', 'dommyroken')
            .expect(401)
            .expect(res => {
                expect(res.body).toEqual({});
            })
            .end(done);
    });
});