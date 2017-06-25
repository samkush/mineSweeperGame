(function () {
'use strict';
angular.module('Services')

.factory('configService',[
  '$http',
  '$q',
  'CacheService',
  function($http, $q, CacheService){
    var cache = CacheService.get('config');

    var RootMethods = {

      getConfigList : function(filter){
        var defer = $q.defer();

        filter = angular.merge({
          page: 1,
          limit: 10,
          order: 'name ASC'
        }, filter);

        $http
        .get('api://Config/count', {
          params: { where : filter.where }
        })
        .success(function(res){

          if( res.count ){
            var pages = Math.ceil(res.count / filter.limit);

            if( pages < filter.page )
            {
              filter.page = pages;
            }
            if( filter.page < 1 ){ filter.page = 1; }

            filter.skip = (filter.page - 1) * filter.limit;

            $http
            .get('api://Config/', {
              params: {
                filter : filter
              }
            })
            .success(function(r){

              defer.resolve({
                count : res.count,
                pages : pages,
                page : filter.page,
                records : r
              });

            })
            .error(defer.reject);

          } else {

            defer.resolve({
              count : res.count,
              records : []
            });

          }

        })
        .error(defer.reject);

        return defer.promise;

      },
      // getConfigList : function(){
      //   var defer = $q.defer();
      //   var filter = {
      //     order: 'name ASC'
      //   };
      //
      //   $http
      //     .get('api://Config/',
      //     {
      //        params:
      //        {
      //          filter : filter
      //        },
      //        cache: cache
      //     })
      //     .success(defer.resolve)
      //     .error(defer.reject);
      //   return defer.promise;
      // },
      get : function(){
        var defer = $q.defer();

        var keys = _.toArray(arguments);

        var filter = {
          where : {
            key: { inq: keys }
          }
        };

        $http
          .get('api://Config/', {
            params : {
              filter: filter
            },
            cache: cache
          })
          .success(function(records){

            records = _.indexBy(records, 'key');

            for (var r in records) {
              if ( records.hasOwnProperty(r) ) {
                switch (records[r].type) {
                  case 'json':
                    try {
                      records[r].v = JSON.parse(records[r].values);
                    } catch( e ) {
                      console.log('Invalid JSON ' + r);
                    }
                    break;
                    case 'plain_text':
                    try {
                        records[r].v = records[r].values;
                    } catch( e ) {
                      console.log('Invalid JSON ' + r);
                    }
                    break;
                }
              }
            }

            defer.resolve(records);

          })
          .error(defer.reject);

        return defer.promise;
      },
      getConfig : function(configId){
        var defer = $q.defer();
       $http
       .get('api://Config/' + configId, {
         cache: cache
       })
       .success(defer.resolve)
       .error(defer.reject);
       return defer.promise;
      },
      editConfig : function(id, data){
        var defer = $q.defer();
        $http
        .put('api://Config/'+ id, data)
        .success(function(o){
          CacheService.clear('config');
          defer.resolve(o);
        })
        .error(defer.reject);
        return defer.promise;
      },
      getFieldsData : function(filter){
        var defer = $q.defer();
        $http
          .get('api://Config/', {
            params : {
              filter: filter
            },
             cache: cache
          })
          .success(defer.resolve)
          .error(defer.reject);
        return defer.promise;
      },
      addConfig : function(data){
        var defer = $q.defer();
        $http
        .post('api://Config/', data)
        .success(function(o){
          CacheService.clear('config');
          defer.resolve(o);
        })
        .error(defer.reject);
        return defer.promise;
      },
      deleteConfig : function(id){
        var defer = $q.defer();
        $http
        .delete('api://Config/'+ id)
        .success(function(o){
          CacheService.clear('config');
          defer.resolve(o);
        })
        .error(defer.reject);
        return defer.promise;
      }
    };
    return RootMethods;
  }]);
}());
