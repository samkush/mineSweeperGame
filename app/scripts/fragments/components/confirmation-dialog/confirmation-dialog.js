(function () {
   'use strict';
   angular.module('Components')
   .controller('ModalInstanceCtrl', function ($scope, $modalInstance, modalData, $compile, $parse, $interpolate, $sce) {
     $scope.modalData = modalData;
     $scope.ok = function () {
       $modalInstance.close($scope.modalData);
     };
     if( $scope.modalData.hasTextField ){
       $scope.modalData.type = $scope.modalData.type || 'text';
     }
     if( $scope.modalData.hasImageEmoji ){
        $scope.modalData.type = $scope.modalData.type || 'image';
     }
     if( $scope.modalData.hasImageEmojiSmile ){
        $scope.modalData.type = $scope.modalData.type || 'image';
     }
     $scope.trustAsHtml = function(html) {
       return $sce.trustAsHtml(html);
     };
     $scope.cancel = function () {
       $modalInstance.dismiss('cancel');
     };


     $scope.modalData.body = $scope.trustAsHtml( $interpolate($scope.modalData.body)($scope) );
      $compile($scope.modalData.body)($scope);

   });
}());
