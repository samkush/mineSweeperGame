(function () {
  'use strict';

  angular.module('FragmentFooter', [])
  .controller('footer',[function() {
  }])
  .directive('footerDirective', function() {
    return {
      restrict: 'C',
      templateUrl: 'scripts/fragments/footer/view/footer.html'
    };
  });

}());
