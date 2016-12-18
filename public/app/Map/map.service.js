'use strict';
angular.module('sfmuni.map')
.service('NextBus', ['$http', function($http){
  var service = this;
  var x2js = new X2JS();

  service.GetMapJsonData = function(fileName) {
    return $http({
        method: 'GET',
        url: 'data/' + filename + '.json'
    });
  }

  // GET Route List
  service.GetRouteList = function() {
    var url = "//webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni";
    return $http({
      method: 'GET',
      url: url,
      transformResponse: function(cnv) {
        var aftCnv = x2js.xml_str2json(cnv);
        return aftCnv;
      }
    });
  };

  // GET Route Config
  service.GetRouteConfig = function(routeName) {
    var url = "//webservices.nextbus.com/service/publicXMLFeed?command=routeConfig&a=sf-muni&r=" + routeName;
    return $http({
      method: 'GET',
      url: url,
      transformResponse: function(cnv) {
        var aftCnv = x2js.xml_str2json(cnv);
        return aftCnv;
      }
    });
  };

  // GET Vehicles Location
  service.GetVehicleLocation = function(routeName) {
    var date = new Date()
    var time = date.getTime() - 12000;
    // var time = 1144953500233;
    var url = "//webservices.nextbus.com/service/publicXMLFeed?command=vehicleLocations&a=sf-muni&r=" + routeName + "&t=+" + time;
    return $http({
      method: 'GET',
      url: url,
      transformResponse: function(cnv) {
        var aftCnv = x2js.xml_str2json(cnv);
        return aftCnv;
      }
    });
  };

}]);