'use strict';
angular.module('sfmuni.map')
.service('NextBus', ['$http', function($http){
  var service = this;
  var x2js = new X2JS(); // use X2JS as to transfrom XML to JSON

  // GET Route List. Param: none
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

  // GET Route Config. Param: route name
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

  // GET All Vehicles Location. Param: route name
  service.GetVehicleLocation = function(routeName) {
    var date = new Date()
    var time = date.getTime() - 14000;
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