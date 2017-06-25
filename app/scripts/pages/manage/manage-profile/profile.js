(function () {
  'use strict';
  angular.module('ManageUser')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/manage-user/profile/:id', {
      templateUrl: 'scripts/pages/manage/manage-profile/view/profile.html',
      controller: 'manageUserProfileController',
      resolve: {
        userData: function(userService, $route){
          return userService.getUser($route.current.params.id);
        }
      }
    });
  })
  .controller('manageUserProfileController',[
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$timeout',
    '$window',
    'userService',
    'Util',
    'Session',
    'configService',
    'userData',
    function ($scope, $rootScope, $location, $routeParams, $timeout, $window, userService, Util, Session, configService, userData) {

      $scope.compulsoryField = '*';
      $rootScope.setPageTitle( 'Profile' );
      $scope.statuses = {
        submitting : false,
        saved : false,
        error : false
      };
      $scope.Session = Session;
      $scope.form = {};
      $scope.setFormScope= function(scope){
        $scope.formScope = scope;
      }
      var defaultUser = {
        name: '',
        capabilities : [],
        tags : [],
        email: '',
        plantType: 'plant',
        status : 'active'
      };

      $scope.user = angular.copy(defaultUser);


      angular.extend($scope.user, userData)

      $scope.genderData = {
        multiple: false,
        options : [
          { label: 'Male', value: 'male'},
          { label: 'Female', value: 'female'}
        ]
      };

      $scope.onSubmit = function(){

        if( !$scope.form.$valid ){
          return;
        }

        if( $scope.user.password && !$scope.user.confirmPassword ){
          $scope.form.confirmPassword.$setValidity('passwordVerify', false);
          $scope.form.confirmPassword.$valid = false;
          $scope.form.confirmPassword.$invalid = true;
          return;
        }
        $scope.statuses.saved = false;
        $scope.statuses.submitting = true;
        $scope.statuses.error = false;

        $scope.user.profileRaw = angular.copy(  $scope.user.profile );
        var data;
        if( !$scope.user.password ){
          data = Util.pluckOnly($scope.user, [
            'name',
            'email',
          ]);
        } else {
          data = Util.pluckOnly($scope.user, [
            'name',
            'email',
            'password',
          ]);
        }
        userService
        .editUser($routeParams.id, data)
        .then(function() {
          $scope.statuses.submitting = false;
          $scope.statuses.saved = true;
        }, function(reason) {
          $scope.statuses.submitting = false;
          $scope.statuses.saved = false;
          $scope.statuses.error = true;
          if( reason && reason.error && reason.error.details && reason.error.details.codes ){
            if( reason.error.details.codes.email && reason.error.details.codes.email.length && reason.error.details.codes.email.shift() === 'uniqueness' ){
            }
            if( reason.error.details.codes.username && reason.error.details.codes.username.length && reason.error.details.codes.username.shift() === 'uniqueness' ){

            }
          }
        });
      };
    }
  ]);

}());
