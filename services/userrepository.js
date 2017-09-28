var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var configOptions = require('../config/config.js');

var userRepository = {};

userRepository.attemptLogin = function(username, password, callback) {

    for (var i = 0; i < configOptions.VALID_USERS.length; i++) {
        var user = configOptions.VALID_USERS[i];
        if (user.userName === username) {
            var computedHash = crypto.pbkdf2Sync(password, user.salt, 1000, 64).toString('hex');
            if (computedHash === user.hash) {
                // VALID USER - Generate and sign JWT valid for 1 day
                var today = new Date();
                var expires = new Date(today);
                expires.setDate(today.getDate() + 1);

                var token = jwt.sign(
                    {
                        _id: user.id,
                        username: user.userName,
                        exp: parseInt(expires.getTime() / 1000)
                    },
                    configOptions.JWT_SECRET_KEY
                );

                return callback(null, null, { id: user.id, username: user.userName, jwt: token });
            }
        }
    }

    // If we get here we have either an invalid user or invalid password
    return callback(null, 'Invalid Login Details', null);
};

userRepository.setNewPassword = function(password, callback) {
    var salt = crypto.randomBytes(16).toString('hex');
    var hash = crypto.pbkdf2Sync(password, salt, 1000, 64).toString('hex');

    var saltAndHash = {
        salt: salt,
        hash: hash
    };

    callback(saltAndHash);
};

module.exports = userRepository;