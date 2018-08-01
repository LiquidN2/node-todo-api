const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const {Schema} = mongoose;
const {ObjectId} = Schema;

// define schima for 'User' collection
const userSchema = new Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: '{VALUE} is not a valid email'
        }
    },

    password: {
        type: String,
        required: true,
        minlength: 6
    },
    
    tokens: [{
        access: {
            type: String,
            required: true
        },
        token: {
            type: String,
            required: true
        }
    }]
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObj = user.toObject();

    return _.pick(userObj, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = function() {
    // generates a jwt string with payload as {_id, auth}
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, 'abc123').toString();

    // adding the token to the document
    user.tokens.push({access, token});
    // user.tokens = user.tokens.concat([{access, token}]);

    // upon saving the token, return it 
    return user.save().then(() => {
        return token;
        // console.log(token);
    });
};

userSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, 'abc123');
    } catch (err) {
        // return new Promise((resolve, reject) => {
        //     reject();
        // });
        return Promise.reject();
    }

    return User.findOne({
        _id: decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

userSchema.pre('save', function(next) {
    const user = this;

    if (user.isModified('password')) {
        // generate salt
        bcrypt.genSalt(10, (err, salt) => {
            if (!err) {
                bcrypt.hash(user.password, salt, (err, hash) => {
                    if (!err) {
                        user.password = hash;
                        next();
                    }
                });
            }
        });
    } else {
        next();
    }
});

const User = mongoose.model('User', userSchema);

module.exports = {User};