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
  $locationProvider.html5Mode(false); // messes with crossbar.io
  $httpProvider.interceptors.push('AuthInterceptor', 'HttpNormalizer');
  $uibTooltipProvider.options({
    popupDelay: 500
  });
});
