(function () {
  'use strict';
  angular.module('Components', [])
  .factory('componentHelper', ['$rootScope', function($rootScope) {
    return {
      getId : function(){
        $rootScope._componentId = $rootScope._componentId || 0;
        return ++$rootScope._componentId;
      }
    };
  }]);
}());
