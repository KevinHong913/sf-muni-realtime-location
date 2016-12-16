/* Map Controller */
'use strict';
function MapController($scope, $state, NextBusService) {
	var vm = this;

	var initialize = function() {
		console.log("MAP CONTROLLER INIT");
		vm.getRouteList();
	};

	vm.getRouteList = function() {
		NextBusService.GetRouteList()
		.then( function(response) {
			console.log("GetRouteList", response);
    }, function(error) {
        console.log("Error getting route list", error);
    });
	}

	initialize();
};

angular.module('sfmuni.map')
.controller('MapController', [ '$scope', '$state', 'NextBus', MapController ]);