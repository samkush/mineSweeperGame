(function () {
	'use strict';
	angular.module('Pages', [
		'Auth',
		'Services',
		'Manage',
		'Reports',
		'FileUpload',
		'ServerStatusModule'
	])
	.config(function($routeProvider){
		$routeProvider
			.when('/', {
				redirectTo: '/reports/mine-sweeper'
			});
	});


}());
