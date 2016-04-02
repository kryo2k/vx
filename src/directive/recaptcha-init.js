angular.module('vx')
.directive('recaptchaInit', function (RECAPTCHA_SITEKEY) {
  return {
    restrict: 'EA',
    replace: true,
    template: '<div vc-recaptcha key="recaptchaSiteKey"></div>',
    link: function (scope) {
      Object.defineProperty(scope, 'recaptchaSiteKey', { get: function () {
        return RECAPTCHA_SITEKEY;
      } });
    }
  };
});
