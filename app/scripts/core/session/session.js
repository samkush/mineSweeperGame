(function () {
  'use strict';

  angular.module('SessionModule', [])

  .run([
    '$rootScope',
    '$location',
    '$route',
    'Session',
    'configService',
    function ( $rootScope, $location, $route, Session, configService) {

      //  configService.get('url_config');

      var check_access = function(path, next, current){
        var _has_acess = function(access_map){
          var access_flag = false;

          if(path){

            var access_obj = access_map[ next.$$route && next.$$route.originalPath ];
            if( !_.isEmpty(access_obj) ){
              var intersect = _.intersection($rootScope.currentUser && $rootScope.currentUser.user && $rootScope.currentUser.user.capabilities ? $rootScope.currentUser.user.capabilities : [], access_obj.capabilities);
              access_flag = (intersect.length == access_obj.capabilities.length);
            } else {
              access_flag = true;
            }
          }
          if(!access_flag){
            $rootScope.setPageTitle( 'Forbidden' );
            $location.path('/403');
          }
        }

        // configService.get('url_config')
        // .then(function(res){
        //   if(res && res.url_config && res.url_config.v){
        //     _has_acess(res.url_config.v);
        //     if(!$rootScope.config.capabilities.length){
        //       $rootScope.config.capabilities = _.uniq(
        //         _.without(
        //           _.reduceRight(
        //             _.pluck(res.url_config.v, 'capabilities'),
        //             function(a, b)
        //             {
        //               return a.concat(b);
        //             }, [])
        //             , '$authenticated')
        //           ).map(function(x) { return { item: x }; });
        //         }
        //       }
        //     });

          }     // check_access ends here

          // keep user logged in after page refresh
          if( !Session.isLoggedin() ){
            Session.loadSession();
          }
          var preventedRedirectPaths = ['/403', '/404'];
          var redirect_if_needed = function(event, next, current){

            var path = $location.path();
            // Redirect to login page if not logged in
            if(
              path !== '/login' &&
              path !== '/logout' && //skip auto redirect to log
              path !== '/sign-up' &&
              path !== '/forgot-password' &&
              !path.match( /^\/access\// ) &&
              !Session.isLoggedin()
            ) {
              if(!Session.isLoggedin()){
                Session.clearSession();
              }
              if( !_.contains(preventedRedirectPaths, path) && !path.match( '/login' ) ){
                $rootScope.redirectPath = path;
              }

              $location.path('/login');

            } else {

              if(
                $rootScope.config.serverStatus.dataProcessing === true &&
                Session.isLoggedin()
              ){
                if( path !== '/logout' && $rootScope.config.serverStatus.check){
                  $location.path('/server-status');
                }
              } else {
                if(
                  !path.match( /^\/access\// ) &&
                  path !=='/forgot-password' &&
                  path !=='/change-password'
                ){
                   check_access(path, next, current);
                  return true;

                } else {
                  return true;
                }
              }
            }
          };
          // $rootScope.$watch('config.serverStatus.dataProcessing', function( val ){
          //   if(Session.isLoggedin()){
          //     if( val == true ){
          //      // $location.path('/server-status');
          //     }
          //   }
          // }, true);

          $rootScope.$on('$routeChangeStart', redirect_if_needed);

        }
      ])

      .factory('Session', [
        '$http',
        '$cookieStore',
        '$rootScope',
        '$cookies',
        'Util',
        function(
          $http,
          $cookieStore,
          $rootScope,
          $cookies,
          Util
        ) {
          var service = {};
          var sessionVar = '_' + $rootScope.config.prefix;

          service.login = function (username, password, callback) {

            if(username.match(/^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/g)){
              // console.log('email');
              // Bypass Auth
              if( $rootScope.config.bypassAuth && $rootScope.config.dummyUsers && $rootScope.config.dummyUsers[ email ] && $rootScope.config.dummyUsers[ email ].password === password ){
                this.setSession( { user : $rootScope.config.dummyUsers[ email ], userId : email, id : 'SESSION_ID' } );
                callback({ success:true });
                return;
              }
              if($rootScope.config.bypassAuth){
                callback({ success:false, message: 'Email or Password is incorrect.' });
                return;
              }
              /* Use this for real Session
              ----------------------------------------------*/

              $http
              .post('api://users/login',
              {
                email: username,
                password: password
              },
              { params: {include: 'user'} }
            )
            .success(function(data) {
              service.setSession(data);
              callback({
                success: true
              });
            })
            .error(function(data, status) {
              switch (status) {
                case 401:
                callback({
                  success: false,
                  message: 'Email or Password is incorrect.'
                });
                break;
                case 400:
                callback({
                  success: false,
                  message: 'Please enter Email & Password.'
                });
                break;
                case 403:
                callback({
                  success: false,
                  message: 'Your account is Inactive, Please contact Administrator.'
                });
                break;
                default:
                callback({
                  success: false,
                  message: 'Something went wrong.'
                });
              }
            });


          } else{
            // console.log('username');

            // Bypass Auth
            if( $rootScope.config.bypassAuth && $rootScope.config.dummyUsers && $rootScope.config.dummyUsers[ username ] && $rootScope.config.dummyUsers[ username ].password === password ){
              this.setSession( { user : $rootScope.config.dummyUsers[ username ], userId : username, id : 'SESSION_ID' } );
              callback({ success:true });
              return;
            }
            if($rootScope.config.bypassAuth){
              callback({ success:false, message: 'Username or Password is incorrect.' });
              return;
            }
            /* Use this for real Session
            ----------------------------------------------*/

            $http
            .post('api://users/login',
            {
              username: username,
              password: password
            },
            { params: {include: 'user'} }
          )
          .success(function(data) {
            service.setSession(data);
            callback({
              success: true
            });
          })
          .error(function(data, status) {
            switch (status) {
              case 401:
              callback({
                success: false,
                message: 'Username or Password is incorrect.'
              });
              break;
              case 400:
              callback({
                success: false,
                message: 'Please enter Username & Password.'
              });
              break;
              case 403:
              callback({
                success: false,
                message: 'Your account is Inactive, Please contact Administrator.'
              });
              break;
              default:
              callback({
                success: false,
                message: 'Something went wrong.'
              });
            }
          });
        }
      };

      service.logout = function (callback) {

        // Bypass Auth
        if( $rootScope.config.bypassAuth ){
          service.clearSession();
          callback();
          return;
        }


        /* Use this for real Session
        ----------------------------------------------*/
        $http
        .post('api://users/logout', { access_token : $rootScope[sessionVar].id })
        .success(function() {
          service.clearSession();
          callback();
        })
        .error(function() {
          service.clearSession();
          callback();
        });
        service.clearSession();
      };

      service.isLoggedin = function(){
        return Boolean( ($rootScope[sessionVar] && $rootScope[sessionVar].id) );
      };

      service.getSettings = function(){
        var me = this;
        if( !me.isLoggedin() ){
          return {};
        }
        return me.getData('user').settings || {};
      }

      service.getSetting = function(key, def){
        var me = this;
        return (me.getSettings())[key] || def;
      }

      service.updateSetting = function(key, value, callback){
        var me = this;
        if( me.isLoggedin() ){
          // var settings;
          var settings = me.getSettings();
          // settings.push()
          settings[ key ] = value;

          $http
          .put('api://users/' + me.getCurrentUserId(), { settings: settings })
          .success(function() {
            callback && callback();
          })
          .error(function() {
            callback && callback();
          });

          service.updateSession();

        }
      }

      service.isCapableOf = function(cap){
        var capabilities = ( this.getData('user') && this.getData('user').capabilities ) || [];
        return capabilities.indexOf(cap) > -1;
      };

      service.loadSession = function(){
        this.setSession( $cookieStore.get(sessionVar) );
      };

      service.updateSession = function(){
        service.setSession($rootScope.currentUser);
      }

      service.setSession = function(data) {
        if( data && data.id ){
          $rootScope.currentUser = data;
          if( $rootScope.currentUser
            && $rootScope.currentUser.user
            && $rootScope.currentUser.user.capabilities
            && !_.contains($rootScope.currentUser.user.capabilities, '$authenticated')
          ){
            $rootScope.currentUser.user.capabilities.push('$authenticated');
          }
          $rootScope[sessionVar] = $rootScope.currentUser;
          $rootScope.isUserLoggedin = true;
          $cookieStore.put(sessionVar, $rootScope.currentUser);
          $http.defaults.headers.common['Authorization'] = $rootScope[sessionVar].id; // jshint ignore:line
        } else {
          this.clearSession();
        }
      };

      service.clearSession = function () {
        $rootScope[sessionVar] = null;
        $rootScope.isUserLoggedin = false;
        $rootScope.currentUser = null;
        $cookieStore.remove(sessionVar);
        var cookies = $cookies.getAll();
        angular.forEach(cookies, function (v, k) {
          if( k.startsWith('_' + $rootScope.config.prefix) ){
            $cookies.remove(k);
          }
        });
        $http.defaults.headers.common.Authorization = null;
      };

      service.getData = function( v ) {
        if( $rootScope[sessionVar] && $rootScope[sessionVar][ v ] ){
          return $rootScope[sessionVar][ v ];
        }
        return null;
      };

      service.getCurrentUserId = function() {
        return this.getData('userId');
      };

      return service;
    }]);
  }());
