(function () {
  'use strict';
  angular.module('ManageMeasure')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/manage-measure/add', {
      templateUrl: 'scripts/pages/manage/manage-measure/view/add.html',
      controller: 'manageMeasureAddController'
    })
  })
  .controller('manageMeasureAddController',[
    '$scope',
    '$rootScope',
    '$location',
    'Util',
    'measureService',
    function ($scope, $rootScope, $location, Util, measureService) {
      $scope.pageTitle = "ADD Measure";
      $rootScope.setPageTitle( 'Add Measure' );
      $scope.loading = false;
      $scope.compulsoryField = '*';
      $scope.formScope = '';
      $scope.statuses = {
        submitting : false,
        saved : false,
        error : false
      };
      var defaultMeasure = {
        name : '',
        status: 'active',
        type: 'static',
        calculate: '',
        dataPoint: '',
        dependencies: [],
        tags : [],
        frequencies : ['M'],
      };
      $scope.measure = angular.copy(defaultMeasure);
      $scope.form = {};
      $scope.setFormScope= function(scope){
        $scope.formScope = scope;
      }
      $scope.status = {
        multiple: false,
        options : [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' }
        ]
      };

      $scope.frequencies = {
        multiple: true,
        singleSelected: true,
        options : [
          { label: 'D', value: 'D', title: 'Daily' },
          { label: 'W', value: 'W', title: 'Weeklay' },
          { label: 'M', value: 'M', title: 'Monthly' }
        ]
      };

      $scope.type = {
        multiple: false,
        options : [
          { label: 'Static', value: 'static' },
          { label: 'Calculated', value: 'calculated' }
        ]
      };

      $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        theme:'twilight',
        value: '',
        mode: 'Javascript',
      };

      $scope.measureSelectizeConfig = {
        options: [],
        plugins: ['remove_button'],
        create: false,
        sortField: 'text',
        valueField: 'measure_id',
        labelField: 'name',
        searchField: ['name', 'measure_id'],
        placeholder: 'Enter a Measure',
        preload: true,
        render: {
          item: function(item, escape) {
            return '<div>' +
            (item.name ? '<span class="name"> ' + escape(item.name) + '</span>' : '') +
            (item.oldId ? '<span class="oldId"> ' + escape(item.measure_id) + '</span>' : '') +
            '</div>';
          },
          option: function(item, escape) {
            var label = item.name || item.measure_id;
            var caption = item.name ? item.measure_id : null;
            return '<div>' +
            '<span class="name">' + escape(label) + ' </span>' +
            (caption ? '<span class="caption">' + escape(caption) + '</span>' : '') +
            '</div>';
          }
        },
        load: function(query, callback) {
          if (!query.length){ return callback(); }
          _.debounce((function() {
            var filter = {
              where : {
                or : [
                  {
                    'name' : { like : query, options: 'i'}
                  },
                  {
                    'measure_id' : { like : query, options: 'i'}
                  }
                ]
              },
              limit: 10
            }
            filter.fields = [ 'name' , 'measure_id'];
            measureService
            .get(filter)
            .then( function(res){
              if(res.length){
                $scope.measureSelectizeConfig.options = _.union($scope.measureSelectizeConfig.options, res);
              }
            });
          }()), 10);
        }
      };

      $scope.$watch('measure.type', function(measureType){
        if(measureType === 'static'){
          $scope.measure.dependencies = [];
          $scope.measure.calculate = '';
        }
      });


      $scope.onSubmit = function(){
        $scope.form.measure_id.$setValidity('uniqueness', true);

        if( !$scope.form.$valid ){
          return;
        }

        $scope.statuses.saved = false;
        $scope.statuses.submitting = true;
        $scope.statuses.error = false;

        $scope.measure.tags.push($scope.measure.status);

        var data = Util.pluckOnly($scope.measure, [
          'name',
          'frequencies',
          'status',
          'type',
          'calculate',
          'dependencies',
          'measure_id',
          'dataPoint',
          'condition',
          'tags'
        ]);

        measureService
        .addMeasure(data)
        .then(function() {
          $scope.loading = false;
          $scope.statuses.submitting = false;
          $scope.statuses.saved = true;
          $scope.measure = angular.copy(defaultMeasure);
          $location.path('/manage-measure');
        }, function(reason) {
          console.log( 'Something went wrong' ,reason );
          $scope.loading = false;
          $scope.statuses.submitting = false;
          $scope.statuses.saved = false;
          $scope.statuses.error = true;
          if( reason && reason.error && reason.error.details && reason.error.details.codes ){
            if( reason.error.details.codes.email && reason.error.details.codes.email.length && reason.error.details.codes.email.shift() === 'uniqueness' ){
              $scope.form.measure_id.$setValidity('uniqueness', false);
            }
          }
        });

      };
    }
  ])

}());
