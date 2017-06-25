(function () {
  'use strict';
  angular.module('Mine-Sweeper', [])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/reports/mine-sweeper', {
        templateUrl: 'scripts/pages/reports/mine-sweeper/view/listing.html',
        controller: 'mineSweeperListingController',
        containerClass: 'mine-sweeper',
        reloadOnSearch: false,
        resolve: {


    }
      })
      .when('/', {
        templateUrl: 'scripts/pages/reports/mine-sweeper/view/listing.html',
        controller: 'mineSweeperListingController',
        containerClass: 'mine-sweeper',
        reloadOnSearch: false
      })
    })
    .controller('mineSweeperListingController',[
      '$scope',
      '$rootScope',
      '$location',
      '$cookieStore',
      '$base64',
      'Util',
      'Session',
      '$modal',
      '$uibModal',
      function (
        $scope,
        $rootScope,
        $location,
        $cookieStore,
        $base64,
        Util,
        Session,
        $modal,
        $uibModal
      ) {
        $rootScope.setPageTitle( 'MineSweeper' );


        $scope.expectedMinesPlace = spreadMines();
        $scope.placeDetection = function(place) {
            place.isPlaceFilled = false;

            if(place.content == "mine") {
                $scope.hasLostMessageVisible = true;
                     var modalInstance = $uibModal.open({
                       animation: "slide-from-top",
                       templateUrl: 'scripts/fragments/components/confirmation-dialog/view/confirmation-dialog.html',
                       controller: 'ModalInstanceCtrl',
                       backdrop: 'static',
                       keyboard: false,
                       size: 'sm',
                       resolve: {
                         modalData: function () {
                           return {
                             title: 'ooops! you lost!',
                             body: '',
                             hasImageEmoji: true,
                             type: 'image',
                             positiveBtn: 'Save',
                             negativeBtn: 'Cancel'
                           };
                         }
                       }
                     });
                     modalInstance.result.then(function (res) {

                     },function(err){
                         $scope.loading = false;

                     });

            } else {
                if(hasWon($scope.expectedMinesPlace)) {
                    $scope.isWinMessageVisible = true;
                    var modalInstance = $uibModal.open({
                      animation: "slide-from-top",
                      templateUrl: 'scripts/fragments/components/confirmation-dialog/view/confirmation-dialog.html',
                      controller: 'ModalInstanceCtrl',
                      backdrop: 'static',
                      keyboard: false,
                      size: 'sm',
                      resolve: {
                        modalData: function () {
                          return {
                            title: 'congratulations you won!',
                            body: '',
                            hasImageEmojiSmile: true,
                            type: 'image',
                            positiveBtn: 'Save',
                            negativeBtn: 'Cancel'
                          };
                        }
                      }
                    });
                    modalInstance.result.then(function (res) {

                    },function(err){
                        $scope.loading = false;

                    });

                }
            }
        };


          function spreadMines() {
            var expectedMinesPlace = {};
            expectedMinesPlace.rows = [];

            for(var i = 0; i < 9; i++) {
                var row = {};
                row.places = [];

                for(var j = 0; j < 9; j++) {
                    var place = {};
                    place.isPlaceFilled = true;
                    place.content = "empty";
                    row.places.push(place);
                }

                expectedMinesPlace.rows.push(row);
            }

            placeManyRandomMines(expectedMinesPlace);
            calculateAllNumbers(expectedMinesPlace);

            return expectedMinesPlace;
          }

          function getplace(expectedMinesPlace, row, column) {
            return expectedMinesPlace.rows[row].places[column];
          }

          function placeRandomMine(expectedMinesPlace) {
            var row = Math.round(Math.random() * 8);
            var column = Math.round(Math.random() * 8);
            var place = getplace(expectedMinesPlace, row, column);
            place.content = "mine";
          }

          function placeManyRandomMines(expectedMinesPlace) {
            for(var i = 0; i < 10; i++) {
                placeRandomMine(expectedMinesPlace);
            }
          }

          function calculateNumber(expectedMinesPlace, row, column) {
            var thisplace = getplace(expectedMinesPlace, row, column);

            // if this place contains a mine then we can't place a number here
            if(thisplace.content == "mine") {
                return;
            }

            var mineCount = 0;

            // check row above if this is not the first row
            if(row > 0) {
                // check column to the left if this is not the first column
                if(column > 0) {
                    // get the place above and to the left
                    var place = getplace(expectedMinesPlace, row - 1, column - 1);
                    if(place.content == "mine") {
                        mineCount++;
                    }
                }

                // get the place right above
                var place = getplace(expectedMinesPlace, row - 1, column);
                if(place.content == "mine") {
                    mineCount++;
                }

                // check column to the right if this is not the last column
                if(column < 8) {
                    // get the place above and to the right
                    var place = getplace(expectedMinesPlace, row - 1, column + 1);
                    if(place.content == "mine") {
                        mineCount++;
                    }
                }
            }

            // check column to the left if this is not the first column
            if(column > 0) {
                // get the place to the left
                var place = getplace(expectedMinesPlace, row, column - 1);
                if(place.content == "mine") {
                    mineCount++;
                }
            }

            // check column to the right if this is not the last column
            if(column < 8) {
                // get the place to the right
                var place = getplace(expectedMinesPlace, row, column + 1);
                if(place.content == "mine") {
                    mineCount++;
                }
            }

            // check row below if this is not the last row
            if(row < 8) {
                // check column to the left if this is not the first column
                if(column > 0) {
                    // get the place below and to the left
                    var place = getplace(expectedMinesPlace, row + 1, column - 1);
                    if(place.content == "mine") {
                        mineCount++;
                    }
                }

                // get the place right below
                var place = getplace(expectedMinesPlace, row + 1, column);
                if(place.content == "mine") {
                    mineCount++;
                }

                // check column to the right if this is not the last column
                if(column < 8) {
                    // get the place below and to the right
                    var place = getplace(expectedMinesPlace, row + 1, column + 1);
                    if(place.content == "mine") {
                        mineCount++;
                    }
                }
            }

            if(mineCount > 0) {
                thisplace.content = mineCount;
            }
          }

          function calculateAllNumbers(expectedMinesPlace) {
            for(var y = 0; y < 9; y++) {
                for(var x = 0; x < 9; x++) {
                    calculateNumber(expectedMinesPlace, y, x);
                }
            }
          }

          function hasWon(expectedMinesPlace) {
            for(var y = 0; y < 9; y++) {
                for(var x = 0; x < 9; x++) {
                    var place = getplace(expectedMinesPlace, y, x);
                    if(place.isPlaceFilled && place.content != "mine") {
                        return false;
                    }
                }
            }

            return true;
          }



            }


    ]);
  }());
