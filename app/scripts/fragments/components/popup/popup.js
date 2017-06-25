(function () {
	'use strict';
	angular.module('Components')
	.directive('drillPicker', ['$timeout', '$compile', '$interpolate', '$parse', function($timeout, $compile, $interpolate, $parse){
		return {
			restrict: 'C',
			scope: {
		//		drillData: '=',
			//	callback: '&'
			},
			replace: false,
			link: function(s, e, a) {

				// function set_content(){
				// 	if($(e).data('bs.popover')){
				// 		$(e).data('bs.popover').options.content = drill_types[s.drillData.drill_type]();
				// 	} else {
				// 		$(e).popover("destroy");
				// 	}
				// }
				//
				// s.$watch('drillData', function(val){
				// 	set_content();
				// }, true);
				//
				// var drill_types = {
				// 	date: function(){
				// 		var op = $('<div>')
				// 		var list = $('<ul>').addClass('col-list');
				//
				// 		var sub_scope = s.$new(true);
				// 		switch (s.drillData.next_freq) {
				// 			case 'M':
				// 				list.append( '<li class="grid-view-li col-md-3" ng-repeat="m in months track by $index" ng-click="cb(m)">{{m|date: "MMM"}}</li>' );
				//
				// 				sub_scope.cb = function(m){
				// 					s.drillData.date = m;
				// 					s.callback();
				// 				 	$('.popover').popover('hide');
				// 				};
				//
				// 				var _tmp_date = moment(s.drillData.date);
				// 				sub_scope.months = [];
				//
				// 				_(12).times(function(){
				// 					sub_scope.months.push(angular.copy(_tmp_date.toDate()));
				// 					_tmp_date.add(1, 'M');
				// 				});
				//
				// 				list.addClass('M');
				//
				// 				op.append(list);
				//
				// 				return $compile(op.html())(sub_scope);
				// 			break;
				// 			case 'D':
				// 				list.append( '<li class="grid-view-li col-md-2"  ng-repeat="m in months track by $index" ng-click="cb(m)">{{m|date : "dd"}}</li>' );
				//
				// 				sub_scope.cb = function(m){
				// 				  s.drillData.date = m;
				// 				  s.callback();
				// 			  	$('.popover').popover('hide');
				// 				};
				//
				// 				var _tmp_date = moment(s.drillData.date);
				// 				sub_scope.months = [];
				//
				// 				_(_tmp_date.daysInMonth()).times(function(){
				// 				  sub_scope.months.push(angular.copy(_tmp_date.toDate()));
				// 				  _tmp_date.add(1, 'days');
				// 				});
				//
				// 				list.addClass('M');
				//
				// 				op.append(list);
				//
				// 				return $compile(op.html())(sub_scope);
				// 			break;
				// 		}
				//
				// 	}
				// }

				$timeout(function(){
					e.popover({
				    content: function() {
				      return $("#popover-content").html();
				    },
						placement: 'auto bottom',
						trigger: 'manual',
						html: true,
						viewport: 'body'
						// viewport: '.content'
					})
					.on('show.bs.popover', function(e){
						var $e = $(e.target);
						$e.addClass('shown');
					})
					.on('hide.bs.popover', function(e){
						var $e = $(e.target);
						$e.removeClass('shown');
					});

				}, 0);

				//  to toggle between popover hide and show

				$('.drill-picker').unbind('click').click(function(event){
					var $this = $(this);
					if(!$this.hasClass('shown')){
						$('.drill-picker.shown').popover('hide');
					}
					$this.popover('toggle');
					event.stopPropagation();
				});
				//
				// $(window).unbind('click').click(function() {
				// 	$('.drill-picker.shown').popover('hide');
				// });

				// s.$on('$destroy',function() {
				// 	$timeout.cancel();
				// 	e.remove();
				// });

			}
		};
	}]);
}());
