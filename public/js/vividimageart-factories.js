var vividImageArtFactories = angular.module('vividimageart.factories', []);

var oneHourInMs = 3600000;
var cachedImages = new CacheContainer(oneHourInMs);

vividImageArtFactories.factory('images', ['$http', '$state', '$rootScope', 'Upload', function($http, $state, $rootScope, Upload) {
    var imagesFactory = {};
    imagesFactory.images = [];

    imagesFactory.getAll = function() {
        if (cachedImages.isValid()) {
            imagesFactory.images = cachedImages.cachedData;
        }
        else {
            return $http.get('/admin/allimages')
                .success(function(data) {
                    angular.copy(data, imagesFactory.images);
                    cachedImages.assignData(imagesFactory.images);
                });
        }
    };

    imagesFactory.findById = function(pictureId) {
        if (imagesFactory.images.length > 0) {
            for (var i = 0; i < imagesFactory.images.length; i++) {
                var image = imagesFactory.images[i];
                if (image.name === pictureId) {
                    return image;
                }
            }
        }

        return null;
    };

    imagesFactory.getMaximumSizes = function() {
        var greatestThumbHeight = 0;
        var greatestThumbWidth = 0;
        if (imagesFactory.images.length > 0) {
            for (var i = 0; i < imagesFactory.images.length; i++) {
                var width = parseInt(imagesFactory.images[i].thumbnailWidth);
                if (width > greatestThumbWidth) {
                    greatestThumbWidth = width;
                }

                var height = parseInt(imagesFactory.images[i].thumbnailHeight);
                if (height > greatestThumbHeight) {
                    greatestThumbHeight = height;
                }
            }
        }

        return {
            maxHeight: greatestThumbHeight,
            maxWidth: greatestThumbWidth
        };
    };

    imagesFactory.uploadImage = function(fileToUpload, imageDetails, callback) {
        // these are normally set by the $httpInterceptor, however, this call is not using $http so we have to manually set them
        $rootScope.activeCalls += 1;
        $rootScope.loadingText = "Uploading Image...";

        // clear the image cache on an upload
        cachedImages.clearCache();

        Upload.upload({
            url: 'admin/uploadimage',
            method: 'POST',
            file: fileToUpload,
            data: {
                paintingName: imageDetails.paintingName,
                mediaType: imageDetails.mediaType,
                mediaSize: imageDetails.mediaSize,
                price: imageDetails.price,
                imageDivisor: imageDetails.divisor
            }
        })
        .success(function(data, status, headers, config) {
            $rootScope.activeCalls -= 1;
            if (data.toString().indexOf('The application has encountered an unexpected error') > -1) {
                return callback('An Internal Server Error Has Occurred');
            }

            callback(null);
        })
        .error(function(data, status, headers, config) {
            $rootScope.activeCalls -= 1;
            callback(data);
        });
    };

    imagesFactory.saveImageUpdates = function(imageDetails, callback) {
        // clear the image cache on an update
        cachedImages.clearCache();

        $http.post('/admin/saveimageedits', imageDetails)
            .success(function(data, status) {
                if (status === 401) {
                    callback(data.message.toString());
                }
                else {
                    callback(null);
                }
            })
            .error(function(data, status) {
                callback(data.toString());
            });
    };

    imagesFactory.deleteImage = function(imageName, callback) {
        // clear the image cache on a delete
        cachedImages.clearCache();

        $http.post('/admin/deleteimage', { fileName: imageName })
            .success(function(data, status) {
                if (status === 401) {
                    callback(data.message.toString());
                }
                else {
                    callback(null);
                }
            })
            .error(function(data, status) {
                callback(data.toString());
            });
    };

    return imagesFactory;
}]);

vividImageArtFactories.factory('auth', ['$http', '$window', function($http, $window) {
    var authFactory = {};

    authFactory.saveToken = function(token) {
        $window.localStorage['vivid-image-art-token'] = token;
    };

    authFactory.getToken = function() {
        return $window.localStorage['vivid-image-art-token'];
    };

    authFactory.isLoggedIn = function() {
        var token = authFactory.getToken();
        if (token) {
            var payload = JSON.parse($window.atob(token.split('.')[1]));
            return payload.exp > Date.now() / 1000;
        }
        else {
            return false;
        }
    };

    authFactory.currentUser = function() {
        if (authFactory.isLoggedIn()) {
            var token = authFactory.getToken();
            var payload = JSON.parse($window.atob(token.split('.')[1]));

            return payload.username;
        }
    };

    authFactory.logIn = function(user, callback) {
        $http.post('/login', user)
            .success(function(data, status) {
                if (status === 401) {
                    callback(false, data.message.toString());
                }
                else {
                    authFactory.saveToken(data.token);
                    callback(true, '');
                }
            })
            .error(function(data, status) {
                callback(false, data.toString());
            });
    };

    authFactory.logOut = function() {
        $window.localStorage.removeItem('vivid-image-art-token');
    };

    authFactory.changePassword = function(oldPassword, newPassword, callback) {
        $http.post('/changepassword', { oldPassword: oldPassword, newPassword: newPassword})
            .success(function(data, status) {
                if (status === 401) {
                    callback(false, 'Invalid Login Details');
                }
                else {
                    callback(true, '');
                }
            })
            .error(function(data, status) {
                callback(false, data.toString());
            });
    };

    return authFactory;
}]);