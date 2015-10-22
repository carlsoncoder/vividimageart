var vividImageArtFilters = angular.module('vividimageart.filters', []);

vividImageArtFilters.filter('to_trusted_html', ['$sce', function($sce) {
    return function(input) {
        return $sce.trustAsHtml(input);
    };
}]);