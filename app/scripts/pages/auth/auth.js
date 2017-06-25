(function () {
  'use strict';

  angular.module('Auth', [])

  .config(function ($routeProvider) {
    $routeProvider

    .when('/login/:box?', {
      controller: 'LoginController',
      templateUrl: 'scripts/pages/auth/view/login.html',
      containerClass: 'auth'
    })

    .when('/logout', {
      controller: 'LogoutController',
      templateUrl: 'scripts/pages/auth/view/logout.html',
      containerClass: 'auth'
    })

    .when('/forgot-password', {
      controller: 'ForgotPasswordController',
      templateUrl: 'scripts/pages/auth/view/forgot-password.html',
      containerClass: 'auth'
    })


    .when('/access/:access_token', {
      controller: 'accessController',
      templateUrl: 'scripts/pages/auth/view/access.html'
    })

    .when('/change-password', {
      controller: 'changePasswordController',
      templateUrl: 'scripts/pages/auth/view/change-password.html',
      containerClass: 'auth'
    });

  })
  .controller('accessController', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$location',
    'Session',
    'userService',
    'authenticationSvc',
    function(
      $scope,
      $rootScope,
      $routeParams,
      $location,
      Session,
      userService,
      authenticationSvc
    ) {
      if( Session.isLoggedin() ){
        Session.logout();
      }
      $scope.verifyingRequest = true;
      authenticationSvc.validDateAccessToken( $routeParams.access_token )
      .then(function ( records ) {
        Session.setSession( records );
        if( Session.isLoggedin() ){
          $scope.verifyingRequest = false;
          if( !_.contains( $rootScope.currentUser.user.tags , 'change_password') ){
            $rootScope.redirectPath = null;
            if( $rootScope.currentUser.user.status === 'inactive'){
              Session.logout();
            }else {
              $location.path( '/' );
              $rootScope.redirectPath = null;
            }

          } else {
            $rootScope.redirectPath = null;
            $location.path(  '/change-password' );
          }
        }
      }, function(reason) {
        $scope.verifyingRequest = false;
        $scope.invalidRequest = true;
        console.log(reason);
      });

      $scope.error = false;
      $scope.invalidRequest = false;
      $scope.message = '';


    }
  ])
  .controller('LoginController', [
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    'Session',
    'userService',
    function(
      $scope,
      $rootScope,
      $location,
      $routeParams,
      Session
    ) {
      $rootScope.setPageTitle( 'Login' );
      if( Session.isLoggedin() ){
        $location.path( $rootScope.redirectPath || '/' );
        $rootScope.redirectPath = null;
        return;
      }

      $scope.error = false;
      $scope.message = '';
      $scope.showLogin = _.some( [ $location.search().after_sign_up, $location.search().change_password, $location.search().forgot_password , $location.search().changePassword ] );

      if( $location.search().change_password ){
        $scope.successMessage = 'Password changed successfully.';
      }

      //$location.search('');
      $scope.login = function(){
        $scope.loading = true;
        $scope.error = false;
        $scope.message = '';
        if( !$scope.username || !$scope.password ){
          $scope.loading = false;
          $scope.error = true;
          $scope.message = 'Please enter Username & Password.';
          return;
        }

        Session.login( $scope.username, $scope.password, function (response) {
          $scope.loading = false;
          if (response.success) {

            $scope.error = false;
            $scope.message = '';
            if( _.contains( $rootScope.currentUser.user.tags , 'change_password') ){
              $location.path(  '/change-password' );
            }else{
              $location.path( $rootScope.redirectPath || '/' );
            }

          } else {

            $scope.error = true;
            $scope.message = response.message;

          }

        });
      };
    }
  ])
  .controller('LogoutController', [
    'Session',
    '$location',
    '$scope',
    '$rootScope',
    function(
      Session,
      $location,
      $scope,
      $rootScope
    ) {

      Session.logout(function(){
        $location.path('/login');
      });

    }
  ])
  .controller('ForgotPasswordController',[
    '$scope',
    '$rootScope',
    '$location',
    '$http',
    'Session',
    function (
      $scope,
      $rootScope,
      $location,
      $http,
      Session
    ) {
      $scope.error = false;
      $scope.userEmail = '';
      $scope.message = '';
      if( Session.isLoggedin() ){
        $location.path( '/' );
        return;
      }
      $rootScope.setPageTitle( 'Forgot Password' );

      $scope.successMessage = '';
      $scope.message = '';
      function validateEmail(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
      }
      $scope.resetPassword = function(){
        $scope.loading = true;
        $scope.error = false;
        $scope.successMessage = '';
        $scope.message = '';
        if( !validateEmail($scope.form.userEmail.$modelValue) ){
          $scope.loading = false;
          $scope.error = true;
          $scope.message = 'Please enter valid Email.';
          return;
        }

        $http.post('api://users/reset', { email: $scope.form.userEmail.$modelValue })
        .success(function() {
          $scope.loading = false;
          $scope.error = false;
          $scope.successMessage = 'Please check your email for further procedure.';
        })
        .error(function() {
          $scope.loading = false;
          $scope.error = true;
          $scope.message = 'Something went wrong.';
        });

      };

    }
  ])
  .controller('changePasswordController',[
    '$scope',
    '$rootScope',
    '$location',
    '$http',
    'Session',
    'Util',
    'userService',
    function (
      $scope,
      $rootScope,
      $location,
      $http,
      Session,
      Util,
      userService
    ) {
      var defaultUser = {
        password: '',
        confirmPassword: '',
      };
      $scope.user = angular.copy(defaultUser);
      $scope.successMessage = '';
      $scope.message = '';

      $scope.changePassword = function(){

        if( $scope.user.password !== $scope.user.confirmPassword ){
          $scope.message = 'Password does not match.';
          return;
        }

        $scope.loading = true;
        $scope.error = false;
        $scope.message = '';
        $scope.successMessage = '';
        $scope.user.tags = $rootScope.currentUser ?  _.without( $rootScope.currentUser.user.tags, 'change_password') : [];

        var data = Util.pluckOnly( $scope.user, [
          'password',
          'tags'
        ]);

        userService.editUser($rootScope.currentUser.user.id, data)
        .then(function() {
          $scope.form.$setPristine(); // to reset form
          $scope.successMessage = 'Password changed successfully.';
          $rootScope.currentUser.user.tags = _.without( $rootScope.currentUser.user.tags, 'change_password');
          Session.logout(function(){
            $location.path('/login?change_password');
          });
        }, function() {
          $scope.message = 'Something went wrong.';
          $scope.statuses.submitting = false;
          $scope.statuses.saved = false;
          $scope.statuses.error = true;
        });

      };

    }
  ])
  .factory('authenticationSvc',[
    '$http',
    '$q',
    function($http, $q)
    {
      var RootMethods = {
        validDateAccessToken : function(token){
          var defer = $q.defer();
          $http
          .get('api://users/access/' + token)
          .success(defer.resolve)
          .error(defer.reject);
          return defer.promise;
        }
      };
      return RootMethods;
    }]);

  }());
