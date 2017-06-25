(function () {
  'use strict';
  angular.module('ManageUser', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/manage-user', {
        templateUrl: 'scripts/pages/manage/manage-user/view/listing.html',
        controller: 'manageUserController',
        reloadOnSearch: false,
        containerClass: 'manage-user'
      })
  })
  .controller('manageUserController',
  [
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$modal',
    '$cookieStore',
    'Util',
    'userService',
    'Session',
    function (
      $scope,
       $rootScope,
       $location,
       $routeParams,
       $modal,
       $cookieStore,
       Util,
       userService,
       Session) {
      $scope.pageTitle = "MANAGE USER";
      $rootScope.setPageTitle( 'Manage User' );
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
        query: Util.getQueryParameter('userQuery',''),
        userStatus: Util.getQueryParameter('userStatus', 'active'),
        page: Util.getQueryParameter('userPage', 1),
        limit : '10',
        pages : 0,
      };

      $scope.global_message_obj = {
        msg : 'Loading data...',
        class: 'text-center'
      };

      $scope.prev = function(){
        $scope.search.page = parseInt($scope.search.page);
        $scope.search.pages = parseInt($scope.search.pages);
        $scope.search.page = $scope.search.page > 1 ? parseInt($scope.search.page - 1) : 1;
        $scope.prevPaginateLoading = true;
        $scope.getResults();
      };

      $scope.next = function(){
        $scope.search.page = parseInt($scope.search.page);
        $scope.search.pages = parseInt($scope.search.pages);
        $scope.search.page = $scope.search.page < $scope.search.pages ? $scope.search.page + 1 : $scope.search.pages;
        $scope.nextPaginateLoading = true;
        $scope.getResults();
      };


      var filter = {};

      $scope.getResults = _.debounce(function(){
        filter.where = {};
        filter.where.and = [];
        if( !Session.isCapableOf('root') ){
          filter.where.and.push({
            capabilities : {nlike :  '%root%'}
          });
        }
        if( $scope.search.query ){
          filter.where.and.push({
            or : [
              {
                'name' : {
                  like: '%' + $scope.search.query + '%',
                  options: 'i' }
              },
              {
                'email' : {
                  like: '%' + $scope.search.query + '%',
                  options: 'i'
                }
              }
            ]
          });
        }

        if( $scope.search.userStatus === 'inactive' ){
          filter.where.and.push({
            'status':  'inactive'
          });
        }else if( $scope.search.userStatus === 'active' ){
          filter.where.and.push({
            'status': 'active'
          });
        }

        filter.page = $scope.search.page;
        filter.limit = $scope.search.limit;

        Util.storeQueryParameter($scope.search.query, 'userQuery');
        Util.storeQueryParameter($scope.search.page, 'userPage');
        Util.storeQueryParameter($scope.search.userStatus, 'userStatus');

        userService.getUserList(filter)
        .then(function ( res ) {

          if(res.records.length && res.count) {
            $scope.nextPaginateLoading = false;
            $scope.prevPaginateLoading = false;
            $scope.search.page = res.page;
            $scope.search.pages = res.pages;
            $scope.search.count = res.count;
            $scope.users = res.records;
            $scope.global_message_obj = null;
          } else {
            $scope.global_message_obj = {
              msg : 'No Data Available',
              class: 'text-center text-danger'
            };
            $scope.users = res.records;
            $scope.search.count = res.count;
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
          $scope.global_message_obj = {
            msg : 'No Data Available',
            class: 'text-center text-danger'
          };

        });

      }, 500);

      $scope.getResults();
      // $scope.$watch('search', getResults, true);

      $scope.deleteUser = function(idx){
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
          userService.deleteUser(idx.id)
          .then(function() {
            $scope.users.splice( $scope.users.indexOf(idx), 1 );
          });
        }, function () {
        });
      };

    }
  ])
  .factory('userService',[
    '$http',
    '$q',
    function($http, $q)
    {
      var RootMethods = {
        getUserList : function(filter){

          var defer = $q.defer();
          filter = angular.merge({
            page: 1,
            limit: 10,
            where : {
            }
          }, filter);

          $http
          .get('api://users/count', { params: { where : filter.where } })
          .success(function(res){

            if( res.count ){
              filter.page = filter.page || 1;
              var pages = Math.ceil(res.count / filter.limit);

              if( pages < filter.page )
              {
                filter.page = pages;
              }
              if( filter.page < 1 ){ filter.page = 1; }

              filter.skip = (filter.page - 1) * filter.limit;

              $http
              .get('api://users/', { params: { filter : filter } })
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
        getUser : function(userId){
          var defer = $q.defer();
          var filter = {}
          filter.include = 'deployments';
          $http
          .get('api://users/' + userId, {params : {'filter' : filter }})
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        editUser : function(id, data){
          var defer = $q.defer();
          $http
          .put('api://users/'+ id, data)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        addUser : function(data){
          var defer = $q.defer();
          $http
          .post('api://users/', data)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        },
        deleteUser : function(id){
          var defer = $q.defer();
          $http
          .delete('api://users/'+ id)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        }
      };
      return RootMethods;
    }
  ]);

}());
