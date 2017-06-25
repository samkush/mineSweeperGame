(function () {

  'use strict';
  angular.module('Services')

  .factory('filterService',[
    '$http',
    '$q',
    '$timeout',
    '$rootScope',
    'CacheService',
    function($http, $q, $timeout, $rootScope, CacheService)
    {
      var cache = CacheService.get('filterService');

      var RootMethods = {
        getData : function(type, filter){
          var defer = $q.defer();
          $http
           .get('api://test/', {
             params: {
               filter : filter
             },
             cache: cache
           })
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        getStatusData : function(type){
        var defer = $q.defer();
        type == type || 'status';
        var data = [];
        if(type == 'status'){
           data = [{id: 'active', name: 'Active'}, {id:'inactive', name: 'Inactive'}];
         }
         defer.resolve(data);
        return defer.promise;
      },
      getLatestUpdatedProcessDate : function(filter){
        var defer = $q.defer();
        $http
        .get('api://FeedSource/findOne', {
          params: { filter : filter },
          cache: cache
        })
        .success(defer.resolve)
        .error(defer.reject);
        return defer.promise;
      }
      };
      return RootMethods;
    }
  ]);

}());
