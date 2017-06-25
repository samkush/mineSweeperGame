(function () {
  'use strict';
  angular.module('ManageUser')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/manage-user/add', {
      templateUrl: 'scripts/pages/manage/manage-user/view/add.html',
      controller: 'manageUserAddController',
      resolve: {
        configData: function(configService){
          return configService.get('User_Capabilities');
        }
      }
    })
  })
  .controller('manageUserAddController',[
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    '$timeout',
    'Util',
    'userService',
    'Session',
    'configService',
    'configData',
    function ($scope, $rootScope, $location, $routeParams, $timeout, Util, userService, Session, configService, configData) {
      $scope.pageTitle = "ADD USER";
      $rootScope.setPageTitle( 'Add User' );
      $scope.loading = false;
      $scope.compulsoryField = '*';
      $scope.formScope = '';
      $scope.statuses = {
        submitting : false,
        saved : false,
        error : false
      };
      $scope.form = {};
      $scope.setFormScope= function(scope){
        $scope.formScope = scope;
      }

      $scope.Session = Session;
      var lastStatus = '';
      var plantCapabilities = [];
      var supplierCapabilities = [];
      var defaultUser = {
        name: '',
        capabilities : [],
        password : '',
        email: '',
        tags: [],
        plant: [],
        plantType: 'plant',
        status : 'active',
      };
      $scope.user = angular.copy(defaultUser);

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

      $scope.tabs = [
        { title:'Plant', content:'Dynamic content 1', active: true , value: 'plant'},
        { title:'Supplier', content:'Dynamic content 2', value: 'supplier'}
      ];

      // $scope.accessLevelArr = configData.User_Capabilities && configData.User_Capabilities.v && configData.User_Capabilities.v;
      // [{"name": "Manage User", "id": "can_manage_user"},{ "name": "Manage Config","id": "can_manage_config" }]
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
          }else{
            $scope.capabilitiesSelectizeConfig.options = $scope.config.capabilities;
          }

          $scope.onSubmit = function(){
            $scope.form.email.$setValidity('uniqueness', true);

            if( !$scope.form.$valid ){
              return;
            }
            $scope.statuses.saved = false;
            $scope.statuses.submitting = true;
            $scope.statuses.error = false;
            if(!_.contains($scope.user.tags, $scope.user.status)){
              $scope.user.tags.push($scope.user.status);
            }
            var data = Util.pluckOnly($scope.user, [
              'name',
              'email',
              'password',
              'capabilities',
              'status'
            ]);
            userService
            .addUser(data)
              .then(function() {
                $scope.loading = false;
                $scope.statuses.submitting = false;
                $scope.statuses.saved = true;
                $scope.user = angular.copy(defaultUser);
                $location.path('/manage-user');
              }, function(reason) {
                console.log( 'Something went wrong' ,reason );
                $scope.loading = false;
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
