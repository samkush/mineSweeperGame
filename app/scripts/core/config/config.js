(function () {
  'use strict';
  angular.module('Config', [])
  .run([
    '$rootScope',
    '$filter',
    '$anchorScroll',
    'Analytics',
    'configService',
    function ( $rootScope, $filter, $anchorScroll, Analytics, configService) {

      function getConfig(ENV){

        var config = {
          // bypassAuth : false,
          bypassAuth : true,
          capabilities: [],
          googleAnalytics: {
            trackerId : '',
            projectName : 'MineSweeper'
          },
          serverStatus : {
            url: null,
            duration : 2000,
            connected: true,
            dataProcessing: false,
            check: false,
            dataProcessingPercent: null
          },
          api : {
            url : null
          },
          quickList : {},
          cdn : {
            url : null,
            container: 'mineSweeper'
          },
          brand: 'MineSweeper',
          developer: 'Deepak',
          version: '1.0.0',
          prefix: 'Deepak',
          reloadPage : true,
          dateFormat : 'YYYY-MM-DD',
          isMobile : false,
          dummyUsers: {
              root : {
                id : 'root',
                username : 'root',
                password : 'root',
                name : 'Root',
                status : 'inactive'
              },
            }
        };

        return config;
      }

      $rootScope.config = getConfig('LOCAL'); // INTERNAL_TESTING || LOCAL || LOCALHOST

      if ( Modernizr.mq('only all and (max-width: 480px)') ) {
        $rootScope.config.isMobile = true;
      }

      //FIXME: --------------------------- REMOVE BELOW THIS --------------------


      $('body').addClass(Modernizr.touch ? 'touch-device' : 'mouse-device');
      var myEvent = window.attachEvent || window.addEventListener;
      var chkevent = window.attachEvent ? 'onbeforeunload' : 'beforeunload'; /// make IE7, IE8 compatible

      myEvent(chkevent, function(e) {
        if($rootScope.config.reloadPage === false) {
          var confirmationMessage = ' ';  // a space
          (e || window.event).returnValue = confirmationMessage;
          return confirmationMessage;
        }
      });


      $rootScope.pageTitle = '';
      $rootScope.pageMetaTitle = '';

      $rootScope.$on('$viewContentLoaded', function () {
        $anchorScroll();
      });

      $rootScope.$watch('containerClass', function(n, o){
        o && $('body').removeClass(o);
        $('body').addClass(n);
      });

      // $rootScope.$on('$routeChangeSuccess',function(e, current){
      //   $rootScope.containerClass = current && current.$$route && current.$$route.containerClass ? current.$$route.containerClass || '' : '';
      // });

      $rootScope.$on('$routeChangeSuccess',function(e, current){
         $rootScope.containerClass = current && current.$$route && current.$$route.containerClass ? current.$$route.containerClass || '' : '';
         var cc = $rootScope.containerClass && $rootScope.containerClass.split(' ');
         $('.current').removeClass('current');
         for (var i in cc) {
           if (cc.hasOwnProperty(i)) {
             cc[i] = '.' + cc[i];
           }
         }
         if( cc ){
           $(cc.join(',')).addClass('current');
         }
      });

      $rootScope.setPageTitle = function(){
        var arr = _.flatten( [].slice.call(arguments) );
        this.pageTitle = arr.join('<span class="page-title-sep"></span>'); //glyphicon glyphicon glyphicon-menu-right
        arr.unshift( this.config.brand );
        this.pageMetaTitle = arr.reverse().join(' &raquo; ');
      };

    }
  ]);
}());
