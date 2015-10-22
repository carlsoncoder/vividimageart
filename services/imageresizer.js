var lwip = require('lwip');
var path = require('path');

var imageResizer = {};

imageResizer.resizeImage = function(sourceFile, outputDirectory, divisor, callback) {
    lwip.open(sourceFile, function(err, image) {
        if (err) {
            return callback(err);
        }

        var originalWidth = image.width();
        var originalHeight = image.height();

        var newWidth = originalWidth / divisor;
        var newHeight = originalHeight / divisor;

        image.resize(newWidth, newHeight, function(err, resizedImage) {
            if (err) {
                return callback(err);
            }

            var extension = path.extname(sourceFile);
            var sourceFileName = path.basename(sourceFile, extension);

            var targetOutputPath = outputDirectory + '/' + sourceFileName + '_thumbnail' + extension;

            resizedImage.writeFile(targetOutputPath, function(err) {
                if (err) {
                    return callback(err);
                }

                var resultValues = {
                    fileName: targetOutputPath,
                    originalHeight: originalHeight,
                    originalWidth: originalWidth,
                    newHeight: newHeight,
                    newWidth: newWidth
                };

                return callback(null, resultValues);
            })
        });
    })
};

module.exports = imageResizer;