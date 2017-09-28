var app = angular.module('vividImageArt',
    [
        'ui.router',
        'ngSanitize',
        'ngFileUpload',
        'vividimageart.controllers',
        'vividimageart.filters',
        'vividimageart.directives',
        'vividimageart.factories',
        'vividimageart.injectors'
    ]
);

app.config([
    '$stateProvider',
    '$urlRouterProvider',
    '$httpProvider',
    function($stateProvider, $urlRouterProvider, $httpProvider) {
        $stateProvider
            .state(
                'home',
                {
                    url: '/',
                    templateUrl: 'templates/home.html',
                    controller: 'MainController'
                })
            .state(
                'about',
                {
                    url: '/about',
                    templateUrl: 'templates/about.html',
                    controller: 'MainController'
                })
            .state(
                'artistbio',
                {
                    url: '/artistbio',
                    templateUrl: 'templates/artistbio.html',
                    controller: 'MainController'
                })
            .state(
                'gallery',
                {
                    url: '/gallery',
                    templateUrl: 'templates/gallery.html',
                    controller: 'MainController',
                    resolve: {
                        imagesPromise: ['images', function(images) {
                            return images.getAll();
                        }]
                    }
                })
            .state(
                'contactus',
                {
                    url: '/contactus',
                    templateUrl: 'templates/contactus.html',
                    controller: 'MainController'
                })
            .state(
                'events',
                {
                    url: '/events',
                    templateUrl: 'templates/events.html',
                    controller: 'MainController'
                })
            .state(
                'admin',
                {
                    url: '/admin',
                    templateUrl: 'templates/admin/admin.html',
                    controller: 'AdminController',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'uploadpicture',
                {
                    url: '/admin/uploadpicture',
                    templateUrl: 'templates/admin/uploadpicture.html',
                    controller: 'AdminController',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }]
                })
            .state(
                'editPicture',
                {
                    url: '/admin/editpicture/{pictureId}',
                    templateUrl: 'templates/admin/uploadpicture.html',
                    controller: 'AdminController',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }],
                    resolve: {
                        imagesPromise: ['images', function(images) {
                            return images.getAll();
                        }]
                    }
                })
            .state(
                'viewpictures',
                {
                    url: '/admin/viewpictures',
                    templateUrl: 'templates/admin/viewpictures.html',
                    controller: 'AdminController',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (!auth.isLoggedIn())
                        {
                            $state.go('login');
                        }
                    }],
                    resolve: {
                        imagesPromise: ['images', function(images) {
                            return images.getAll();
                        }]
                    }
                })
            .state(
                'login',
                {
                    url: '/login',
                    templateUrl: 'templates/login.html',
                    controller: 'NavigationController',
                    onEnter: ['$state', 'auth', function($state, auth) {
                        if (auth.isLoggedIn())
                        {
                            $state.go('home');
                        }
                    }]
                });

        $urlRouterProvider.otherwise('/');

        $httpProvider.interceptors.push('tokenInjector');
        $httpProvider.interceptors.push('loadingStatusInjector');
}]);