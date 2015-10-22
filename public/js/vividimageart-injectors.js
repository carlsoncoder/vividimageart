var vividImageArtInjectors = angular.module('vividimageart.injectors', []);

vividImageArtInjectors.factory('tokenInjector', ['$injector', function($injector) {
    var tokenInjector = {
        request: function(config) {
            var auth = $injector.get('auth');
            config.headers.Authorization = 'Bearer ' + auth.getToken();
            return config;
        }
    };

    return tokenInjector;
}]);

vividImageArtInjectors.factory('loadingStatusInjector', ['$rootScope', function($rootScope) {
    if ($rootScope.activeCalls === undefined) {
        $rootScope.activeCalls = 0;
    }

    var loadingStatusInjector = {
        request: function(config) {
            if (isWatchedServiceCall(config.url)) {
                $rootScope.activeCalls += 1;
            }

            return config;
        },
        requestError: function(rejection) {
            if (isWatchedServiceCall(rejection.config.url)) {
                $rootScope.activeCalls -= 1;
            }

            return rejection;
        },
        response: function(response) {
            if (isWatchedServiceCall(response.config.url)) {
                $rootScope.activeCalls -= 1;
            }

            return response;
        },
        responseError: function(rejection) {
            if (isWatchedServiceCall(rejection.config.url)) {
                $rootScope.activeCalls -= 1;
            }

            return rejection;
        }
    };

    function isWatchedServiceCall(url) {
        switch (url)
        {
            case '/admin/allimages':
            {
                $rootScope.loadingText = "Loading Images...";
                return true;
            }

            case '/admin/uploadimage':
            {
                $rootScope.loadingText = "Uploading Image...";
                return true;
            }

            case '/admin/saveimageedits':
            {
                $rootScope.loadingText = "Saving Image Edits...";
                return true;
            }

            case '/admin/deleteimage':
            {
                $rootScope.loadingText = "Deleting Image...";
                return true;
            }

            default:
            {
                return false;
            }
        }
    }

    return loadingStatusInjector;
}]);