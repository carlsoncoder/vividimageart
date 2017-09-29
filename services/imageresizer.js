var Jimp = require('jimp');
var path = require('path');

var imageResizer = {};

imageResizer.resizeImage = function(sourceFile, outputDirectory, divisor, callback) {
    Jimp.read(sourceFile, function(err, image) {
        if (err) {
            return callback(err);
        }

        var originalWidth = image.bitmap.width;
        var originalHeight = image.bitmap.height;

        var newWidth = originalWidth / divisor;
        var newHeight = originalHeight / divisor;

        var extension = path.extname(sourceFile);
        var sourceFileName = path.basename(sourceFile, extension);

        var targetOutputPath = outputDirectory + '/' + sourceFileName + '_thumbnail' + extension;

        image.resize(newWidth, newHeight)
            .quality(80)
            .write(targetOutputPath);

        var resultValues = {
            fileName: targetOutputPath,
            originalHeight: originalHeight,
            originalWidth: originalWidth,
            newHeight: newHeight,
            newWidth: newWidth
        };

        return callback(null, resultValues);
    })
};

module.exports = imageResizer;