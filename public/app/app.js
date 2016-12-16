'use strict';
angular.module('sfmuni', ['ui.router', 'sfmuni.navigation', 'sfmuni.map'])

// allow DI for use in controllers, unit tests
.constant('_', window._)
.constant('X2JS', window.X2JS())
    // use in views, ng-repeat="x in _.range(3)"
.run(function ($rootScope) {
    $rootScope._ = window._;
})

.config(function($stateProvider, $urlRouterProvider) {

    $urlRouterProvider.otherwise('/map');

    $stateProvider
    .state('sfmuni', {
        url: "/",
        views: {
        	'': {
        		templateUrl: "app/Main/main.view.html",
        		controller: "MainController"
        	}
        }
    })

})

.controller('adminController', ['$state', function($state){

}])