/* Map Controller */
'use strict';
function MapController($scope, $state, NextBusService) {
	var vm = this;

	vm.albersProjection = d3.geo.mercator()
	  .center([-122.424, 37.778])
	  .scale(300000);
	vm.geoPath = d3.geo.path().projection( vm.albersProjection );
	vm.routeList = [];
	vm.routeConfig;
	vm.vehicleLocation;
	vm.selectedRoute = "N";

	vm.initialize = function() {
		console.log("MAP CONTROLLER INIT");
		vm.getRouteList();
	};

	vm.getRouteList = function() {
		NextBusService.GetRouteList()
		.then( function(response) {
			console.log("GetRouteList", response);
			vm.routeList = response.data.body.route;
    }, function(error) {
        console.log("Error getting route list", error);
    });
	}

	vm.getRouteConfig = function(routeName) {
		NextBusService.GetRouteConfig(routeName)
		.then( function(response) {
			console.log("Get Route Config", response);
			vm.routeConfig = response.data.body.route;
		}), function(error) {
			console.log("Error getting data of file " + fileName, error);
		}
	}

	vm.getVehicleLocation = function(routeName) {
		NextBusService.GetVehicleLocation(routeName)
		.then( function(response) {
			console.log("Get Vehicle Location", response);
			var vehicles = response.data.body.vehicle;
			if(typeof vehicles === 'object' && !(vehicles == vehicles) ) {
				vm.vehicleLocation = [ vehicles ];
			} else if(Array.isArray(vehicles)) {
				vm.vehicleLocation = vehicles;
			} else {
				vm.vehicleLocation = []; // empty array to at least trigger watch event to clean point
			}
		}), function(error) {
			console.log("Error getting data of file " + fileName, error);
		}
	}

	vm.initialize();

};

angular.module('sfmuni.map')
.controller('MapController', [ '$scope', '$state', 'NextBus', MapController ])

.directive('d3Map', ['SfMapData', function(SfMapData){
	return {
		restrict: 'EA',
		controller: 'MapController',
		controllerAs: 'mapCtrl',
		// scope: true,
		template: '<div d3-map-route route-config="mapCtrl.routeConfig" vehicle-location="mapCtrl.vehicleLocation" selected-route="mapCtrl.selectedRoute"></div>',
		// transclude: true,
		link: {
			// use pre link so parent directive run before child
			pre: function($scope, iElm, iAttrs, ctrl) {
				// var ctrl = $scope.mapCtrl;
				var margin = parseInt(iAttrs.margin) || 20;

				// create svg tag
				var svg = d3.select(iElm[0])
				.append('svg')
				.style('width', '100%')
				.style('height', '100%');

				// map d3 element
				var neighborhoods = svg.append( "g" );
				var streets = svg.append( "g" );
				var freeways = svg.append( "g" );
				var arteries = svg.append( "g" );
				var neighborhoodsOutline = svg.append("g");

				// draw map (this will only run once)
				var renderMap = function() {
					// base layer of map
					neighborhoods.selectAll( "path" )
					  .data( SfMapData.neighborhoods.features )
					  .enter()
					  .append( "path" )
					  .attr( "class", "neighborhood")
					  .attr("stroke", "none")
					  // .attr( "fill", "#EAEAEA" )
					  .attr("fill", "#EAEAEA")
					  .attr( "d", ctrl.geoPath );
					// neighborhood outline
					neighborhoodsOutline.selectAll( "path" )
					  .data( SfMapData.neighborhoods.features )
					  .enter()
					  .append( "path" )
					  .attr( "class", "neighborhoodOutline")
					  .attr("stroke", "#CCCCCC")
					  // .attr( "fill", "#EAEAEA" )
					  .attr("fill", "none")
					  .attr( "d", ctrl.geoPath );
					// streets
					streets.selectAll( "path" )
					  .data( SfMapData.streets.features )
					  .enter()
					  .append( "path" )
					  .attr( "class", "street")
					  .attr( "fill", "none" )
					  .attr( "stroke", '#FFFFFF' )
					  .attr( "d", ctrl.geoPath );
					// freeway
					freeways.selectAll( "path" )
					  .data( SfMapData.freeways.features )
					  .enter()
					  .append( "path" )
					  .attr( "class", "freeway")
					  .attr( "fill", "none" )
					  .attr( "stroke", "#F5C886" )
					  .attr( "d", ctrl.geoPath );
					// arteries. not sure how to present it
					arteries.selectAll( "path" )
					  .data( SfMapData.arteries.features )
					  .enter().append( "path" )
					  .attr( "class", "artery")
					  .attr( "fill", "none" )
					  .attr( "stroke", '#EEEEEE' )
					  .attr( "d", ctrl.geoPath );
				}

				renderMap();
			}
		}
	}
}])

.directive('d3MapRoute', ['SfMapData', function(SfMapData){
	return {
		require: '^d3Map',
		scope: {
			routeConfig: '=',
			vehicleLocation: '=',
			selectedRoute: '='
		},
		// controller: function($scope, $element, $attrs, $transclude) {},
		restrict: 'EA', // E = Element, A = Attribute, C = Class, M = Comment
		// template: '',
		// templateUrl: '',
		// replace: true,
		// transclude: true,
		link: {
			post: function($scope, iElm, iAttrs, ctrl) {
				var margin = parseInt(iAttrs.margin) || 20;

				var svg = d3.select(iElm[0].parentNode).select("svg");
				var selectedRoute = ctrl.selectedRoute;

				var routeLines = svg.append("g");

				$scope.$watch( 'selectedRoute', function(newVal, oldVal) {
					selectedRoute = newVal;
					ctrl.getRouteConfig(newVal);
				})

				$scope.$watchCollection( 'routeConfig', function(newVal, oldVal) {
	  			$scope.drawRoute(newVal);
				});

				$scope.$watchCollection( 'vehicleLocation', function(newVal, oldVal) {
	  			 $scope.drawVehicle(newVal);
				});

				// Draw route and stops
				$scope.drawRoute = function(data) {
					if(!data) return;

					svg.selectAll('.routeLine').remove();
					svg.selectAll(".stop").remove();

					//transform into "Point"
					svg.selectAll('circle')
						  .data(data.stop)
							.enter().append("circle")
							.attr("class", "stop")
							.attr("r", 3)
							.attr("fill", "")
							.attr("transform", function(d) {
							return "translate(" + ctrl.albersProjection([
							  d._lon,
							  d._lat
							]) + ")";
					});

					var routeLine = [];
					for(var i = 0, count = data.path.length ; i < count ; ++i){
						var tmpRoute = { type: "LineString" , coordinates: []};
						var pathPoints = data.path[i].point;
						for(var j = 0, len = pathPoints.length ; j < len ; ++j){
	            tmpRoute.coordinates.push([pathPoints[j]._lon, pathPoints[j]._lat]);
	        	}
	        	routeLine.push(tmpRoute);
					}
					// console.log(tmpArray);

        	// console.log("routeLine", routeLine);
					routeLines.selectAll('path')
						.data(routeLine)
						.enter().append("path")
						.attr( "class", "routeLine")
						.attr("stroke", "blue")
			      .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("d", ctrl.geoPath )

           ctrl.getVehicleLocation(selectedRoute);
				}

				// draw vehicles
				$scope.drawVehicle = function(data) {
					if(!data) return;
					console.log("data", data);
					var tmp = svg.selectAll('.vehicle')
					tmp.remove();

					svg.selectAll('.vehicle')
						  .data(data)
							.enter().append("circle")
							.attr("class", "vehicle")
							.attr("r", 5)
							.attr("fill", "red")
							.attr("transform", function(d) {
							return "translate(" + ctrl.albersProjection([
							  d._lon,
							  d._lat
							]) + ")";
					});
				}
			}
		}
	};
}]);
