(function () {
  'use strict';
  angular.module('ServerStatusModule', [])
  .config(function ($routeProvider) {
    $routeProvider
    .when('/server-status', {
      templateUrl: 'scripts/pages/server-status/view/server-status.html',
      controller: 'serverStatusController'
    });
  })
  .controller('serverStatusController',
  [
    '$scope',
    '$rootScope',
    'Util',
    '$http',
    '$filter',
    '$modal',
    'socketService',
    'Session',
    function ($scope, $rootScope, Util, $http, $filter, $modal, socketService, Session) {
      $rootScope.setPageTitle( 'Data Processing' );
      $scope.is_permitted_to_start_process = Session.isCapableOf('root') || Session.isCapableOf('admin') || Session.isCapableOf('can_file_upload');
      var socket = socketService.request();
      var $progress = $('.progress');
      var $progress_bar = $progress.find('div.progress-bar');
      var $progress_bar_text = $progress_bar.find('span');
      var $progress_button = $('.progress-btn');
      var $progress_msg = $('.progress-msg');
      $scope.error_logs = [];
      $scope.progress_logs = [];
      $scope.no_process_running = true;

      socket.on('progress', function(pgrss){
        // $scope.progress_logs = pgrss;
        $scope.no_process_running = false;
        $progress.removeClass('hide');
        $progress_button.prop('disabled', pgrss.running);
        $progress_msg.html(pgrss.msg);
        $scope.progress_logs.push(pgrss);
        if( $scope.progress_logs.length > 150 ){
          $scope.progress_logs.pop();
        }
        $progress_bar.width( pgrss.progress + '%' );
        $progress_bar_text.html( pgrss.progress + '%' );
      });

      socket.on('progress_error', function(error_obj){
        $scope.error_logs.push(error_obj);
        if( $scope.error_logs.length > 100 ){
          $scope.error_logs.pop();
        }
      });

      socket.on('progress_complete', function(pgrss){
        $scope.no_process_running = true;
        $scope.progress_logs = [];
      });

      $scope.startProcessing = function(){
        var modalInstance = $modal.open({
          animation: $scope.animationsEnabled,
          templateUrl: 'scripts/fragments/components/confirmation-dialog/view/confirmation-dialog.html',
          controller: 'ModalInstanceCtrl',
          size: 'sm',
          resolve: {
            modalData: function () {
              return {
                title: 'Confirm',
                body : 'Are you sure you want to process data?',
                positiveBtn: 'Yes',
                negativeBtn: 'Cancel',
              };
            }
          }
        });
        modalInstance.result.then(function () {
          $scope.isProcessing = true;
          $http
          .get('api://Reports/execute-procedure/', {
            ignoreLoadingBar: false
          })
          .success(function( res ){
            $scope.isProcessing = false;
          })
          .error(function(res){
            $scope.isProcessing = false;
          });
        }, function () {
        });
      }
    }
  ])

}());
