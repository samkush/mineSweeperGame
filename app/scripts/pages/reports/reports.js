(function () {
	'use strict';
	angular.module('Reports', [
		'Auth',
		'Mine-Sweeper'
	])
	.config(function($routeProvider){
		$routeProvider
			.when('/', {
				redirectTo: '/reports/mine-sweeper'
			});
	});


}());
