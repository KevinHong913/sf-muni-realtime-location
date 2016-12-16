'use strict';
angular.module('sfmuni.map')
.service('NextBus', ['$http', function($http){
    var service = this;
    var x2js = new X2JS();

    service.GetRouteList = function() {
        var url = "http://webservices.nextbus.com/service/publicXMLFeed?command=routeList&a=sf-muni";
        return $http({
            method: 'GET',
            url: url,
            transformResponse: function (cnv) {
              var aftCnv = x2js.xml_str2json(cnv);
              return aftCnv;
            }
        });
    };

}]);