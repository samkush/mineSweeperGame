(function () {
  'use strict';
  angular.module('ManageConfig', [])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/manage-config', {
      controller: 'configController',
      containerClass: 'manage-config',
      reloadOnSearch: false,
      templateUrl: 'scripts/pages/manage/manage-config/view/list.html'
    })
    .when('/manage-config/edit/:id', {
      controller: 'configEditController',
      templateUrl: 'scripts/pages/manage/manage-config/view/edit.html'
    })
    .when('/manage-config/add', {
      controller: 'configAddController',
      templateUrl: 'scripts/pages/manage/manage-config/view/add.html'
    });
  })
  .controller('configController', [
    '$scope',
    '$rootScope',
    '$location',
    '$modal',
    '$cookieStore',
    'Util',
    'configService',
    function(
      $scope,
      $rootScope,
      $location,
      $modal,
      $cookieStore,
      Util,
      configService
    ) {
      $rootScope.setPageTitle( 'Manage Config' );

      var config = null;
      $scope.configs = null;
      var filter = {};

      $scope.search = {
        query: Util.getQueryParameter('configQuery'),
        page: Util.getQueryParameter('configPage', 1),
        limit : '10',
        pages : 0,
      };

      $scope.global_message_obj = {
        msg : 'Loading data...',
        class: 'text-center'
      };

      $scope.deleteConfig = function(idx){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'scripts/fragments/components/confirmation-dialog/view/confirmation-dialog.html',
          controller: 'ModalInstanceCtrl',
          size: 'sm',
          resolve: {
            modalData: function () {
              return {
                title: 'Confirm',
                body : 'Are you sure you want to delete this?',
                positiveBtn: 'Yes',
                negativeBtn: 'Cancel',
              };
            }
          }
        });
        modalInstance.result.then(function () {
          configService.deleteConfig(idx.id)
          .then(function() {
            $scope.configs.splice( $scope.configs.indexOf(idx), 1 );
          });
        }, function () {
        });
      };

      $scope.prev = function(){
        $scope.search.page = parseInt($scope.search.page);
        $scope.search.pages = parseInt($scope.search.pages);
        $scope.search.page = $scope.search.page > 1 ? parseInt($scope.search.page - 1) : 1;
        $scope.prevPaginateLoading = true;
      };

      $scope.next = function(){
        $scope.search.page = parseInt($scope.search.page);
        $scope.search.pages = parseInt($scope.search.pages);
        $scope.search.page = $scope.search.page < $scope.search.pages ? $scope.search.page + 1 : $scope.search.pages;
        $scope.nextPaginateLoading = true;
      };

      var getResults  = _.debounce(function(){
        filter.where = {};
        if( $scope.search.query ){
          filter.where.or = [{
            'key': {
              like: '%' + $scope.search.query + '%',
              options: 'i'
            }
          }, {
            'name': {
              like: '%' + $scope.search.query + '%',
              options: 'i'
            }
          }];
        }
        filter.page = $scope.search.page;
        filter.limit = $scope.search.limit;

        Util.storeQueryParameter($scope.search.query, 'configQuery');
        Util.storeQueryParameter($scope.search.page, 'configPage');

        configService.getConfigList(filter)
        .then(function ( res ) {

          if(res.records.length && res.count){
            $scope.configs = res.records;
            config = res.records;
            $scope.nextPaginateLoading = false;
            $scope.prevPaginateLoading = false;
            $scope.search.page = res.page;
            $scope.search.pages = res.pages;
            $scope.search.count = res.count;
            $scope.global_message_obj = null;
          } else {
            $scope.global_message_obj = {
              msg : 'No Data Available',
              class: 'text-center text-danger'
            };
            $scope.configs = res.records;
            $scope.search.count = res.count;
          }

        },function(){

            $scope.nextPaginateLoading = false;
            $scope.prevPaginateLoading = false;
            $scope.global_message_obj = {
              msg : 'No Data Available',
              class: 'text-center text-danger'
            };

        });

      }, 500);

      getResults();
      $scope.$watch('search', getResults, true);

    }
  ])
  .factory('configService',[
    '$http',
    '$q',
    'CacheService',
    function($http, $q, CacheService){
      var cache = CacheService.get('config');

      var RootMethods = {
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
                        console.log('records[r].values ', records[r].values);
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
