var vividImageArtControllers = angular.module('vividimageart.controllers', []);

vividImageArtControllers.controller('MainController', [
    '$scope',
    '$rootScope',
    '$state',
    '$stateParams',
    'auth',
    'images',
    function($scope, $rootScope, $state, $stateParams, auth, images) {
        $scope.$state = $state;
        $scope.allImages = images.images;
        $scope.isLoggedIn = auth.isLoggedIn;

        var maxSizes = images.getMaximumSizes();
        $scope.greatestThumbHeight = maxSizes.maxHeight;
        $scope.greatestThumbWidth = maxSizes.maxWidth;
    }]);

vividImageArtControllers.controller('AdminController', [
    '$scope',
    '$state',
    '$stateParams',
    'images',
    function($scope, $state, $stateParams, images) {
        $scope.$state = $state;
        $scope.imageDetails = {};
        $scope.imageDetails.divisor = 6;
        $scope.allImages = images.images;

        $scope.isImageEdit = false;

        if ($stateParams.pictureId) {
            $scope.isImageEdit = true;
            $scope.editingPictureId = $stateParams.pictureId;

            $scope.imageDetails = images.findById($scope.editingPictureId);
        }

        var maxSizes = images.getMaximumSizes();
        $scope.greatestThumbHeight = maxSizes.maxHeight;
        $scope.greatestThumbWidth = maxSizes.maxWidth;

        function validateUploadPicture() {
            var error = '';
            if (IsNullOrUndefined($scope.imageDetails.paintingName) || $scope.imageDetails.paintingName === '') {
                error = 'You must define a name for the painting';
            }
            else if (IsNullOrUndefined($scope.imageDetails.mediaType) || $scope.imageDetails.mediaType === '') {
                error = 'You must define a media type for the painting';
            }
            else if (IsNullOrUndefined($scope.imageDetails.mediaSize) || $scope.imageDetails.mediaSize === '') {
                error = 'You must define the media size for the painting';
            }
            else if (IsNullOrUndefined($scope.imageDetails.price) || $scope.imageDetails.price === '') {
                error = 'You must define the price for the painting';
            }

            if (!$scope.isImageEdit) {
                if (IsNullOrUndefined($scope.imageDetails.divisor) || $scope.imageDetails.divisor === '') {
                    error = 'You must define a divisor value for the painting';
                }
                else if (!IsNumber($scope.imageDetails.divisor)) {
                    error = 'The divisor value must be a valid decimal';
                }
                else if (!$scope.files || !$scope.files.length) {
                    error = 'You must select a file';
                }
            }

            return error;
        }

        $scope.uploadPicture = function() {
            $scope.error = '';
            var validationResult = validateUploadPicture();
            if (validationResult !== '') {
                $scope.error = validationResult;
                return;
            }

            var fileToUpload = $scope.files[0];
            images.uploadImage(fileToUpload, $scope.imageDetails, function(err) {
                if (err) {
                    $scope.error = err;
                }
                else {
                    $scope.userMessage = { type: 'success', title: 'Image Upload', message: 'Image successfully uploaded!', nextState: 'viewpictures'};
                }
            });
        };

        $scope.savePictureEdits = function() {
            $scope.error = '';
            var validationResult = validateUploadPicture();
            if (validationResult !== '') {
                $scope.error = validationResult;
                return;
            }

            images.saveImageUpdates($scope.imageDetails, function(err) {
                if (err) {
                    $scope.error = err;
                }
                else {
                    $scope.userMessage = { type: 'success', title: 'Image Update', message: 'Image successfully updated!', nextState: 'viewpictures'};
                }
            });
        };

        $scope.deleteImage = function(imageName) {
            var prompt = confirm("Are you sure you want delete this image: '" + imageName + " ?'");
            if (prompt === true) {
                images.deleteImage(imageName, function(err) {
                    if (err) {
                        $scope.error = err;
                    }
                    else {
                        $scope.userMessage = { type: 'success', title: 'Image Delete', message: 'Image successfully deleted!', nextState: 'viewpictures'};
                    }
                });
            }
        };
    }
]);

vividImageArtControllers.controller('NavigationController', [
    '$scope',
    '$state',
    'auth',
    function($scope, $state, auth) {
        $scope.$state = $state;
        $scope.user = {};

        $scope.isLoggedIn = auth.isLoggedIn;
        $scope.currentUser = auth.currentUser;

        $scope.user = {};

        $scope.logIn = function() {
            if (IsNullOrUndefined($scope.user.username) || $scope.user.username === '') {
                $scope.error = 'Please enter your user name';
                return;
            }

            if (IsNullOrUndefined($scope.user.password) || $scope.user.password === '') {
                $scope.error = 'Please enter your password';
                return;
            }

            auth.logIn($scope.user, function(status, message) {
                if (!status) {
                    $scope.error = message;
                    $scope.user.password = '';
                }
                else {
                    $state.go('admin');
                }
            });
        };

        $scope.logOut = function() {
            auth.logOut();
            $state.go('home');
        };
    }
]);