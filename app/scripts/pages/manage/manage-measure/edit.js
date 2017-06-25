(function () {
  'use strict';
  angular.module('ManageMeasure')
  .config(function ($routeProvider) {
    $routeProvider
    .when('/manage-measure/edit/:id', {
      templateUrl: 'scripts/pages/manage/manage-measure/view/edit.html',
      controller: 'manageMeasureEditController',
      resolve: {
        measureData: function(measureService, $route){
          return measureService.getMeasure($route.current.params.id);
        }
      }
    })
  })
  .controller('manageMeasureEditController',[
    '$scope',
    '$rootScope',
    '$location',
    '$routeParams',
    'Util',
    'measureData',
    'measureService',
    function ($scope, $rootScope, $location, $routeParams, Util, measureData, measureService) {
      $scope.pageTitle = "EDIT MEASURE";
      $scope.compulsoryField = '*';
      $rootScope.setPageTitle( 'Edit Measure' );
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
        dependencies: [],
        tags : [],
        dataPoint : '',
        frequencies : ['M'],
      };
      $scope.measure = angular.copy(defaultMeasure);
      $scope.form = {};
      $scope.setFormScope= function(scope){
        $scope.formScope = scope;
      }

      var lastStatus = '';

      if(measureData){
        angular.extend($scope.measure, measureData);

        if( _.contains( $scope.measure.tags, 'active' ) ){
          lastStatus = 'active';
          $scope.measure.status = 'active';
        }else{
          lastStatus = 'inactive';
          $scope.measure.status = 'inactive';
        }
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

        if( lastStatus === 'inactive' && $scope.measure.status === 'active') {
          $scope.measure.tags.push('user_inactive_to_active');
          $scope.measure.tags =  _.without( $scope.measure.tags, 'inactive');
          $scope.measure.tags =  _.without( $scope.measure.tags, 'active');
          $scope.measure.tags.push('active');
          lastStatus = 'active';
        }else if(lastStatus === 'active' && $scope.measure.status === 'inactive'){
          $scope.measure.tags =  _.without( $scope.measure.tags, 'inactive');
          $scope.measure.tags =  _.without( $scope.measure.tags, 'active');
          $scope.measure.tags.push('inactive');
          lastStatus = 'inactive';
        }

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
        .editMeasure($routeParams.id, data)
        .then(function() {
          $scope.statuses.submitting = false;
          $scope.statuses.saved = true;
          $location.path('/manage-measure');
        }, function(reason) {
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
