var express = require('express');
var router = express.Router();
var passport = require('passport');
var jwt = require('express-jwt');
var configOptions = require('../config/config.js');

// GET '/'
router.get('/', function(req, res, next) {
    res.render('index', {
        config_ga_account_id: configOptions.GA_ACCOUNT_ID
    });
});

// POST '/login'
router.post('/login', function(req, res, next) {
    if (!req.body.username || !req.body.password) {
        return res.status(400).json({message: 'Please fill out all required fields'});
    }

    passport.authenticate('local', function(err, user, info) {
       if (err) {
           return next(err);
       }

       if (user) {
           return res.json({token: user.jwt});
       }
       else {
           return res.status(401).json(info);
       }
    })(req, res, next);
});

module.exports = router;