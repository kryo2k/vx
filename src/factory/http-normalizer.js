angular.module('coordinate-vx')
.factory('HttpNormalizer', function ($q, $rootScope, ErrorBadToken, ErrorAlert, ErrorValidation) {
  return {
    response: function (response) {

      var data = response.data;

      if(angular.isString(data) || !data.success) { // ignore strings of data (html) or anything without a .success = true
        return response;
      }

      // get rid of outer object wrapper
      response.data = data.data;

      return response;
    },

    responseError: function (response) {
      if(!response) return $q.reject(response);

      var
      status = response.status,
      data = response.data||{},
      message = data.hasOwnProperty('message') ? data.message : null,
      result = data;

      switch(status) {
        case 500: // server exception message
        result = new ErrorAlert(message||'Unspecified error', 'Server Exception');
        break;
        case 400: // bad input message
        result = new ErrorAlert(message||'Unspecified error', 'Input Error');
        break;

        case 401: // bad token error, should be handled downstream
        result = new ErrorBadToken(message);
        break;

        case 406: // mongo validation error
        result = new ErrorValidation(message, data.errors);
        break;
      }

      if(ErrorAlert.is(result) || (ErrorValidation.is(result) && message)) { // notify any rootscope listeners
        $rootScope.$broadcast('$systemError', result);
      }

      // trickle error downstream
      return $q.reject(result);
    }
  };
});