'use strict';

var fs = require('fs');
var path = require('path');
var AWS = require('aws-sdk');
var AWSFileInfo = require('./awsfileinfo');
var async = require('async');
var imageResizer = require('../services/imageresizer');
var configOptions = require('../config/config.js');

var uploadsDirectory = 'uploads';

module.exports = function() {
    // build configs
    var configs = {
        region: configOptions.S3_REGION_NAME,
        accessKeyId: configOptions.S3_ACCESS_KEY_ID,
        secretAccessKey: configOptions.S3_SECRET_ACCESS_KEY,
        bucketName: configOptions.S3_BUCKET_NAME,
        acl: configOptions.S3_ACL_POLICY,
        useSSL: configOptions.S3_USE_SSL
    };

    // init AWS
    AWS.config.update({
        accessKeyId: configs.accessKeyId,
        secretAccessKey: configs.secretAccessKey,
        region: configs.region
    });

    var api = {
        s3: new AWS.S3({ computeChecksums:true }),
        configs: configs,
        upload: function(tempFilePath, dataForm, callback) {
            uploadFiles(this.s3, this.configs, tempFilePath, dataForm, callback);
        },
        deleteFile: function(fileName, callback) {
            var s3 = this.s3;
            var configs = this.configs;
            getRawFiles(s3, configs, function(err, files) {
                async.each(
                    files,
                    function(file, callback) {
                        getFileDetails(s3, configs, file.key, function(err, metadata) {
                            if (err) {
                                callback(err);
                            }

                            file.setMetadata(metadata);
                            callback();
                        });
                    },
                    function(err) {
                        if (err) {
                            return callback(err);
                        }

                        var filesToDelete = [];
                        files.forEach(function(file) {
                            if (file.name === fileName) {
                                filesToDelete.push(file.key);
                            }
                        });

                        async.each(
                            filesToDelete,
                            function(fileToDelete, callback) {
                                var params = { Bucket: configs.bucketName, Key: fileToDelete };
                                s3.deleteObject(params, function(err, data) {
                                    if (err) {
                                        callback(err);
                                    }
                                    else {
                                        callback();
                                    }
                                });
                            },
                            function(err) {
                                if (err) {
                                    return callback(err);
                                }

                                callback(null);
                            }
                        );

                        //TODO: JUSTIN: I Don't think we need this callback below - test it out!!!
                        callback(null);
                    }
                );
            });
        },
        updateImageDetails: function(imageDetails, callback) {
            this.getAllFilesWithMetaData(function(err, files) {
                if (err) {
                    callback(err)
                }

                files.forEach(function(file) {
                    if (file.name === imageDetails.filename) {
                        var newMetadataOptions = {
                            paintingname: imageDetails.paintingName,
                            mediatype: imageDetails.mediaType,
                            mediasize: imageDetails.mediaSize,
                            price: imageDetails.price,
                            height: file.height,
                            width: file.width,
                            filename: imageDetails.filename,
                            category: file.category
                        };

                        var contentType = getContentTypeByFile(file.key);

                        var params = {
                            Bucket: configs.bucketName,
                            CopySource: configs.bucketName + '/' + file.key,
                            Key: file.key,
                            ACL: configs.acl,
                            CacheControl: 'public, max-age=2592000',
                            ContentType: contentType,
                            MetadataDirective: 'REPLACE',
                            Metadata: newMetadataOptions
                        };

                        api.s3.copyObject(params, function(err, data) {
                            if (err) {
                                callback(err);
                            }
                            else {
                                callback();
                            }
                        });
                    }
                });
            });
        },
        getAllFilesWithMetaData: function(callback) {
            var s3 = this.s3;
            var configs = this.configs;
            getRawFiles(s3, configs, function(err, files) {
                async.each(
                    files,
                    function(file, callback) {
                        getFileDetails(s3, configs, file.key, function(err, metadata) {
                            if (err) {
                                callback(err);
                            }

                            file.setMetadata(metadata);
                            callback();
                        });
                    },
                    function(err) {
                        if (err) {
                            return callback(err);
                        }

                        var modifiedFiles = sortImagesAndThumbnails(files);
                        callback(null, modifiedFiles);
                    }
                )
            });
        }
    };

    return api;
};

function b(a) {
    /* AWS Random UUID - https://gist.github.com/jed/982883#file-index-js */
    return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
}

function getContentTypeByFile(fileName) {
    var contentType = 'application/octet-stream';
    var fileNameLower = fileName.toLowerCase();

    if (fileNameLower.indexOf('.html') >= 0) {
        contentType = 'text/html';
    }
    else if (fileNameLower.indexOf('.css') >= 0) {
        contentType = 'text/css';
    }
    else if (fileNameLower.indexOf('.json') >= 0) {
        contentType = 'application/json';
    }
    else if (fileNameLower.indexOf('.js') >= 0) {
        contentType = 'application/x-javascript';
    }
    else if (fileNameLower.indexOf('.png') >= 0) {
        contentType = 'image/png';
    }
    else if (fileNameLower.indexOf('.jpg') >= 0) {
        contentType = 'image/jpg';
    }
    else if (fileNameLower.indexOf('.jpeg') >= 0) {
        contentType = 'image/jpg';
    }

    return contentType;
}

function getRawFiles(s3, opts, callback) {
    var params = {
        Bucket: opts.bucketName
    };

    var files = [];
    s3.listObjects(params, function(err, data) {
        if (err) {
            callback(err);
        }

        data.Contents.forEach(function(record) {
            var fullUrl = (opts.useSSL ? 'https://' : 'http://') + 's3.amazonaws.com/' + opts.bucketName + '/' + record.Key;

            var awsFileInfo = new AWSFileInfo(record.Key, fullUrl, record.LastModified);
            files.push(awsFileInfo);
        });

        callback(null, files);
    });
}

function getFileDetails(s3, opts, fileKey, callback) {
    // we specifically use the Range header to only get a few bytes back
    // we only want the metadata, we don't care about downloading the actual file
    var fileParams = {
        Bucket: opts.bucketName,
        Key: fileKey,
        Range: 'bytes=0-3'
    };

    s3.getObject(fileParams, function(err, data) {
        if (err) {
            callback(err);
        }

        callback(null, data.Metadata);
    });
}

function uploadIndividualFile(s3, fileName, filePath, opts, metadataValues, callback) {
    var fileBuffer = fs.readFileSync(filePath);
    var contentType = getContentTypeByFile(filePath);
    var remoteFilename = b() + '__' + fileName;

    s3.putObject({
            ACL: opts.acl,
            Bucket: opts.bucketName,
            Key: remoteFilename,
            Body: fileBuffer,
            CacheControl: 'public, max-age=2592000',
            ContentType: contentType,
            Metadata: metadataValues
        },
        function(error) {
            var params = {
                Bucket: opts.bucketName,
                Key: remoteFilename
            };

            var url = s3.getSignedUrl('getObject', params);
            callback(error, url);
        });
}

function uploadFiles(s3, opts, tempFileName, dataForm, callback) {
    var tempFileListing = [];
    tempFileListing.push(tempFileName);

    buildTargetPathForUpload(tempFileName, dataForm.paintingName, function(targetPath, foundExtension) {
        tempFileListing.push(targetPath);

        copyFile(tempFileName, targetPath, function(err) {
            if (err)
            {
                deleteFiles(tempFileListing, function() {
                    return callback(err);
                });
            }

            imageResizer.resizeImage(targetPath, uploadsDirectory, dataForm.imageDivisor, function(err, resultValues) {

                if (resultValues && resultValues.fileName) {
                    tempFileListing.push(resultValues.fileName);
                }

                if (err) {
                    console.log(err);
                    deleteFiles(tempFileListing, function() {
                        return callback(err);
                    });
                }

                var attemptedUniqueIdentifier = (Math.random() * 10000000000).toString().substring(0, 10);

                var metadataOptions = {
                    filename: dataForm.paintingName + '-' + attemptedUniqueIdentifier,
                    paintingName: dataForm.paintingName,
                    category: 'FullSize',
                    mediaType: dataForm.mediaType,
                    mediaSize: dataForm.mediaSize,
                    price: dataForm.price,
                    height: resultValues.originalHeight.toString(),
                    width: resultValues.originalWidth.toString()
                };

                var fileNameToSave = dataForm.paintingName + foundExtension;

                // upload full size to S3
                uploadIndividualFile(s3, fileNameToSave, targetPath, opts, metadataOptions, function(err, url) {
                    if (err) {
                        deleteFiles(tempFileListing, function() {
                            return callback(err);
                        });
                    }

                    console.log('Full size file successfully uploaded to S3!');
                    console.log(url);

                    // upload thumbnail to S3 - update the metadata first
                    metadataOptions.category = 'Thumbnail';
                    metadataOptions.height = resultValues.newHeight.toString();
                    metadataOptions.width = resultValues.newWidth.toString();
                    uploadIndividualFile(s3, fileNameToSave, resultValues.fileName, opts, metadataOptions, function(err, url) {
                        if (err) {
                            deleteFiles(tempFileListing, function() {
                                return next(err);
                            });
                        }

                        console.log('Thumbnail file successfully uploaded to S3!');
                        console.log(url);

                        deleteFiles(tempFileListing, function() {
                            callback()
                        });
                    });
                });
            });
        });
    });
}

function copyFile(source, target, callback) {
    var callbackCalled = false;

    var readStream = fs.createReadStream(source);
    readStream.on("error", done);

    var writeStream = fs.createWriteStream(target);
    writeStream.on("error", done);
    writeStream.on("close", function(ex) {
        done();
    });

    readStream.pipe(writeStream);

    function done(err) {
        if (!callbackCalled) {
            callback(err);
            callbackCalled = true;
        }
    }
}

function buildTargetPathForUpload(fileToCopy, targetFileName, callback) {
    var extension = path.extname(fileToCopy);
    var fullTargetPath = uploadsDirectory + '/' + targetFileName + extension;
    callback(fullTargetPath, extension);
}

function deleteFiles(fileArray, callback) {
    for (var i = 0; i < fileArray.length; i++) {
        fs.unlinkSync(fileArray[i]);
    }

    callback();
}

function sortImagesAndThumbnails(files) {
    var fullSizeImages = [];
    var thumbnailImages = [];

    files.forEach(function(file) {
        if (file.category === 'FullSize') {
            fullSizeImages.push(file);
        }
        else {
            thumbnailImages.push(file);
        }
    });

    fullSizeImages.forEach(function(fullSizeImage) {
        thumbnailImages.forEach(function(thumbnailImage) {
            if (thumbnailImage.name === fullSizeImage.name) {
                fullSizeImage.thumbnailUrl = thumbnailImage.url;
                fullSizeImage.thumbnailHeight = thumbnailImage.height;
                fullSizeImage.thumbnailWidth = thumbnailImage.width;
            }
        });
    });

    return fullSizeImages;
}