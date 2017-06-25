(function () {
  'use strict';
  angular.module('FileUpload', ['angularFileUpload'])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/file-upload', {
      templateUrl: 'scripts/pages/file-upload/view/file-upload.html',
      controller: 'fileUploadController',
      containerClass: 'reports-file-upload',
      resolve: {
        config: function(configService, $rootScope){
          return configService.get('raw_input_file_names');
        }
      }
    })
  })
  .controller('fileUploadController',
  [
    '$scope',
    '$rootScope',
    '$http',
    'Util',
    'FileUploader',
    'config',
    function ($scope, $rootScope, $http, Util, FileUploader, config) {

      $rootScope.setPageTitle( 'File Upload' );
      var uploader = $scope.uploader = new FileUploader({
        url: $rootScope.config.api.url + 'Uploads/' +$rootScope.config.cdn.container +'/upload',
        formData: [
          { 'userId': $scope.currentUser.userId },
          { 'email': $scope.currentUser.user.email }
        ]
      });


      $scope.getConnectDb = _.debounce(function(){
        $http
        .post('api://Uploads/import-to-db/')
        .success(function(res){
          alert('Data Inserted Successfully');
        })
        .error(function(err){
        });

      }, 500);

      // $scope.min = (config.date_setting && moment(config.date_setting.v.minDate).format( $rootScope.config.dateFormat )) || Util.pastYear(new Date(), 5) ;
      // $scope.min = moment( $scope.min ).startOf('day');
      // $scope.max = Util.postYear(new Date(), 2);

      var fileTypes = config.raw_input_file_names.v.type;
      var fileNames = config.raw_input_file_names.v.name;

      $scope.fileNames = fileNames;
      uploader.filters.push(
        {
          name: 'typeFilter',
          fn: function(item) {
            return _.contains(fileTypes, item.type);
          }
        },
        {
          name: 'nameFilter',
          fn: function(item) {
            return _.contains(fileNames, item.name);
          }
        }
      );

      // CALLBACKS
      uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.log('onWhenAddingFileFailed');
        $scope.errorMessage = 'Please upload valid File!'
      };

      uploader.onAfterAddingFile = function(fileItem) {
        $scope.errorMessage = '';
      };

      uploader.onBeforeUploadItem = function(item) {
        //    console.info('onBeforeUploadItem', item);
      };
      uploader.onSuccessItem = function(fileItem, response, status, headers) {
      };

      uploader.onErrorItem = function(fileItem, response, status, headers) {
        if( !response ){
          $scope.errorMessage = 'Server Under Maintenance';
        }else{
          $scope.errorMessage =  response.error.message;
        }
      };

      uploader.onCancelItem = function(fileItem, response, status, headers) {
        $scope.errorMessage = '';
      };

      $scope.style = {
        'display' : 'none'
      }

      var droppable = angular.element('#buggy-drop-zone'),
      lastenter;
      droppable.on("dragenter", function (event) {
        lastenter = event.target;
        $scope.style.display = 'block';
      });
      droppable.on("dragleave", function (event) {
        if (lastenter === event.target) {
          $scope.style.display = 'none';
        }
      });

      droppable.on("drop", function (event) {
        event.preventDefault();
        event.stopPropagation();
        $scope.style.display = 'none';
      });
    }
  ]);
}());
