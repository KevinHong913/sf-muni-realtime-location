'use strict';
angular.module('sfmuni.map', [])

.config(function($stateProvider, $urlRouterProvider) {

    $stateProvider
    .state('sfmuni.show-map', {
        url: "map",
        views: {
            'content': {
                templateUrl: "app/Map/views/show_map.html",
                // controller: "MapController as mapCtrl"
            }
        }
    })

});

