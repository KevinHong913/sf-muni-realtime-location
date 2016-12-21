/* Map Controller */
'use strict';
angular.module('sfmuni.map')
// Main directive for d3 map render
.directive('d3Map', ['SfMapData', function(SfMapData){
	// custom controller
	function MapController($scope, $state, $interval, NextBusService) {
		var vm = this; // use this instead of scope


		/**** VARIABLES ****/
		vm.mercatorProjection = d3.geoMercator()
		  .center([-122.44, 37.78])
		  .scale(350000);
		vm.geoPath = d3.geoPath().projection( vm.mercatorProjection );
		vm.routeList = [];
		vm.routeConfig = [];
		vm.vehicleLocation = [];
		vm.selectedRoute = ["N"];
		vm.currentVehicle;

		vm.initialize = function() {
			console.log("MAP CONTROLLER INIT");
			vm.getRouteList();
		};

		vm.addNewRoute = function() {
			if(vm.selectedRoute.length <= 5) {
				vm.selectedRoute.push("");
			}
		}

		vm.deleteRoute = function(index) {
			if(vm.selectedRoute.length > 1) {
				vm.selectedRoute.splice(index, 1)
			}
		}

		vm.setCurrentVehicle = function(data) {
			vm.currentVehicle = data;
			$scope.$apply();
		}

		// Get All Route List
		vm.getRouteList = function() {
			NextBusService.GetRouteList()
			.then( function(response) {
				console.log("GetRouteList", response);
				if(response.data.body.route) {
					vm.routeList = response.data.body.route;
				}
	    }, function(error) {
	      console.log("Error getting route list", error);
	    });
		}

		vm.initialize();

	};

	return {
		restrict: 'EA',
		controller: [ '$scope', '$state', '$interval', 'NextBus', MapController ],
		controllerAs: 'mapCtrl',
		link: {
			// use pre link so parent directive run before child
			pre: function($scope, iElm, iAttrs, ctrl) {
				var width = $(iElm[0]).width();
				var height = $(iElm[0]).height();

				// create svg tag
				var svg = d3.select(iElm[0])
				.append('svg')
				.style('width', width)
				.style('height', height)

				var zoomBehavior = d3.zoom()
		        .scaleExtent([0.8, 3])
		        .on("zoom", zoomed);

				// map d3 element
				var neighborhoods = svg.append( "g" );
				var streets = svg.append( "g" );
				var freeways = svg.append( "g" );
				var arteries = svg.append( "g" );
				var neighborhoodsOutline = svg.append("g");

				var zoomCover = svg.append("rect");

				zoomCover.style("width", "100%")
				.attr("class", "zoomCover")
		    .style("height", "100%")
		    .attr("fill", "none")
		    .style("pointer-events", "all")
		    .call(zoomBehavior);

		    var zoomed = function() {
				  svg.selectAll("g").attr("transform", d3.event.transform);
				}

				// draw map (this will only run once)
				var renderMap = function() {
					// base layer of map
					neighborhoods.selectAll( "path" )
					  .data( SfMapData.neighborhoods.features )
					  .enter()
					  .append("path")
					  .attr("class", "neighborhood")
					  .attr("d", ctrl.geoPath );
					// neighborhood outline
					neighborhoodsOutline.selectAll( "path" )
					  .data( SfMapData.neighborhoods.features )
					  .enter()
					  .append( "path" )
					  .attr( "class", "neighborhoodOutline")
					  .attr( "d", ctrl.geoPath );
					// streets
					streets.selectAll( "path" )
					  .data( SfMapData.streets.features )
					  .enter()
					  .append( "path" )
					  .attr( "class", "street")
					  .attr( "d", ctrl.geoPath );
					// freeway
					freeways.selectAll( "path" )
					  .data( SfMapData.freeways.features )
					  .enter()
					  .append( "path" )
					  .attr( "class", "freeway")
					  .attr( "d", ctrl.geoPath );
					// arteries. not sure how to present it
					arteries.selectAll( "path" )
					  .data( SfMapData.arteries.features )
					  .enter().append( "path" )
					  .attr( "class", "artery")
					  .attr( "d", ctrl.geoPath );
				}

				renderMap();
			}
		}
	}
}])

// render route, stops, and vehicle locations
.directive('d3MapRoute', ['SfMapData', 'NextBus', '$interval', function(SfMapData, NextBusService, $interval){
	return {
		require: '^d3Map',
		scope: {
			route: '=',
			index: '='
		},
		restrict: 'EA',
		link: {
			pre: function($scope, iElm, iAttrs, ctrl) {

				// Get certain route's config data
				var getRouteConfig = function(routeName) {
					NextBusService.GetRouteConfig(routeName)
					.then( function(response) {
						console.log("Get Route Config", response);
						if(response.data.body.route) {
							$scope.routeConfig = response.data.body.route;
						}
					}), function(error) {
						console.log("Error getting data of file " + fileName, error);
					}
				}

				// Get certain route's all vehicles' location
				var getVehicleLocation = function(routeName) {
					NextBusService.GetVehicleLocation(routeName)
					.then( function(response) {
						console.log("Get Vehicle Location", response);
						if(response.data.body.vehicle) {
							var vehicles = response.data.body.vehicle;
							// sometimes the response type will be different...
							// not only need to check if is object but need to check if it is equal to itself,
							// because null is also consider as object in javascript
							if(typeof vehicles === 'object' && !(vehicles == vehicles) ) {
								$scope.vehicleLocation = [ vehicles ];
							} else if(Array.isArray(vehicles)) {
								$scope.vehicleLocation = vehicles;
							} else {
								$scope.vehicleLocation = []; // empty array to at least trigger watch event to clean point
							}
						}
					}), function(error) {
						console.log("Error getting data of file " + fileName, error);
					}

				}

				var initialize = function() {
					console.log("d3 map route init");

					if($scope.route) {
						getRouteConfig($scope.route);
						getVehicleLocation($scope.route);
					}
				}

				initialize();
				var width = $(svg).width();
				var hegiht = $(svg).height();

				var svg = d3.select(iElm[0].parentNode).select("svg");
				var routeLines = svg.append("g");
				var stops = svg.append("g");
				var vehicles = svg.append("g");


				// Define the div for the tooltip
				var div = d3.select("body").append("div")
				    .attr("class", "tooltip")
				    .style("opacity", 0);


				// Draw route
				$scope.drawRoute = function(data) {
					if(!data) return;
					svg.selectAll('.routeLine.route' + $scope.index).remove();

					// create GeoJson format object
					var routeLine = [];
					for(var i = 0, count = data.path.length ; i < count ; ++i){
						var tmpRoute = { type: "LineString" , coordinates: []};
						var pathPoints = data.path[i].point;
						for(var j = 0, len = pathPoints.length ; j < len ; ++j){
	            tmpRoute.coordinates.push([pathPoints[j]._lon, pathPoints[j]._lat]);
	        	}
	        	routeLine.push(tmpRoute);
					}

					routeLines.selectAll('path')
						.data(routeLine)
						.enter().append("path")
						.attr( "class", "routeLine route" + $scope.index)
            .attr("d", ctrl.geoPath )

           // ctrl.getVehicleLocation($scope.route);
				}

				// Draw Stops
				$scope.drawStop = function(data) {
					if(!data) return;

					svg.selectAll(".stop.route" + $scope.index).remove();

					stops.selectAll(".stop.route" + $scope.index)
					.data(data.stop)
					.enter().append("circle")
					.attr("class", "stop route" + $scope.index)
					.attr("cx", function(d) {
					       return ctrl.mercatorProjection([d._lon, d._lat])[0];
					})
					.attr("cy", function(d) {
					       return ctrl.mercatorProjection([d._lon, d._lat])[1];
					})
					.attr("r", 2)
					.on('mouseover', stopMouseOver)
					.on('mouseout', stopMouseOut)
				}


				// draw vehicles
				$scope.drawVehicle = function(data) {
					if(!data) return;
					// console.log("data", data);
					var tmp = svg.selectAll('.vehicle.route' + $scope.index).remove();

					vehicles.selectAll(".vehicle.route" + $scope.index)
					.data(data)
					.enter().append("rect")
					.attr("class", "vehicle route" + $scope.index)
					.attr("transform", function(d) {
						// Calculate 2D point rotation then apply to translate
						var radium = (d._heading - 90) * Math.PI / 180;
						var newX = 6 * Math.cos(radium) - 3 * Math.sin(radium);
						var newY = 3 * Math.cos(radium) + 6 * Math.sin(radium);
						var x = ctrl.mercatorProjection([d._lon, d._lat])[0] - newX;
						var y = ctrl.mercatorProjection([d._lon, d._lat])[1] - newY;

						return "translate(" + x + ", " + y + ")rotate(" + (d._heading -90) + ")"
					})
					.on('mouseover', vehicleMouseOver)
					.on('mouseout', vehicleMouseOut)

				}

				/**** EVENT HANDLER ****/
				var vehicleMouseOver = function(d, i) {
					d3.select(this)
					.attr('width', 15)
					.attr('height', 9)
					.attr("fill", "yellow");

					div.transition()
          .duration(200)
          .style("opacity", 1);

          div.html("<span class='tooltip-v'>" + d._id + "</span>")
          .style("left", (d3.event.pageX - 5 ) + "px")
          .style("top", (d3.event.pageY - 28) + "px");

					ctrl.setCurrentVehicle(d);

				}

				var vehicleMouseOut = function(d, i) {
					d3.select(this)
					.attr('width', 12)
					.attr('height', 6)
					.attr("fill", "#c12626")

					div.transition()
				  .duration(500)
				  .style("opacity", 0);
				}

				var stopMouseOver = function(d, i) {
					div.transition()
          .duration(200)
          .style("opacity", 1);

          div.html("<span class='tooltip-s'>" + d._title + "</span>")
          .style("left", (d3.event.pageX - 5 ) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
				}

				var stopMouseOut = function(d, i) {
					div.transition()
				  .duration(500)
				  .style("opacity", 0);
				}

				// Refresh vehicle location every 15 second
				$interval(function(){
					console.log("[REFRESH]")

					if($scope.route) {
						getVehicleLocation($scope.route);
					}
				}, 15000);

				/**** WATCH FUNCTIONS *****/
				$scope.$watchCollection( 'route', function(newVal, oldVal) {
					if(newVal) {
						getRouteConfig(newVal);
						getVehicleLocation(newVal);
					}
				})

				$scope.$watchCollection( 'routeConfig', function(newVal, oldVal) {
	  			$scope.drawRoute(newVal);
	  			$scope.drawStop(newVal);
				});

				$scope.$watchCollection( 'vehicleLocation', function(newVal, oldVal) {
	  			 $scope.drawVehicle(newVal);
				});
			}
		}
	}
}])

// Display selected vehicle information
.directive('vehicleInfo', [function(){
	return {
		scope: {
			currentVehicle: '='
		},
		restrict: 'EA',
		templateUrl: 'app/Map/views/vehicle_info.html',
		link: {
			post: function($scope, iElm, iAttrs, ctrl) {
				console.log("currentVehicle", $scope.currentVehicle);

				$scope.$watch('currentVehicle', function(newVal, oldVal) {
					console.log("change");
					animate();
				})

				var animate = function() {
					$(".vehicle-info .label-group span").hide();
					$(".vehicle-info .label-group span").fadeIn(170);
				}
			}
		}
	};
}]);
