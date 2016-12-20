'use strict';
angular.module('sfmuni', ['ui.router', 'sfmuni.map'])

// allow d3 and lodash to be use direct in app
.constant('_', window._)
.constant('d3', window.d3)

.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/map');

    // add one more layer, but easier to maintain if there are any futher dev plan
    $stateProvider
    .state('sfmuni', {
        url: "/",
        views: {
        	'': {
        		templateUrl: "app/app.view.html",
        	}
        }
    })

})