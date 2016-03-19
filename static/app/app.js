angular.module('coordinate-vx', [
  'coordinate-vx.constants',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngDate',
  'ui.router',
  'ui.bootstrap'
])
.config(function ($urlRouterProvider, $locationProvider, $httpProvider, $uibTooltipProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(true);
  $httpProvider.interceptors.push('AuthInterceptor', 'HttpNormalizer');
  $uibTooltipProvider.options({
    popupDelay: 500
  });
});