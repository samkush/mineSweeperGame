(function () {
'use strict';

var _cacheList = {};

angular.module('Services')

.factory('CacheService',[
  '$http',
  '$cacheFactory',
  function( $http, $cacheFactory ){

    var RootMethods = {
      get : function( key ){
        if( _cacheList[key] ) {
          return _cacheList[ key ];
        }
        return (_cacheList[key] = $cacheFactory( key ));
      },
      clear : function(){
        var args = _.flatten( [].slice.call(arguments) );
        for (var i in _cacheList) {
          if (_cacheList.hasOwnProperty(i)) {
            if( _.contains(args, i) || (args[0] && args[0] === '*') ){
              _cacheList[i].removeAll();
            }
          }
        }
      }
    };
    return RootMethods;
  }]);
}());
