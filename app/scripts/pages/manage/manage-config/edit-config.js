(function () {
  'use strict';
  angular.module('ManageConfig')
  .controller('configEditController', [
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    'configService',
    'Util',
    function(
      $scope,
      $rootScope,
      $location,
      $routeParams,
      configService,
      Util
    ) {
      var title = 'Edit Config';
      $scope.pageTitle = "EDIT CONFIG";
      $rootScope.setPageTitle( title );
      $scope.config = {
        name : null,
        values : null,
        type : 'plain_text'
      };
      $scope.statuses = {
        submitting : false,
        saved : false,
        error : false
      };

      $scope.contentTypeConfig = {
        multiple: false,
        options : [
          { label: 'Plain Text', value: 'plain_text' },
          { label: 'JSON', value: 'json' }
        ]
      };

      $scope.$watch('config.values', function(val){
        if($scope.config.type === 'json'){
          var res = Util.isValidJson(val);
          $scope.userForm.values.$setValidity('invalidJson', res.valid);
        }
      });

      configService.getConfig($routeParams.id)
      .then(function(records) {
        $scope.config = records;

      }, function() {
        $scope.config = null;
        $scope.error = true;
        $scope.showError = true;
        $scope.messge = 'Error encountered while loading user #' + $routeParams.userId;
      });

      $scope.onSubmit = function(){
        if( !$scope.userForm.$valid ){
          return;
        }
        $scope.statuses.saved = false;
        $scope.statuses.submitting = true;
        $scope.statuses.error = false;
        var data = Util.pluckOnly($scope.config, [
          'name',
          'key',
          'type',
          'values'
        ]);
        configService.editConfig($routeParams.id, data)
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
