(function () {
  'use strict';
  /**
  * @ngdoc overview
  * @name app
  * @description
  * # app
  *
  * Main module of the application.
  */


  angular.module('app', [
    // 'ngAnimate', // Disable ngAnimate for performance
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',

    'Config',
    'SessionModule',
    'Filters',

    'FragmentHeader',
    'FragmentFooter',
    'UtilModule',
    'Components',
    'angular-loading-bar',
    'ui.bootstrap',
    'checklist-model',
    'selectize',
    'angular-chartist',
    'rzModule', // for background slider
    'checklist-model',
    'angular-google-analytics',
    'Pages',
    'base64',
    'infinite-scroll',
    'ngComboDatePicker',
    'ui.bootstrap',
    'mentio',
    'ui.codemirror',
    // 'ui.tinymce',
    'angular-sortable-view',
    'ngTextTruncate',
    'ngDialog'
  ])

  .config([
    '$httpProvider',
    'cfpLoadingBarProvider',
    '$routeProvider',
    function(
      $httpProvider,
      cfpLoadingBarProvider,
      $routeProvider
    ) {

      // $httpProvider.interceptors.push('responseObserver');
      $httpProvider.interceptors.push('middleware');
      cfpLoadingBarProvider.includeBar = true;
      cfpLoadingBarProvider.includeSpinner = false;
      cfpLoadingBarProvider.latencyThreshold = 100;

      // $routeProvider
      //   .when('/404', {
      //     templateUrl: '404.html',
      //   })
      //   .when('/403', {
      //     templateUrl: '403.html',
      //   })
      //   .otherwise({
      //     redirectTo: '/404'
      //   });

    }
  ])
  .run([
  '$rootScope',
  '$location',
  'Session',
  function ( $rootScope, $location, Session ) {
  }])

  .factory('middleware', ['$rootScope','Util', function($rootScope, Util) {
    return {
      request: function(request) {
        request.url = Util.apiUrl( request.url );
        return request;
      },
      'response': function(response) {
         if((_.isArray(response.data) || _.isObject(response.data)) && !$rootScope.config.serverStatus.connected){
           $rootScope.config.serverStatus.connected = true;
         }
         return response;
      }
    };
  }])

  .factory('responseObserver', function($q, $location, $rootScope) {
      return {
        responseError: function(errorResponse) {
          switch (errorResponse.status) {
            case 403:
              $rootScope.setPageTitle( 'Forbidden' );
              $location.path('/403')
              break;
            case 404:
              $rootScope.setPageTitle( 'Error 404 (Not Found)!!' );
              $location.path('/404')
              break;
            case 500:
              break;
            case -1:
                if($rootScope.config.serverStatus.connected){
                $rootScope.config.serverStatus.connected = false;
              }
                  // serverStatusService.getServerStatus();
                break;
          }
          return $q.reject(errorResponse);
        }
      };
  })
  .config([
        'AnalyticsProvider',
        function(
          AnalyticsProvider
        ) {
          AnalyticsProvider.ignoreFirstPageLoad(false);
          AnalyticsProvider.trackPages(true);
          AnalyticsProvider.useAnalytics(true);
          // AnalyticsProvider.useCrossDomainLinker(true);
          AnalyticsProvider.setAccount('UA-73566770-5');
        }
      ])
}());
