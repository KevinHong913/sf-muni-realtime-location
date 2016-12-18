/* list, edit, add delete */
'use strict';
angular.module('sfmuni.map', [])

.config(function($stateProvider, $urlRouterProvider) {

    // For any unmatched url, redirect to /state1
    // $urlRouterProvider.when('/configWizard', '/configWizard/');
    // $urlRouterProvider.when('config-wizard/config-wizard', '/config-wizard');

    // Now set up the states
    $stateProvider
    .state('sfmuni.show-map', {
        url: "map",
        views: {
            'content': {
                templateUrl: "app/Map/views/show_map.html",
                // controller: "MapController as mapCtrl"
            },
            'navigation': {
                templateUrl: "app/Navigation/navigation.view.html",
                controller: "NavigationController as navCtrl"
            }

        }
    })

});

