var express = require('express');
var router = express.Router();
var exceptionRepository = require('../services/exceptionrepository');
var jwt = require('express-jwt');
var AWSService = require('../services/awsservice');
var configOptions = require('../config/config.js');

var auth = jwt({secret: configOptions.JWT_SECRET_KEY, userProperty: 'payload'});

// GET '/admin/exceptions'
router.get('/exceptions', auth, function(req, res, next) {
    exceptionRepository.loadAll(function(err, exceptions) {
       if (err) {
           return next(err);
       }

       return res.json(exceptions);
    });
});

// GET '/admin/allimages'
router.get('/allimages', function(req, res, next) {
    var awsServiceInstance = AWSService();
    awsServiceInstance.getAllFilesWithMetaData(function(err, files) {
        if (err) {
            return next(err);
        }

        return res.json(files);
    });
});

// POST '/admin/uploadimage'
router.post('/uploadimage', auth, function(req, res, next) {
    var dataForm = JSON.parse(req.body.data);
    var awsServiceInstance = AWSService();
    awsServiceInstance.upload(req.files.file.path, dataForm, function(err) {
        if (err) {
            return next(err);
        }

        return res.status(200).json({message: 'File upload process completed sucessfully!'});
    });
});

// POST '/admin/saveimageedits'
router.post('/saveimageedits', auth, function(req, res, next) {
    var newImageDetails = {
        filename: req.body.name,
        paintingName: req.body.paintingName,
        mediaType: req.body.mediaType,
        mediaSize: req.body.mediaSize,
        price: req.body.price
    };

    var awsServiceInstance = new AWSService();
    awsServiceInstance.updateImageDetails(newImageDetails, function(err) {
        if (err) {
            return next(err);
        }
        else {
            return res.status(200).json({message: 'Image updated successfully!'});
        }
    });
});

// POST '/admin/deleteimage
router.post('/deleteimage', auth, function(req, res, next) {
    var awsServiceInstance = new AWSService();
    awsServiceInstance.deleteFile(req.body.fileName, function(err) {
        if (err) {
            return next(err);
        }
        else {
            return res.status(200).json({message: 'Image Deleted Successfully!'});
        }
    });
});

module.exports = router;