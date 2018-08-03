const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');

const {seedTodos, populateTodos, seedUsers, populateUsers} = require('./seed/seed');

/** Before each test:
 * 1. wipe Todo collection
 * 2. add dummy data
 */
beforeEach(populateUsers);
beforeEach(populateTodos);

describe('POST /todos', () => {
    it('should create a new todo', done => {
        const text = 'New todo text';
        
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
                        expect(todos.length).toBe(seedTodos.length);
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
                expect(res.body.todos.length).toBe(seedTodos.length);
            })
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
});


describe('GET /todos/:id', () => {
    it('should get todo doc by id', done => {
        request(app)
            .get(`/todos/${seedTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo._id).toBe(seedTodos[0]._id.toHexString());
            })
            .end((err, res) => {
                if (err) {
                    return done(err);
                }

                Todo.findById(seedTodos[0]._id.toHexString())
                    .then(todo => {
                        // expect(todo._id.toString()).toBe(seedTodos[0]._id.toHexString());
                        expect(todo).toInclude({_id: seedTodos[0]._id});
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
                expect(res.body).toEqual({});
            })
            .end((err,res) => {
                if (err) {
                    return done(err);
                }
                done();
            });
    })

    it('should respond 404 error and inform user when id is valid but not existing in collection', done => {
        const randomId = new ObjectID().toHexString();
    
        request(app)
            .get(`/todos/${randomId}`)
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

                Todo.findById(randomId)
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
            .delete(`/todos/${seedTodos[0]._id.toHexString()}`)
            .expect(200)
            .expect(res => {
                expect(res.body.todo).toInclude({_id: seedTodos[0]._id});
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                
                Todo.findById(seedTodos[0]._id.toHexString())
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
                expect(res.body).toEqual({});
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                done();
            })
    });

    it('should respond 404 error and inform user when id is valid but not existing in collection', done => {
        const randomId = new ObjectID().toHexString();
        
        request(app)
            .delete(`/todos/${randomId}`)
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

                Todo.findById(randomId)
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
            .patch(`/todos/${seedTodos[0]._id.toHexString()}`)
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

                Todo.findById(seedTodos[0]._id.toHexString())
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
            .patch(`/todos/${seedTodos[1]._id.toHexString()}`)
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

                Todo.findById(seedTodos[1]._id.toHexString())
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
                expect(res.body).toEqual({});
            })
            .end((err, res) => {
                if(err) {
                    return done(err);
                }
                done();
            })
    });

    it('should respond 404 error and inform user when id is valid but not existing in collection', done => {
        const randomId = new ObjectID().toHexString();
        const body = {
            completed: true
        };
        
        request(app)
            .patch(`/todos/${randomId}`)
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

                Todo.findById(randomId)
                    .then(todo => {
                        expect(todo).toNotExist();
                        done();
                    })
                    .catch(err => done(err));
            });
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

                User.findById(seedUsers[1]._id)
                    .then(user => {
                        expect(user.tokens[0]).toInclude({
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
                        expect(user.tokens.length).toBe(0);
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