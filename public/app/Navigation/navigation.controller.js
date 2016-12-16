/* Navigation Controller */
'use strict';
function NavigationController($scope, $state) {
	var vm = this;

	$scope.goSref = function(state) {
		$state.go(state);
	}

	console.log("navigation");
}

angular.module('sfmuni.navigation')
.controller('NavigationController', [ '$scope', '$state', NavigationController ]);