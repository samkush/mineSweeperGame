(function () {
  'use strict';

  angular.module('FragmentHeader', [])

  .controller('Header', [
    '$rootScope',
    '$scope',
    '$location',
    'Session',
    'filterService',
    function(
      $rootScope,
      $scope,
      $location,
      Session,
      filterService,
    ) {
      $scope.session = Session;
      var filter = {
        'order': 'last_run DESC',
        'fields': {
          'last_run':1
        }
      }


      $rootScope.$watch('isUserLoggedin', function(){
        $scope.menu = [];
        if( $rootScope.currentUser ) {
          $scope.path = $location.path();
          if($scope.path !=='/change-password') {
            $scope.menu.push( { url : '#/', label : 'Mine Sweeper', class : 'mine-sweeper' } );

          }
        }
      }, true);

    }
  ])

  .directive('header', function() {
    return {
      restrict: 'E',
      templateUrl: 'scripts/fragments/header/views/header.html',
      link: function(s, e, a){
        s = s;
        a = a;
        var navMain = e.find('.nav-main');
        navMain.on('click', '.anchorNav', null, function () {
          navMain.collapse('hide');
        });

        $(document).on('click','.navbar-collapse.in',function(e) {
          if( $(e.target).is('a') && ( $(e.target).attr('class') !== 'dropdown-toggle' ) ) {
            $(this).collapse('hide');
          }
        });

        navMain.on('click', '.login-anchor', null, function () {
          var $loginPage = $('.login-section');
          $loginPage.toggleClass('show', !$loginPage.hasClass('show'));
        });

      }
    };
  });
}());
