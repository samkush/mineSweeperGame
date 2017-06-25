(function () {
  'use strict';
  angular.module('FileUpload')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/data-history', {
      templateUrl: 'scripts/pages/data-history/view/data-history.html',
      controller: 'dataHistoryController',
      containerClass: 'reports-data-history',
      resolve: {
        DataHistory: function(feedPostService){
          return feedPostService.getDataHistory();
        }
      }
    })
  })
  .controller('dataHistoryController',
  [
    '$scope',
    '$rootScope',
    '$http',
    '$interpolate',
    'Util',
    'DataHistory',
    'feedPostService',
    function ($scope, $rootScope, $http, $interpolate, Util, DataHistory, feedPostService) {
      $rootScope.setPageTitle( 'Data History' );
      $scope.min = moment( (Util.pastYear(new Date(), 10)) ).startOf('year');
      $scope.max = moment().toDate();


      var generateObj = function( data ){
        $scope.chartData = data.map(function (dateElement) {
          return {
            date: new Date(dateElement.key_as_string),
            count: dateElement.doc_count
          };
        });
      }

      $scope.template = $interpolate('{{max}} abcd </div>')($scope);

      generateObj( DataHistory.records );
      $scope.onSubmit = function(){
        $scope.filter = {
          date : moment($scope.date).format('YYYY-MM-DD')
        };
        feedPostService.getDataHistory($scope.filter)
        .then(function( res ){
          generateObj( res.records );
        })
      }

    }
  ]);
}());
