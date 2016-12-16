'use strict';
function MainController($scope, $state, $location) {
	var vm = this;

	var initialize = function() {
	    // $state.go('admin.song_list');
	}

	initialize();
}

angular.module('sfmuni')
.controller('MainController', [ '$scope', '$state', MainController ]);