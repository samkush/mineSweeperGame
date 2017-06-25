(function () {
  'use strict';
  angular.module('ManageUser')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/manage-user/edit/:id', {
      templateUrl: 'scripts/pages/manage/manage-user/view/edit.html',
      controller: 'manageUserEditController',
      resolve: {
        userData: function(userService, $route){
          return userService.getUser($route.current.params.id);
        },
        configData: function(configService){
          return configService.get('User_Capabilities');
        },
        deploymentData: function(feedDeploymentService){
          return feedDeploymentService.getFeedDeployments();
        }
      }
    })
  })
  .controller('manageUserEditController',[
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
    'configData',
    'deploymentData',
    function ($scope, $rootScope, $location, $routeParams, $timeout, $window, userService, Util, Session, configService, userData, configData, deploymentData) {
      $scope.pageTitle = "EDIT USER";
      $scope.compulsoryField = '*';
      $rootScope.setPageTitle( 'Edit User' );
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
      var lastSelectedTab = 'plant';

      var lastStatus = '';

      if(userData){
        angular.extend($scope.user, userData);

        // if( _.contains( $scope.user.tags, 'active' ) ){
        //   lastStatus = 'active';
        //   $scope.user.status = 'active';
        // } else {
        //   lastStatus = 'inactive';
        //   $scope.user.status = 'inactive';
        // }

        $scope.user.deployments = _.pluck(userData.deployments, 'id');
      }

      $scope.genderData = {
        multiple: false,
        options : [
          { label: 'Male', value: 'male'},
          { label: 'Female', value: 'female'}
        ]
      };

      $scope.status = {
        multiple: false,
        options : [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' }
        ]
      };

      $scope.capabilitiesSelectizeConfig = {
        create: true,
        sortField: 'text',
        plugins: ['remove_button'],
        options : configData.User_Capabilities && configData.User_Capabilities.v && configData.User_Capabilities.v,
        valueField: 'item',
        labelField: 'item',
        searchField: ['item'],
        placeholder: 'Enter Capabilitie',
        preload: true
      };
      $scope.deploymentSelectizeConfig = {
        create: true,
        options: deploymentData || [],
        maxItems: 3,
        multiple: true,
        plugins: ['remove_button'],
        valueField: 'id',
        labelField: 'name',
        searchField: ['name'],
        placeholder :'Type deployment to Search...',
        preload: false
      };

      // $scope.accessLevelArr = configData.User_Capabilities && configData.User_Capabilities.v && configData.User_Capabilities.v;

      $scope.accessLevelArr = [{"name": "File Upload", "id": "can_file_upload"},{"name": "Manage User", "id": "can_manage_user"}];

      if( !$scope.config.capabilities.length ){
        configService.get('url_config').then(function(res){
          if(res && res.url_config && res.url_config.v){
            $rootScope.config.capabilities = _.uniq(
              _.without(
                _.reduceRight(
                  _.pluck(res.url_config.v, 'capabilities'),
                  function(a, b)
                  {
                    return a.concat(b);
                  }, [])
                  , '$authenticated')
                ).map(function(x) { return { item: x }; });
                $scope.capabilitiesSelectizeConfig.options = $scope.config.capabilities;
          }
        });
      } else {
            $scope.capabilitiesSelectizeConfig.options = $scope.config.capabilities;
      }

      $scope.onSubmit = function(){
        $scope.form.email.$setValidity('uniqueness', true);

        if( !$scope.form.$valid ){
          return;
        }

        if( $scope.user.password &&  !$scope.user.confirmPassword ){
          $scope.form.confirmPassword.$setValidity('passwordVerify', false);
          $scope.form.confirmPassword.$valid = false;
          $scope.form.confirmPassword.$invalid = true;
          return;
        }
        $scope.statuses.saved = false;
        $scope.statuses.submitting = true;
        $scope.statuses.error = false;

        if( lastStatus === 'inactive' && $scope.user.status === 'active') {
          $scope.user.tags.push('user_inactive_to_active');
          $scope.user.tags =  _.without( $scope.user.tags, 'inactive');
          $scope.user.tags =  _.without( $scope.user.tags, 'active');
          $scope.user.tags.push('active');
          lastStatus = 'active';
        }else if(lastStatus === 'active' && $scope.user.status === 'inactive'){
          $scope.user.tags =  _.without( $scope.user.tags, 'inactive');
          $scope.user.tags =  _.without( $scope.user.tags, 'active');
          $scope.user.tags.push('inactive');
          lastStatus = 'inactive';
        }
        $scope.user.profileRaw = angular.copy(  $scope.user.profile );
        var data;
        if( !$scope.user.password ){
          data = Util.pluckOnly($scope.user, [
            'name',
            'email',
            'capabilities',
            'tags',
            'deployments'
          ]);
        } else {
          data = Util.pluckOnly($scope.user, [
            'name',
            'email',
            'password',
            'capabilities',
            'tags',
            'deployments'
          ]);
        }

        userService.editUser($routeParams.id, data)
        .then(function() {
          $scope.statuses.submitting = false;
          $scope.statuses.saved = true;
        }, function(reason) {
          $scope.statuses.submitting = false;
          $scope.statuses.saved = false;
          $scope.statuses.error = true;
          if( reason && reason.error && reason.error.details && reason.error.details.codes ){
            if( reason.error.details.codes.email && reason.error.details.codes.email.length && reason.error.details.codes.email.shift() === 'uniqueness' ){
              $scope.form.email.$setValidity('uniqueness', false);
            }
          }
        });
      };

    }
  ])

}());
