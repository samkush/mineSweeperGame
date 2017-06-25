(function () {
  'use strict';
  angular.module('ManageMeasure', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/manage-measure', {
        templateUrl: 'scripts/pages/manage/manage-measure/view/listing.html',
        controller: 'manageMeasureController',
        reloadOnSearch: false,
        containerClass: 'manage-measure'
      })
  })
  .controller('manageMeasureController',
  [
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$modal',
    '$cookieStore',
    'Util',
    'measureService',
    'Session',
    function ($scope, $rootScope, $location, $routeParams, $modal, $cookieStore, Util, measureService, Session) {
      $scope.pageTitle = "MANAGE MEASURE";
      $rootScope.setPageTitle( 'Manage Measure' );
      $scope.noUserAvailable = false;
      $scope.filterData = {
        multiple: false,
        selected: 'All',
        options : [
          { label: 'Active', value: 'active'},
          { label: 'Inactive', value: 'inactive'},
        ]
      };
      $scope.recordsPerPage = {
        multiple: false,
        selected: 10,
        options : [
          { label: '10', value: 10 },
          { label: '50', value: 50 },
          { label: '100', value: 100 }
        ]
      };

      $scope.search = {
        query: Util.getQueryParameter('measureQuery'),
        measureStatus: Util.getQueryParameter('measureStatus', 'active'),
        page: Util.getQueryParameter('measurePage', '1'),
        limit : '10',
        pages : 0,
      };

      $scope.prev = function(){
        $scope.search.page = parseInt($scope.search.page);
        $scope.search.pages = parseInt($scope.search.pages);
        $scope.search.page = $scope.search.page > 1 ? parseInt($scope.search.page - 1) : 1;
        $scope.prevPaginateLoading = true;
        getResults();
      };

      $scope.next = function(){
        $scope.search.page = parseInt($scope.search.page);
        $scope.search.pages = parseInt($scope.search.pages);
        $scope.search.page = $scope.search.page < $scope.search.pages ? $scope.search.page + 1 : $scope.search.pages;
        $scope.nextPaginateLoading = true;
        getResults();
      };
      var filter = {};
      var getResults = _.debounce(function(){
        filter.where = {};
        filter.where.and = [];

        filter.where.and.push({
          or : [
            {
              'name' : { like : $scope.search.query, options: 'i' }
            },
            {
              'measure_id' : { like : $scope.search.query, options: 'i' }
            }
          ]
        });
        if( $scope.search.measureStatus === 'inactive' ){
          filter.where.and.push({
            'tags': {
              inq : ['inactive']
            }
          });
        } else if ( $scope.search.measureStatus === 'active' ){
          filter.where.and.push({
            'tags': {
              inq : ['active']
            }
          });
        }
        filter.page = $scope.search.page;
        filter.limit = $scope.search.limit;

        Util.storeQueryParameter($scope.search.query, 'measureQuery');
        Util.storeQueryParameter($scope.search.page, 'measurePage');
        Util.storeQueryParameter($scope.search.measureStatus, 'measureStatus');

        measureService
        .getMeasureList(filter)
        .then(function ( res ) {
          $scope.nextPaginateLoading = false;
          $scope.prevPaginateLoading = false;
          $scope.search.page = res.page;
          $scope.search.pages = res.pages;
          $scope.search.count = res.count;
          $scope.measures = res.records; // REPEAT
          if(!res.records.length){
            $scope.noUserAvailable = true;
          }else{
            $scope.noUserAvailable = false;
          }
          for (var i in res.records) {
            if (res.records.hasOwnProperty(i)) {
              if(_.contains(res.records[i].roles, 'employee')){
                res.records[i].isSchniderEmp = true;
              }
            }
          }
        }, function(reason) {
          $scope.nextPaginateLoading = false;
          $scope.prevPaginateLoading = false;
          $scope.noUserAvailable = true;
        });

      }, 500);

      getResults();
      $scope.$watch('search', getResults, true);

      $scope.deleteMeasure = function(idx){

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
          measureService.deleteMeasure(idx.id)
          .then(function() {
            $scope.measures.splice( $scope.measures.indexOf(idx), 1 );
          });
        }, function () {
        });
      };

    }
  ])
  .factory('measureService',[
    '$http',
    '$q',
    function($http, $q)
    {
      var RootMethods = {
        getMeasureList : function(filter){

          var defer = $q.defer();
          filter = angular.merge({
            page: 1,
            limit: 10,
            where : {
            }
          }, filter);

          $http
          .get('api://MeasureMaster/count', { params: { where : filter.where } })
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
              .get('api://MeasureMaster/', { params: { filter : filter } })
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
        get : function(filter){
          var defer = $q.defer();
          $http
          .get('api://MeasureMaster/', { params: { filter : filter } })
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        getMeasure : function(userId){
          var defer = $q.defer();
          $http
          .get('api://MeasureMaster/' + userId)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        editMeasure : function(id, data){
          var defer = $q.defer();
          $http
          .put('api://MeasureMaster/'+ id, data)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        addMeasure : function(data){
          var defer = $q.defer();
          $http
          .post('api://MeasureMaster/', data)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        deleteMeasure : function(id){
          var defer = $q.defer();
          $http
          .delete('api://MeasureMaster/'+ id)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        }
      };
      return RootMethods;
    }
  ]);

}());
