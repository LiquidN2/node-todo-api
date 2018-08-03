const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

const mongoose = require('mongoose');
const {Schema} = mongoose;
// const {ObjectId} = Schema;

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
    // this will overwrite the default toJSON method of user schema
    const user = this;
    const userObj = user.toObject();

    return _.pick(userObj, ['_id', 'email']);
};

userSchema.methods.generateAuthToken = function() {
    // generates a jwt string with payload as {_id, auth}
    const user = this;
    const access = 'auth';
    const token = jwt.sign({_id: user._id.toHexString(), access}, process.env.JWT_SECRET).toString();

    // adding the token to the document
    user.tokens.push({access, token});
    // user.tokens = user.tokens.concat([{access, token}]);

    // upon saving the token, return it 
    return user.save().then(() => {
        return token;
        // console.log(token);
    });
};

userSchema.methods.removeToken = function(token) {
    const user = this;

    return user.update({
        $pull: {
            tokens: {token}
        }
    });
}

userSchema.statics.findByToken = function (token) {
    const User = this;
    let decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
        // return new Promise((resolve, reject) => {
        //     reject();
        // });
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.token': token,
        'tokens.access': 'auth'
    });
};

userSchema.statics.findByCredential = function (email, password) {
    const User = this;
    return User.findOne({email})
        .then(user => {
            if(!user) {
                return Promise.reject();
            }

            return new Promise((resolve, reject) => {
                bcrypt.compare(password, user.password, (err, res) => {
                    if(err || !res) {
                        return reject();
                    }
                    return resolve(user);
                });
            })
        })
};

// hashing password before saving new users to DB
userSchema.pre('save', function(next) {
    const user = this;
    
    if (user.isModified('password')) {
        // generate salt
        bcrypt.genSalt(10, (err, salt) => {
            if (!err) {
                // hashing the password
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