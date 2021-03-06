var debug = require('debug')('vividimageart:server');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var multer = require('multer');
var url = require('url');
var fs = require('fs');
var http = require('http');
var https = require('https');

//initialize config options
var configOptions = require('./config/config.js');

var certificateConfiguration = {
    key: fs.readFileSync(configOptions.CERT_KEY_PATH),
    cert: fs.readFileSync(configOptions.CERT_PATH)
};

//passport
var passport = require('passport');
require('./config/passport');

// Express setup
var app = express();

// Express view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({
    dest: './uploads/'
}));

app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

// define routing for Express
var home = require('./routes/home');
var admin = require('./routes/admin');

app.use('/', home);
app.use('/admin', admin);

// catch 404 errors and route to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// development error handler - will print stack traces
if (process.env.NODE_ENV === 'development')
{
    app.use(function(err, req, res, next) {
        logError(err);
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler - no stack trace shown to user
app.use(function(err, req, res, next) {
    logError(err);
    res.status(err.status || 500);
    res.render('error', {
       message: err.message,
        error: {}
    });
});

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    // handle specific listen errors with friendly messages
    switch (error.code)
    {
        case 'EACCES':
        {
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        }
        case 'EADDRINUSE':
        {
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        }
        default:
        {
            throw error;
        }
    }
}

function logError(error) {
    console.log(error.message + '--' + error + '--' + error.stack);
}

var secureServer = https.createServer(certificateConfiguration, app).listen(4443, function() {
    console.log('HTTPS server listening on port 4443');
});

secureServer.on('error', onError);

// Setup secondary server to redirect HTTP requests to HTTPS instance
var insecureApp = express();
insecureApp.get('*', function(req, res) {
    var parsedUrl = url.parse(configOptions.BASE_URL + req.originalUrl);
    return res.redirect(parsedUrl.href);
}).listen(8080, function() {
    console.log('HTTP server listening on port 8080');
});

// Final catch of any errors in the process
// Catch any uncaught errors that weren't wrapped in a try/catch statement
process.on('uncaughtException', function(err) {
    logError(err);
});

module.exports = app;