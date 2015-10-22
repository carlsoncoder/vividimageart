var vividImageArtDirectives = angular.module('vividimageart.directives', []);

vividImageArtDirectives.directive('scriptLoader', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var pageName = attrs.pagename;
            switch (pageName)
            {
                case 'home':
                {
                    initializeOnControllerLoad(homeSectionLinkId);
                    break;
                }

                case 'about':
                {
                    initializeOnControllerLoad(aboutUsSectionLinkId);
                    break;
                }

                case 'gallery':
                {
                    initializeOnControllerLoad(gallerySectionLinkId);
                    break;
                }

                case 'contactus':
                {
                    initializeOnControllerLoad(contactUsSectionLinkId);
                    break;
                }

                case 'events':
                {
                    initializeOnControllerLoad(eventsSectionLinkId);
                    break;
                }

                case 'login':
                {
                    initializeOnControllerLoad(homeSectionLinkId);
                    break;
                }

                case 'artistbio':
                {
                    initializeOnControllerLoad(artistBioSectionLinkId);
                    break;
                }

                case 'admin':
                {
                    initializeOnControllerLoad(adminSectionLinkId);
                    break;
                }

                default:
                {
                    initializeOnControllerLoad(homeSectionLinkId);
                    break;
                }
            }
        }
    };
});

vividImageArtDirectives.directive('loadingSpinner', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            scope.$watch('activeCalls', function(newValue, oldValue) {
                if (newValue === 0) {
                    $(element).hide();
                }
                else {
                    $(element).show();
                }
            });
        }
    };
});

vividImageArtDirectives.directive('replaceAnchorTitle', function() {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            var desiredTitle = attrs.desiredtitle;
            $(element).prop('title', desiredTitle);
        }
    };
});

vividImageArtDirectives.directive('toastrWatcher', function() {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            scope.$watch('userMessage', function(newValue, oldValue) {
                if (!IsNullOrUndefined(newValue) && !IsNullOrUndefined(newValue.message)) {
                    if (newValue.type === 'success') {
                        toastr.success(newValue.message, newValue.title);

                        if (newValue.nextState !== 'NONE' && !IsNullOrUndefined(scope) && !IsNullOrUndefined(scope.$state)) {
                            scope.$state.go(newValue.nextState);
                        }
                    }
                    else {
                        toastr.error(newValue.message, newValue.title);
                    }
                }
            });
        }
    };
});