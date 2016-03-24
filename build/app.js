angular.module('coordinate-vx.constants', [])
.constant('API', '/api')
.constant('WAMP_URL', (document.location.protocol === 'http:' ? 'ws:' : 'wss:') + '//' + document.location.host + '/ws')
.constant('WAMP_REALM', 'realm1')
.constant('DURATION_SHORT', {
  precise:      false,
  week:         'w',
  weeks:        'wks',
  day:          'day',
  days:         'days',
  hour:         'hr',
  hours:        'hrs',
  minute:       'min',
  minutes:      'mins',
  second:       'sec',
  seconds:      'secs',
  millisecond:  'ms',
  milliseconds: 'ms',
});

angular.module('coordinate-vx', [
  'coordinate-vx.constants',
  'coordinate-vx.tpl',
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'ngDate',
  'ui.router',
  'ui.bootstrap',
  'vxWamp'
])
.config(["$urlRouterProvider", "$locationProvider", "$httpProvider", "$uibTooltipProvider", function ($urlRouterProvider, $locationProvider, $httpProvider, $uibTooltipProvider) {
  $urlRouterProvider.otherwise('/');
  $locationProvider.html5Mode(false); // messes with crossbar.io
  $httpProvider.interceptors.push('AuthInterceptor', 'HttpNormalizer');
  $uibTooltipProvider.options({
    popupDelay: 500
  });
}]);

angular.module('coordinate-vx')
.filter('ellipsis', function () {
  return function (str, lenStart, lenEnd, threshold, ellip) {
    var
    lenEllip = 0,
    lenInter = 0,
    lenStr = 0;

    if(!str) { return ''; }
    if(!angular.isString(str)) {
      str = String(str);
    }

    lenStr    = str.length;
    ellip     = angular.isString(ellip) ? ellip : '...';
    lenEllip  = ellip.length;
    lenStart  = (!angular.isNumber(lenStart) || lenStart  < 0) ? 5 : lenStart;
    lenEnd    = (!angular.isNumber(lenEnd)   || lenEnd    < 0) ? 5 : lenEnd;
    lenInter  =  (lenStart + lenEnd + lenEllip);
    threshold = (!angular.isNumber(threshold) || threshold < lenInter)
      ? lenInter : threshold;

    return (lenStr < threshold)
      ? str
      : str.substring(0, lenStart) + ellip + str.substring(lenStr - lenEnd, lenStr);
  };
});

angular.module('coordinate-vx')
.directive( 'autobahnControl', function () {
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    templateUrl: 'directive/autobahn-control.html',
    controller: ["$scope", "User", function ($scope, User) {
      $scope.inputTest = function () {
        return User.input({ test: true }).$promise
          .then(function(response) {
            console.log('HTTP response from input test:', response);
            return response;
          });
      };
    }]
  };
});

angular.module('coordinate-vx')
.directive( 'autobahn', function () {
  return {
    restrict: 'EA',
    controller: 'AutobahnCtrl as $autobahn'
  };
})
.controller('AutobahnCtrl', ["$scope", "$wamp", "$realTime", function ($scope, $wamp, $realTime) {
  this.wamp = $wamp;
  this.realTime = $realTime;

  Object.defineProperties(this, {
    connection: {
      get: function () {
        return $wamp.connection;
      }
    },
    connectionInfo: {
      get: function () {
        var sess = this.session;

        if(!sess || !sess._socket || !sess._socket.info) {
          return false;
        }

        return sess._socket.info;
      }
    },
    log: {
      get: function () {
        return $realTime.log;
      }
    },
    session: {
      get: function () {
        var connection = this.connection;

        if(!connection || !connection.session) {
          return false;
        }

        return connection.session;
      }
    },
    connected: {
      get: function () {
        return !!this.session;
      }
    }
  });
}]);

angular.module('coordinate-vx')
.directive( 'formGroup', function () {
  return {
    restrict: 'C',
    require: '^form',
    link: function (scope, el, attr, form) {
      if(!form) return;

      var
      clsError   = 'has-error',
      clsSuccess = 'has-success',
      rEl = el[0],
      // get names of child inputs models (exclude inputs without names)
      names = Array.prototype.slice.call(rEl.querySelectorAll('[ng-model]')).reduce(function (p, e) {
        var name = angular.element(e).attr('name');
        if(name) p.push(name);
        return p;
      }, []);

      if(!names.length) { // nothing to watch
        return;
      }

      scope.$watch(function () {
        return names.every(function (name) {
          var formModel = form[name];
          if(!formModel) {
            return true;
          }

          return formModel.$valid;
        });
      }, function(valid) {
        if(valid) {
          el.removeClass(clsError);
          el.addClass(clsSuccess);
        }
        else {
          el.addClass(clsError);
          el.removeClass(clsSuccess);
        }
      });
    }
  };
});
angular.module('coordinate-vx')
.directive( 'formInput', ["$parse", function ($parse) {
  var id = 'formInput';

  return {
    restrict: 'A',
    require: [id,'^form'],
    controller: 'FormInputCtrl as $formInput',
    link: function (scope, el, attr, ctrl) {
      var
      self = ctrl[0];
      self.form = ctrl[1];

      var parseModel = $parse(attr[id]);

      function bind() {
        var current = parseModel(scope);
        self.reset();

        if(angular.isString(current) && form.hasOwnProperty(current)) {
          self.model = form[current];
        }
        else if(angular.isObject(current) && current.hasOwnProperty('$name')) {
          self.model = current;
        }
      }

      attr.$observe(id, bind);
    }
  };
}])
.controller('FormInputCtrl', function () {
  var
  form = null,
  model = null;

  Object.defineProperties(this, {
    model: {
      get: function () {
        return model;
      },
      set: function (v) {
        model = v||null;
      }
    },
    field: {
      get: function () {
        if(!this.hasModel) return false;
        return this.model.$name;
      }
    },
    form: {
      get: function () { return form; },
      set: function (v) {
        form = v||null;
      }
    },
    hasForm: {
      get: function () {
        return form !== null;
      }
    },
    hasModel: {
      get: function () {
        return model !== null;
      }
    }
  });

  this.reset = function () {
    form = null;
    model = null;
    return this;
  };
});

angular.module('coordinate-vx')
.directive( 'formReset', function () {
  return {
    require: ['formReset','form'],
    scope: {
      reset: '&formReset'
    },
    controller: 'FormResetCtrl',
    link: function (scope, el, attr, ctrls) {
      var self = ctrls[0], form = ctrls[1];

      function notify (event, f) {
        return function () {

          self.notify(f);

          scope.reset({ $event: event, $form: f });

          if(!event.defaultPrevented) {
            form.$setPristine();
          }
        };
      }

      el.bind('reset', function (event) { scope.$apply(notify(event, form)); });
    }
  };
})
.controller('FormResetCtrl', ["$scope", function ($scope) {

  Object.defineProperties(this, {
  });

  this.notify = function (form) {
    $scope.$broadcast('$formReset', form);
    return this;
  }

  this.addListener = function (fn) {
    return $scope.$on('$formReset', fn);
  };
}]);

angular.module('coordinate-vx')
.directive( 'heartBeatControl', function () {
  return {
    restrict: 'EA',
    controller: 'HeartBeatCtrl as $heartBeat',
    templateUrl: 'directive/heart-beat-control.html'
  };
});

angular.module('coordinate-vx')
.directive( 'heartBeatTitle', ["$heartBeat", function ($heartBeat) {
  return {
    require: ['heartBeatTitle', '?HeartBeatCtrl', '?pageTitle'],
    restrict: 'A',
    controller: 'HeartBeatTitleCtrl as $heartBeatTitleCtrl',
    link: function (scope, el, attr, ctrl) {
      var
      self      = ctrl[0],
      heartBeat = ctrl[1]||$heartBeat,
      pageTitle = ctrl[2];

      // link the reference to our controller
      self.element = angular.element(el);

      if(pageTitle) {
        scope.$watch(function () { return pageTitle.title; }, function (current) {
          self.baseTitle = current;
        });
      }

      scope.$watch(function () { return heartBeat.isWarning; }, function (isWarning) {
        isWarning ? self.startAlert() : self.stopAlert();
      });
    }
  };
}])
.controller('HeartBeatTitleCtrl', ["$q", "$scope", "$timeout", "$filter", "RevControl", "$heartBeat", "DURATION_SHORT", function ($q, $scope, $timeout, $filter, RevControl, $heartBeat, DURATION_SHORT) {
  var
  durationFilter = $filter('duration'),
  baseTitle = null,
  separator = ' | ',
  animationPause = 1000;

  Object.defineProperties(this, {
    alertChar: {
      get: function () { return alertChar; },
      set: function (v) {
        if(!angular.isString(v)) return;
        alertChar = v;
      }
    },
    separator: {
      get: function () { return separator; },
      set: function (v) {
        if(!angular.isString(v)) return;
        separator = v;
      }
    },
    baseTitle: {
      get: function () { return baseTitle||''; },
      set: function (v) {
        if(!angular.isString(v)) return;
        baseTitle = v;
      }
    }
  });

  var
  alerting = false,
  stepIndex = 0,
  setTitle = (function (title) {
    if(!this.element) return title;
    this.element.html(title);
    return title;
  }).bind(this),
  currentDuration = function () {
    return durationFilter($heartBeat.ttlMs, DURATION_SHORT);
  },
  steps = [
    function (ltitle, next) { next( currentDuration() + this.separator + this.baseTitle); }
  ],
  loop = (function () {
    if(!alerting || !this.element) return;

    var
    me = this,
    promise = steps.reduce(function (promise, step) {
      return promise.then(function (lastTitle) {
        if(!alerting) return promise; // cancel alerting
        var defer = $q.defer();
        step.call(me, lastTitle, defer.resolve.bind(defer));
        return defer.promise.then(setTitle);
      });
    }, $q.when(me.baseTitle))
    .finally(function () {
      $timeout(loop, animationPause);
    });

    return promise;
  }).bind(this);

  this.startAlert = function () {
    alerting = true;
    loop();
  };
  this.stopAlert = function () {
    alerting = false;
    setTitle(this.baseTitle);
  };
}]);

angular.module('coordinate-vx')
.directive( 'heartBeatTouchzone', ["$window", "$debounce", "$heartBeat", function ($window, $debounce, $heartBeat) {
  return {
    require: '?heartBeat',
    restrict: 'AC',
    link: function (scope, el, attr, ctrl) {
      var
      sensitivity = 0.7, debounceMs = 50,
      lastX = null, lastY = null,
      touch = function () {
        if(ctrl) { // touch thru optional controller
          return ctrl.touch();
        }

        return $heartBeat.touch();
      },
      clickDetect = function () { touchDeb(); },
      moveDetect = function (event) {
        var
        curX = event.clientX,
        curY = event.clientY;

        if(lastX === null) lastX = curX;
        if(lastY === null) lastY = curY;

        var
        el0 = el[0],
        dX = Math.pow(lastX - curX, 2),
        dY = Math.pow(lastY - curY, 2),
        strength = Math.sqrt(dX + dY) / Math.min(el0.offsetWidth, el0.offsetHeight),
        strengthTest = (strength >= (1 - sensitivity));

        // update position
        lastX = curX;
        lastY = curY;

        if(strengthTest) {
          touchDeb();
        }
      },
      touchDeb = $debounce(touch, debounceMs, true),
      moveDetDeb = $debounce(moveDetect, debounceMs, true);

      attr.$observe('zoneSensitivity', function (val) {
        var pct = parseFloat(val, 10);
        if(!angular.isNumber(pct) || isNaN(pct) || !isFinite(val)) return;
        sensitivity = pct;
      });

      attr.$observe('debounceDelay', function (val) {
        var num = parseInt(val, 10);
        if(!angular.isNumber(num) || isNaN(num) || !isFinite(val)) return;
        debounceMs = num;
        touchDeb = $debounce(touch, num, true);
        moveDetDeb = $debounce(moveDetect, num, true);
      });

      // listen for these events as input:
      angular.element(el).bind('mousemove', moveDetDeb);
      angular.element(el).bind('touchmove', moveDetDeb);
      angular.element(el).bind('click',      clickDetect);
      angular.element(el).bind('touchstart', clickDetect);
    }
  };
}]);

angular.module('coordinate-vx')
.directive( 'heartBeat', function () {
  return {
    restrict: 'EA',
    controller: 'HeartBeatCtrl as $heartBeat'
  };
})
.controller('HeartBeatCtrl', ["$scope", "$heartBeat", "DURATION_SHORT", function ($scope, $heartBeat, DURATION_SHORT) {
  this.service = $heartBeat;

  $scope.durationOpts = angular.extend({}, DURATION_SHORT, {
    inputAsSec:   true
  });

  Object.defineProperties(this, {
    isActive: {
      get: function () { return $heartBeat.running && $heartBeat.ttl > 0; }
    },
    isWarning: {
      get: function () { return $heartBeat.isWarning; }
    },
    isIdle: {
      get: function () { return $heartBeat.isIdle; }
    }
  });

  this.touch = $heartBeat.touch.bind($heartBeat);
  this.touchIf = $heartBeat.touchIf.bind($heartBeat);
  this.refresh = $heartBeat.refresh.bind($heartBeat);
  this.extend = $heartBeat.extendAccess.bind($heartBeat);
}]);

angular.module('coordinate-vx')
.directive( 'inputMatch', ["$parse", function ($parse) {
  var id = 'inputMatch';

  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, el, attr, ctrl) {
      var
      watchers = {};

      if(!attr[id]) return;

      var
      match = false,
      validate = function (b) {
        if(!angular.isFunction(match)) {
          return false;
        }

        var a = match(scope);

        return ctrl.$isEmpty(a) || a === b;
      };

      ctrl.$validators.match = function (modelValue, viewValue) {
        return validate(viewValue);
      };

      var lwatcher = null;

      attr.$observe(id, function (toEqual) {
        match = $parse(toEqual);

        if(lwatcher) lwatcher();

        // watch for changes on model we're supposed to match
        lwatcher = scope.$watch(toEqual, ctrl.$validate.bind(ctrl));
      });
    }
  };
}]);

angular.module('coordinate-vx')
.directive('navigation', function () {
  return {
    replace: true,
    transclude: true,
    controller: 'NavigationCtrl as $navigation',
    templateUrl: 'directive/navigation.html'
  };
})
.controller('NavigationCtrl', ["$auth", "$scope", "DURATION_SHORT", function ($auth, $scope, DURATION_SHORT) {
  $scope.durationOpts = angular.extend({}, DURATION_SHORT, {
    // precise: true
  });
  this.logout = function (event) {
    $auth.logout();
  };
}]);

angular.module('coordinate-vx')
.directive('pageHeader', function () {
  return {
    replace: true,
    transclude: true,
    controller: 'PageHeaderCtrl',
    templateUrl: 'directive/page-header.html',
    scope: {
      title: '=phTitle',
      description: '=phDescription'
    }
  };
})
.controller('PageHeaderCtrl', ["$scope", function ($scope) {
}]);

angular.module('coordinate-vx')
.directive('pageTitle', ["$state", function ($state) {
  return {
    controller: 'PageTitleCtrl',
    link: function (scope, el, attr, ctrl) {

      ctrl.setTitle(el.html());

      scope.$watch(function () {
        if(!$state.current || !$state.current.data || !$state.current.data.title || $state.current.data.hideTabTitle) {
          return false;
        }

        return $state.current.data.title;
      }, function (title) {
        if(title) {
          ctrl.prepend(title);
        }
        else {
          ctrl.undo();
        }

        el.html(ctrl.title);
      });

      scope.$on('$stateChangeStart', function () {
        ctrl.undo(); // step back one
      });
    }
  };
}])
.controller('PageTitleCtrl', ["$scope", "$state", "RevControl", function ($scope, $state, RevControl) {
  var
  history = new RevControl([], 5),
  baseTitle = null,
  separator = ' - ';

  Object.defineProperties(this, {
    separator: {
      get: function () { return separator; },
      set: function (v) {
        if(!angular.isString(v)) return;
        separator = v;
      }
    },
    baseTitle: {
      get: function () { return baseTitle||''; },
      set: function (v) {
        if(!angular.isString(v)) return;
        baseTitle = v;
      }
    },
    title: {
      get: function () {
        var current = history.current;
        return angular.isString(current) ? current : '';
      }
    }
  });

  this.setTitle = function (title) {
    if(!angular.isString(title)) title = baseTitle;

    if(baseTitle === null) { // set the base title
      baseTitle = title;
    }

    if(angular.isString(title)) {
      history.apply(title);
    }

    // console.log(history.history);
    return this;
  };
  this.append = function (title) {
    return this.setTitle(this.baseTitle + separator + String(title));
  };
  this.prepend = function (title) {
    return this.setTitle(String(title) + separator + this.baseTitle);
  };
  this.undo = history.undo.bind(history);
  this.redo = history.redo.bind(history);
}]);

angular.module('coordinate-vx')
.directive('userNotifications', function () {
  return {
    restrict: 'A',
    transclude: true,
    replace: true,
    templateUrl: 'directive/user-notifications.html',
    controller: 'UserNotificationsCtrl as $notifications'
  };
})
.controller('UserNotificationsCtrl', ["$q", "$scope", "$realTime", "$filter", function ($q, $scope, $realTime, $filter) {
  var filterEllipsis = $filter('ellipsis');

  function subscriptionUpdate(args, meta) {
  //  console.log('PUSH response from input test:', args, meta);
  }

  function subChange(promise) {
    $scope.subscriptionChanging = true;
    return promise
      .finally(function () {
        $scope.subscriptionChanging = false;
      });
  }

  var
  activeSubscription = false;

  this.subscribe = function () {
    if(activeSubscription) {
      return $q.when(activeSubscription);
    }

    return subChange($realTime.subscribeScope($scope, 'vx.user.notifications', subscriptionUpdate))
      .then(function(subscription) {
        activeSubscription = subscription;
        $scope.pushSubscribe = true;
        return activeSubscription;
      });
  };

  this.unsubscribe = function () {
    if(!activeSubscription || !activeSubscription.active) {
      if(activeSubscription) activeSubscription = false; // clean up?
      return $q.when(true);
    }

    return subChange($realTime.unsubscribe(activeSubscription))
      .then(function (res) {
        activeSubscription = false;
        $scope.pushSubscribe = false;
        return true;
      });
  };

  $scope.pushSubscribe = activeSubscription;

  $scope.$watch('pushSubscribe', (function (nv, ov) {
    if(nv === ov||$scope.subscriptionChanging) return;
    nv ? this.subscribe() : this.unsubscribe();
  }).bind(this));

  this.subscribe();
}]);

angular.module('coordinate-vx')
.directive('validationError', function () {
  return {
    restrict: 'E',
    transclude: true,
    require: ['validationError', '^formInput', '^?formReset'],
    templateUrl: 'directive/validation-error.html',
    controller: 'ValidationErrorCtrl as $validation',
    scope: {},
    link: function (scope, el, attr, ctrls) {
      var
      self = ctrls[0],
      input = ctrls[1],
      reset = ctrls[2];

      scope.$formInput = input;

      if(reset) { // clean up dereg on destroy
        scope.$on('$destroy', reset.addListener(self.clear.bind(self)));
      }

      scope.$watch(function () { return input.model; }, function (model) {
        if(!model || model.$validators.hasOwnProperty('validation')) {
          return;
        }

        model.$validators.validation = function () {
          return !self.hasErrors;
        };

        model.$validate();
      });
    }
  };
})
.controller('ValidationErrorCtrl', ["$scope", function ($scope) {
  var flagKey = 'validation';
  Object.defineProperties(this, {
    isString: {
      get: function () {
        return angular.isString(this.errors);
      }
    },
    isArray: {
      get: function () {
        return angular.isArray(this.errors);
      }
    },
    errorFlags: {
      get: function () {
        var input = this.input;
        if(!input || !input.hasModel) return null;
        return input.model.$error||null;
      }
    },
    errors: {
      get: function () {
        var input = this.input;
        if(!input || !input.hasModel) return null;

        var errs = input.model.$lastErrors||null
        if(!errs) {
          return errs;
        }

        return errs.message||null;
      }
    },
    hasErrors: {
      get: function () {
        var message = this.errors; // look for actual errors
        if(!message) return false;

        if(angular.isArray(message) || angular.isString(message)) {
          return message.length > 0;
        }

        return false;
      }
    },
    input: {
      get: function () {
        return $scope.$formInput;
      }
    },
    hasInput: {
      get: function () {
        var input = this.input;
        return !!input && input.hasModel;
      }
    }
  });

  this.clear = function () {
    if(!this.hasInput || !this.hasErrors) {
      return this;
    }

    var model = this.input.model;
    delete model.$lastErrors;
    model.$validate();

    return this;
  };
}]);

angular.module('coordinate-vx')
.directive('validationFeedback', ["$compile", function ($compile) {
  return {
    restrict: 'E',
    replace: true,
    require: '^formInput',
    templateUrl: 'directive/validation-feedback.html',
    scope: {},
    link: function (scope, el, attr, input) {
      scope.$formInput = input;
    }
  };
}])

angular.module('coordinate-vx')
.directive('validationInput', ["$debounce", function ($debounce) {
  return {
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, el, attr, ctrl) {
      var
      clearErrors = function () {
        delete ctrl.$lastErrors;
        ctrl.$validate();
      };

      scope.$watch(function () { return ctrl.$viewValue; }, $debounce(function (viewValue) {
        var errs = ctrl.$lastErrors||false;

        if(!errs || !errs.hasOwnProperty('original')) {
          return false;
        }

        var changed = (viewValue !== errs.original);

        if(changed) {
          clearErrors();
        }

        return changed;
      }, 50, 100));
    }
  };
}]);

angular.module('coordinate-vx')
.factory('AuthInterceptor', ["ErrorBadToken", "$rootScope", "$q", "$authPersist", function (ErrorBadToken, $rootScope, $q, $authPersist) {
  return {

    request: function (config) { // add authorization token to headers if authenticated
      config.headers = config.headers || {};

      if ($authPersist.authenticated) {
        config.headers.Authorization = $authPersist.token;
      }

      return config;
    },

    responseError: function (err) {
      if(!ErrorBadToken.is(err)) {
        return $q.reject(err);
      }

      // clear any persisting auth token
      $authPersist.clear();

      // broadcast that the session was expired (handle in a different thread, after clearing token)
      $rootScope.$broadcast('$sessionExpired', err);

      return $q.reject(err); // cascade error downstream
    }
  };
}]);
angular.module('coordinate-vx')
.factory('ErrorAlert', function () {
  function ErrorAlert (message, title) {
    this.message = message;
    this.title = title||'System Error';
  }

  ErrorAlert.is = function (v) {
    return angular.isObject(v) && (v instanceof ErrorAlert);
  };

  return ErrorAlert;
});
angular.module('coordinate-vx')
.factory('ErrorBadToken', function () {
  function ErrorBadToken (message) {
    this.message = message;
  }

  ErrorBadToken.is = function (v) {
    return angular.isObject(v) && (v instanceof ErrorBadToken);
  };

  return ErrorBadToken;
});
angular.module('coordinate-vx')
.factory('ErrorValidation', ["ErrorAlert", function (ErrorAlert) {
  function ErrorValidation (message, errors, title) {
    ErrorAlert.call(this, message, title||'Validation Error');
    this.errors  = errors;
  }

  // extend ErrorAlert
  ErrorValidation.prototype = Object.create(ErrorAlert.prototype);
  ErrorValidation.prototype.constructor = ErrorValidation;

  ErrorValidation.is = function (v) {
    return angular.isObject(v) && (v instanceof ErrorValidation);
  };

  ErrorValidation.normalizeError = function (err, key) {
    return {};
  };

  ErrorValidation.prototype.gradeForm = function (scope, form) {
    if(!form || !this.errors) return this;

    var errs = this.errors||{};

    Object.keys(errs).forEach(function (path) {
      if(!form.hasOwnProperty(path)) {
        return;
      }

      var model = form[path];
      model.$lastErrors = errs[path];
      model.$validate();
    });

    return this;
  };

  return ErrorValidation;
}]);

angular.module('coordinate-vx')
.factory('HttpNormalizer', ["$q", "$rootScope", "ErrorBadToken", "ErrorAlert", "ErrorValidation", function ($q, $rootScope, ErrorBadToken, ErrorAlert, ErrorValidation) {
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
}]);
angular.module('coordinate-vx')
.service('Log', function () {

  function Log (data, maxLength, addToStart) {

    if(arguments.length === 0) {
      data = [];
      maxLength = 20;
    }
    else if(!angular.isArray(data)) {
      data = [data];
    }

    maxLength = (angular.isNumber(maxLength) && maxLength > 0) ? maxLength : 0;

    if(addToStart) {
      data.reverse();
    }

    Object.defineProperties(this, {
      maxLength: {
        get: function () { return maxLength; }
      },
      length: {
        get: function () { return data.length; }
      },
      records: {
        get: function () { return data; }
      }
    });

    var truncate = (function () {
      if(maxLength === 0) return this;

      var
      rmnum = (this.length - maxLength);

      if(rmnum > 0) {
        if(addToStart) { // remove from end
          data.splice(maxLength, rmnum);
        }
        else { // remove from start
          data.splice(0, rmnum);
        }
      }

      return this;
    }).bind(this);

    truncate(); // any data loaded from constructor

    this.add = function () {
      var
      adding = Array.prototype.slice.call(arguments),
      addfn  = addToStart ? Array.prototype.unshift : Array.prototype.push,
      mapfn  = angular.identity;

      if(addToStart) {
        adding.reverse();
      }

      if(adding.length === 0) return this;

      if(angular.isFunction(this.item)) {
        mapfn = this.item.bind(this);
      }

      addfn.apply(data, adding.map(mapfn));

      return truncate();
    };
  }

  return Log;
});

angular.module('coordinate-vx')
.factory('RevControl', function () {

  var
  numberChk = function (n) { return !isNaN(n) && isFinite(n); };

  function RevControl (history, index, maxUndo) {
    if(!angular.isArray(history)) {
      history = [history];
    }

    var
    defaultIndex = !!history.length ? 0 : -1;

    if(arguments.length < 3) {
      maxUndo = index;
      index = defaultIndex;
    }

    Object.defineProperties(this, {
      history: {
        get: function () { return history; }
      },
      maxUndo: {
        get: function () { return maxUndo; },
        set: function (v) {
          v = parseInt(v, 10);
          if(!numberChk(v)) { v = 5; }
          if(v < 0) { v = 0; }
          if(v !== maxUndo) { maxUndo = v; }
        }
      },
      history: {
        get: function () { return history; }
      },
      length: {
        get: function () { return history.length; }
      },
      head: {
        get: function () { return history[0]; }
      },
      index: {
        get: function () { return index; },
        set: function (v) {
          var length = history.length;
          v = parseInt(v, 10);
          if(!numberChk(v) || v < -1) { v = -1; }
          if(v === -1 && length > 0) { v = 0; }
          else { v = Math.min(v, length - 1); }
          if(v !== index) { index = v; }
        }
      },
      current: {
        get: function () { return history[this.index]; }
      },
      foot: {
        get: function () { return history[history.length - 1]; }
      },
      isHead: {
        get: function () { return index === 0; }
      },
      isFoot: {
        get: function () { return index === (history.length - 1); }
      }
    });

    this.index   = index;
    this.maxUndo = maxUndo;
  }

  RevControl.prototype.moveToFoot = function () {
    this.index = this.length - 1;
    return this;
  };

  RevControl.prototype.moveToHead = function () {
    this.index = 0;
    return this;
  };

  RevControl.prototype.apply = function (d, replace) {
    var
    history = this.history,
    max = this.maxUndo,
    length = this.length,
    index = this.index;

    if(d === this.head) {
      return this.moveToHead();
    }

    if(length === 0 || index === -1) {
      history.unshift(d);
      length++;
    }
    else if(!this.isHead) {
      history.splice(0, index, d);
      length = history.length;
    }
    else if(replace) {
      history[index] = d;
    }
    else {
      history.unshift(d);
      length++;
    }

    if(max > 0 && length > max) {
      history.splice(max, length - max);
    }

    return this.moveToHead();
  };

  RevControl.prototype.undo = function (steps, purge) {
    purge = !!purge;
    steps = parseInt(steps, 10);
    if(!numberChk(steps) || steps < 1) steps = 1;

    var oldIndex = this.index;
    this.index += steps;

    if(purge) {
      this.index = 0; // move to head
      this.history.splice(0, oldIndex + 1); // splice all newer
    }

    return this;
  };

  RevControl.prototype.redo = function (steps) {
    this.index -= steps||1;
    return this;
  };

  return RevControl;
});
angular.module('coordinate-vx')
.factory('User', ["$apiUrl", "$resource", function ($apiUrl, $resource) {
  return $resource($apiUrl('user/:controller'), {
    controller: null,
    id: null
  }, {
    login: {
      method: 'POST',
      params: {
        controller: 'login'
      }
    },
    signup: {
      method: 'POST',
      params: {
        controller: 'signup'
      }
    },
    tokenInfo: {
      method: 'GET',
      params: {
        controller: 'token-info'
      }
    },
    tokenExtend: {
      method: 'GET',
      params: {
        controller: 'token-extend'
      }
    },
    getProfile: {
      method: 'GET',
      params: {
        controller: 'profile'
      }
    },
    updateProfile: {
      method: 'POST',
      params: {
        controller: 'profile'
      }
    },
    changePassword: {
      method: 'POST',
      params: {
        controller: 'change-password'
      }
    },
    input: {
      method: 'POST',
      params: {
        controller: 'input'
      }
    }
  });
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app', {
      abstract: true ,
      templateUrl: 'state/app.html',
      controller: 'AppCtrl as $app',
      data: {
      }
    });
}])
.controller('AppCtrl', ["$scope", "$state", "$auth", function ($scope, $state, $auth) {
  Object.defineProperties(this, {
    'state': {
      get: function () {
        return $state.current;
      }
    },
    'authenticated': {
      get: function () {
        return $auth.authenticated;
      }
    },
    'profile': {
      get: function () {
        return $auth.profile;
      }
    }
  });
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.guest', {
      abstract: true,
      templateUrl: 'state/guest.html',
      controller: 'AppGuestCtrl'
    });
}])
.controller('AppGuestCtrl', ["$scope", function ($scope) {
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.user', {
      abstract: true,
      templateUrl: 'state/user.html',
      controller: 'AppUserCtrl',
      resolve: {
        authorization: ['$auth', function ($auth) {
          return $auth.ready;
        }]
      }
    });
}])
.controller('AppUserCtrl', ["$scope", "$rootScope", "$state", "$stateParams", "authorization", "$authWatch", function ($scope, $rootScope, $state, $stateParams, authorization, $authWatch) {

  var
  loginState = 'app.guest.login',
  loginParams = {},
  kickOut = function () {
    $rootScope.restoreState = {
      name: $state.current.name,
      params: angular.copy($stateParams)
    };
    return $state.go(loginState, loginParams);
  };

  if(!authorization) { // take the user to the login page, but remember where he was for re-login.
    return kickOut();
  }

  $scope.$on('$destroy', $authWatch(function (authenticated) {
    if(!authenticated) {
      kickOut();
    }
  }));
}]);

angular.module('coordinate-vx')
.service('$apiUrl', ["API", function (API) {
  return function () {
    return API + '/' + Array.prototype.slice.call(arguments)
      .join('/')
      .replace(/\/+/g, '\/')
      .replace(/^\//, '');
  };
}]);
angular.module('coordinate-vx')
.service('$authPersist', ["$cookieStore", function ($cookieStore) {
  var KEY_TOKEN = 'cvx-token';

  this.has = function() {
    return !!this.get();
  };
  this.clear = function() {
    $cookieStore.remove(KEY_TOKEN);
    return this;
  };
  this.get = function() {
    return $cookieStore.get(KEY_TOKEN);
  };
  this.set = function(v) {
    $cookieStore.put(KEY_TOKEN, v);
    return this;
  };

  Object.defineProperties(this, {
    token: {
      get: this.get.bind(this)
    },
    authenticated: {
      get: this.has.bind(this)
    }
  });
}]);
angular.module('coordinate-vx')
.service('$authState', ["$rootScope", "$state", "$auth", function ($rootScope, $state, $auth) {
  return {
    onStateChangeStart: function () {
      // console.log('state change start', arguments);
    },
    onStateChangeSuccess: function () {
      // console.log('state change success', arguments);
    },
    onStateChangeError: function (event, toState, toParams, fromState, fromParams, error) {
      // console.log('state change error', arguments);
    }
  };
}])
.run(["$rootScope", "$authState", function ($rootScope, $authState) { // install service into rootscope events
  $rootScope.$on('$stateChangeStart',   $authState.onStateChangeStart);
  $rootScope.$on('$stateChangeSuccess', $authState.onStateChangeSuccess);
  $rootScope.$on('$stateChangeError',   $authState.onStateChangeError);
}]);
angular.module('coordinate-vx')
.service('$authWatch', ["$rootScope", "$auth", function ($rootScope, $auth) {
  return function () {

    var
    args = Array.prototype.slice.call(arguments),
    arg, cb = null, once = null;

    while((arg = args.shift()) !== undefined) {
      if(typeof arg === 'boolean' && once === null) {
        once = arg;
      }
      else if(angular.isFunction(arg) && cb === null) {
        cb = arg;
      }
    }

    if(!angular.isFunction(cb)) {
      return angular.noop;
    }

    var
    dereg;

    if(once) { // wrap in only once function
      var origCb = cb;
      cb = function () {
        dereg();
        origCb.apply(this, arguments);
      };
    }

    dereg = $rootScope.$watch(function () {
      return $auth.authenticated;
    }, function (cv, ov) {
      if(!cv) { // not authenticated
        return cb(false);
      }

      // authenticated, send profile
      return cb(true, $auth.profile);
    });

    // return de-registration function.
    return dereg;
  };
}]);
angular.module('coordinate-vx')
.service('$auth', ["$q", "$authPersist", "User", function ($q, $authPersist, User) {
  var
  loading = false,
  lastProfile = false,
  markLoading  = function (promise) { loading = promise; return promise.finally(function () {
    loading = false;
  }); };

  Object.defineProperties(this, {
    authenticated: {
      get: function () {
        return $authPersist.authenticated && !loading;
      }
    },
    loading: {
      get: function () {
        return loading;
      }
    },
    profile: {
      get: function () {
        if(!this.authenticated) {
          return null;
        }

        return lastProfile;
      }
    },
    ready: {
      get: function () {
        if(this.authenticated) {
          return $q.when(this.profile);
        }
        else if (!loading) {
          return $q.when(false);
        }

        return loading;
      }
    }
  });

  this.accessInfo = function () {
    return User.tokenInfo().$promise;
  };

  this.extendAccess = function (longTerm) {
    return User.tokenExtend({ longTerm: (!!longTerm  ? 1 : 0)}).$promise
      .then((function (data) {
        $authPersist.set(data.token); // set the token for this user
        return this.profile; // return existing profile
      }).bind(this));
  };

  this.reloadProfile = function () {
    return markLoading(
      User.getProfile().$promise
        .then(function (profile) {
          lastProfile = profile;
          return lastProfile;
        })
        .catch(function (err) { // clean up on any errors here.
          lastProfile = false;
          $authPersist.clear();
          return false;
        })
    );
  };

  this.loadUserProfile = function (token) {
    $authPersist.set(token); // set the token for this user
    return this.reloadProfile();
  };

  this.signup = function (model) {
    return markLoading(
      User.signup(model).$promise
        .then(function (data) { return data.token; })
        .then(this.loadUserProfile.bind(this))
    );
  };

  this.login = function (model) {
    return markLoading(
      User.login(model).$promise
        .then(function (data) { return data.token; })
        .then(this.loadUserProfile.bind(this))
    );
  };

  this.logout = function () {
    lastProfile = null;
    $authPersist.clear();
    return this;
  };

  if($authPersist.authenticated) { // load the profile
    this.reloadProfile();
  }
}]);

angular.module('coordinate-vx')
.service('$debounce', ["$timeout", function ($timeout) {

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  return function (func, wait, immediate) {
    var timeout;
    return function() {
      var context = this, args = arguments;
      var later = function() {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      var callNow = immediate && !timeout;
      if(timeout) $timeout.cancel(timeout);
      timeout = $timeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };
}]);
angular.module('coordinate-vx')
.service('$dirtyForm', function (){
  return function (form) {
    if(!form || !form.hasOwnProperty('$setDirty'))
      return form;

    form.$setDirty(true); // set form to be dirty

    angular.forEach(form, function (model, key) { // set all child models to be dirty
      if (angular.isObject(model) && model.hasOwnProperty('$modelValue')) {
        model.$setDirty();
      }
    });

    return form;
  };
})

angular.module('coordinate-vx')
.service('$guestOnly', ["$rootScope", "$auth", "$state", function ($rootScope, $auth, $state) {
  return function (scope) {
    return (scope||$rootScope).$watch(function () { return $auth.authenticated }, function (authenticated) {
      if(authenticated) {
        if($rootScope.restoreState) {
          var restore = $rootScope.restoreState;
          delete $rootScope.restoreState;
          return $state.go(restore.name, restore.params);
        }

        return $state.go('app.user.dashboard');
      }
    });
  };
}]);
angular.module('coordinate-vx')
.service('$heartBeat', ["$q", "$timeout", "$auth", "$filter", function ($q, $timeout, $auth, $filter) {

  var
  durationFilter = $filter('duration');

  var
  running = false,
  interval = 150000,
  warnThreshold = 60000,
  idleThreshold = 30000,
  warnGraceMs = 5000,
  checking = false,
  checkPromise = null,
  longTerm = false,
  lastCheck = null,
  lastTouch = null,
  lastError = null,
  expireAt = null,
  issuedAt = null,
  timeout = null;

  function roundSec (n) {
    return Math.round(n / 1000);
  }

  function validThreshold (n) {
    return angular.isNumber(v) && !isNaN(v) && isFinite(v) && v >= 0
  }

  Object.defineProperties(this, {
    interval: {
      get: function () {
        return interval;
      },
      set: function (v) {
        if(!validThreshold(v)) return;

        interval = v;
        this.resetTimeout();
      }
    },
    warnThreshold: {
      get: function () {
        return warnThreshold;
      },
      set: function (v) {
        if(!validThreshold(v)) return;
        warnThreshold = v;
      }
    },
    idleThreshold: {
      get: function () {
        return idleThreshold;
      },
      set: function (v) {
        if(!validThreshold(v)) return;
        idleThreshold = v;
      }
    },
    longTerm: {
      get: function () { return longTerm; },
      set: function (v) { longTerm = !!v; }
    },
    lastCheck: {
      get: function () {
        return lastCheck;
      }
    },
    lastTouch: {
      get: function () {
        return lastTouch;
      }
    },
    expireAt: {
      get: function () {
        return expireAt;
      }
    },
    ttlMs: {
      get: function () {
        if(!this.expireAt) return Infinity;
        return this.expireAt.getTime() - Date.now();
      }
    },
    ttlSec: {
      get: function () {
        return roundSec(this.ttlMs);
      }
    },
    ttlDuration: {
      get: function () { return durationFilter(this.ttlSec * 1000); }
    },
    idleMs: {
      get: function () {
        if(!lastTouch) return Infinity;
        return Date.now() - lastTouch.getTime();
      }
    },
    idleSec: {
      get: function () {
        return roundSec(this.idleMs);
      }
    },
    nextCheckInMs: {
      get: function () {
        if(!lastCheck) return Infinity;
        return interval - (Date.now() - lastCheck.getTime());
      }
    },
    nextCheckInSec: {
      get: function () {
        return roundSec(this.nextCheckInMs);
      }
    },
    issuedAt: {
      get: function () {
        return issuedAt;
      }
    },
    isWarning: {
      get: function () {
        return this.ttlMs <= this.warnThreshold;
      }
    },
    isWarningGraced: {
      get: function () {
        return this.ttlMs <= (this.warnThreshold + warnGraceMs); // (this.idleThreshold - this.idleMs)
      }
    },
    isIdle: {
      get: function () {
        return this.idleMs >= this.idleThreshold;
      }
    },
    running: {
      get: function () {
        return running;
      }
    },
    checking: {
      get: function () {
        return checking;
      }
    },
    $promise: {
      get: function () {
        return $q.when(checkPromise);
      }
    }
  });

  var
  loop = (function () {
    if(!running||checking) {
      return this.resetTimeout();
    }

    checking = true;
    checkPromise = $auth.accessInfo()
      .then(function (results) {
        expireAt = new Date(results.expireDate);
        issuedAt = new Date(results.issuedDate);
        longTerm = !!results.longTerm;
        return results;
      }, function (err) { // clear on error
        lastError = err;
        return err;
      })
      .finally(function () {
        checking = false;
        lastCheck = new Date();
      });

    return this.resetTimeout();
  }).bind(this);

  this.refresh = function (touch) {
    this.touchIf(touch, true);
    return loop().$promise;
  };

  this.extendAccess = function (longTerm, touch) {
    this.touchIf(touch, true);
    return $auth.extendAccess((typeof longTerm === 'boolean') ? longTerm : this.longTerm)
      .then((function () { return this.refresh(touch); }).bind(this));
  };

  this.reset = function (touch) {
    checkPromise = null;
    expireAt  = null;
    issuedAt  = null;
    lastCheck = null;
    this.touchIf(touch);
    return this.resetTimeout();
  };

  this.touchIf = function (v, defaultVal, ts) {
    defaultVal = (typeof defaultVal === 'boolean')
      ? defaultVal
      : false;

    if((typeof v === 'boolean') ? v : defaultVal) {
      this.touch(ts);
    }

    return this;
  };

  this.touch = function (ts) {
    lastTouch = angular.isDate(ts) ? ts : new Date();
    return this;
  };

  this.resetTimeout = function () {
    if(timeout !== null) {
      $timeout.cancel(timeout);
      timeout = null;
    }

    if(!running) {
      return this;
    }

    timeout = $timeout(loop, interval);
    return this;
  };

  this.start = function () {
    if(running||!$auth.authenticated) return this.resetTimeout();
    running = true;
    loop();
    return this;
  };

  this.stop = function () {
    if(!running) return this.resetTimeout();
    running = false;
    this.reset();
    return this;
  };
}])
.run(["$rootScope", "$interval", "$heartBeat", "$authWatch", "$auth", function ($rootScope, $interval, $heartBeat, $authWatch, $auth) {
  $heartBeat.touch();

  $authWatch((function (authenticated) { !!authenticated ? this.start() : this.stop(); }).bind($heartBeat));

  $rootScope.$on('$stateChangeStart',   $heartBeat.touch);
  $rootScope.$on('$stateChangeSuccess', $heartBeat.touch);
  $rootScope.$on('$stateChangeError',   $heartBeat.touch);

  var
  ACTION_NO_CHANGE = 'no-change',
  ACTION_RENEW     = 'renew',
  ACTION_LOGOUT    = 'logout';

  $rootScope.$watch(function () {
    if(!$heartBeat.running || !$heartBeat.isWarningGraced) {
      return ACTION_NO_CHANGE;
    }
    else if(!$heartBeat.isIdle && $heartBeat.isWarningGraced) {
      return ACTION_RENEW;
    }
    else if($heartBeat.ttlMs <= 0 && $heartBeat.running) {
      return ACTION_LOGOUT;
    }

    return ACTION_NO_CHANGE;
  }, function (action) {
    if(action === ACTION_NO_CHANGE)  return;
    if(action === ACTION_LOGOUT)     return $auth.logout();
    if(action === ACTION_RENEW)      return $heartBeat.extendAccess(null, false);
  });

  $interval(angular.noop, 1000); // only one needed globally, so the ttls update
}]);
angular.module('coordinate-vx')
.service('$modalMessage', ["$q", "$modalOpen", function ($q, $modalOpen) {
  return function (message, title, cls) {
    title = title || 'Message';
    cls = cls || 'text-info';

    var dialog = $modalOpen({
      modal: {
        title: title,
        text: message,
        titleClass: cls,
        bodyClass: cls,
        dismissable: true,
        buttons: [{
          text: 'Okay',
          click: function (event) {
            dialog.dismiss.apply(dialog, event);
          }
        }]
      }
    }, {
      windowClass: 'slide',
      size: 'modal-sm'
    });

    return dialog;
  };
}])

angular.module('coordinate-vx')
.service('$modalOpen', ["$rootScope", "$uibModal", function ($rootScope, $uibModal) {

  /**
   * Opens a modal
   * @param  {Object} scope      - an object to be merged with modal's rootScope child
   * @param  {String} opts       - any valid opts for uibModal
   * @return {Object}            - the instance $uibModal.open() returns
   */
  return function (scope, opts) {
    return $uibModal.open(angular.extend({
      templateUrl: 'app/tpl/modal/default.html',
      scope: angular.extend($rootScope.$new(), scope || {})
    }, opts));
  };
}]);
angular.module('coordinate-vx')
.service('$modalSystemError', ["$q", "$modalOpen", function ($q, $modalOpen) {
  return function (err) {
    var dialog = $modalOpen({
      modal: {
        title: err.title,
        text: err.message,
        titleClass: 'text-danger',
        bodyClass: 'text-danger',
        dismissable: true,
        buttons: [{
          text: 'Okay',
          click: function (event) {
            dialog.dismiss.apply(dialog, event);
          }
        }]
      }
    }, {
      windowClass: 'slide',
      size: 'modal-sm'
    });

    return dialog;
  };
}])
.run(["$modalSystemError", "$rootScope", function ($modalSystemError, $rootScope) {
  $rootScope.$on('$systemError', function (event, error) {
    return $modalSystemError(error).result;
  });
}]);
angular.module('coordinate-vx')
.service('$randomName', ["$random", "$randomPluck", function ($random, $randomPluck) {
  var
  first  = ['Juan','Margaret','David','Jerry','Kathleen','Donna','Ruth','Roger','Gary','Andrew','Steven','Carol','Shirley','Jack','Cheryl','Joe','Heather','Gloria','Sharon','Ashley','Cynthia','Nancy','Jeffrey','Deborah','Stephanie','Martha','Virginia','Douglas','Mark','Jean','Carolyn','Raymond','Ann','Michael','Melissa','Stephen','Maria','Robert','John','Terry','Dorothy','Joseph','Kevin','Eric','Gregory','Michelle','Anthony','Peter','Ronald','Janet','Carl','Julie','Jonathan','Walter','Donald','Teresa','Amanda','Brian','Scott','Doris','Frank','Evelyn','Amy','Frances','Betty','George','Sarah','Jason','Christine','Anna','Jessica','Susan','Laura','Charles','Thomas','Paul','Timothy','Daniel','Brenda','Helen','Henry','Albert','Karen','Katherine','Linda','Lisa','Larry','Kenneth','Jose','Rebecca','Mary','Ryan','Marie','Christopher','Patrick','Richard','Sandra','Matthew','Diane','Edward','James','Arthur','Mildred','Jennifer','Justin','Harold','Barbara','Angela','Debra','Joyce','Joan','Alice','William','Dennis','Patricia','Kimberly','Catherine','Elizabeth','Pamela','Joshua','Judith'],
  middle = ['James','Daniel','Ruby','Paige','Lee','Jay','Henry','Belle','Anne','Thomas','Andrew','Alexander','Jade','William','Louise','Claire','Lily','Joseph','Elizabeth','Hope','Peter','Mary','Matthew','Charlotte','Christopher','May','Grace','Jane','John','Anthony','Michael','Kate','Jack','Marie','Oliver','Robert','Jean','David','Edward','Rose'],
  last   = ['Morgan','Rogers','Coleman','Rodriguez','Richardson','Brown','Nelson','Ruiz','Kelly','Price','Ross','Martin','Patterson','Sanders','Edwards','Kennedy','Marshall','Diaz','Ford','Chavez','Perez','Stewart','Robinson','Ward','Wood','Peterson','Turner','Lee','Wallace','Wells','Harrison','Jackson','Roberts','Howard','Garcia','Cox','Davis','Gonzales','Murray','Reed','Owens','Taylor','Mcdonald','Walker','Powell','White','Perry','Watson','Morris','Sanchez','Gibson','Ellis','Russell','Green','Foster','Hughes','Ramos','Simmons','Bell','Hernandez','Harris','Anderson','Sullivan','Thomas','Clark','Jenkins','Butler','Lopez','Myers','Evans','Mitchell','Torres','Nguyen','James','Bennett','Flores','Bryant','King','Lewis','Cook','Bailey','Hamilton','Wright','Gonzalez','Graham','Young','Long','Wilson','Martinez','Ortiz','Murphy','Cooper','Collins','Smith','Griffin','Carter','Gomez','Adams','Moore','Hayes','Hall','Cole','Henderson','Gray','Fisher','Williams','Kim','Barnes','Stevens','Parker','Jones','Brooks','Miller','Rivera','Thompson','West','Jordan','Gutierrez','Morales','Allen','Ramirez','Phillips','Scott','Johnson','Alexander','Hill','Cruz','Baker','Campbell','Reyes','Reynolds'];

  return function () {
    return {
      first:  $randomPluck(first),
      middle: $randomPluck(middle),
      last:   $randomPluck(last),
      birthday: new Date($random((new Date).getFullYear() - 80,(new Date).getFullYear(), 0),$random(0,11,0),$random(1,31,0),$random(0,23,0),$random(0,59,0),$random(0,59,0),$random(0,999,0)),
      toString: function () {
        return [this.first, this.middle, this.last].join(' ');
      }
    };
  };
}])
.service('$randomEmail', ["$random", "$randomName", "$randomPluck", function ($random, $randomName, $randomPluck) {
  var
  domain = ['aol.com','att.net','comcast.net','facebook.com','gmail.com','gmx.com','googlemail.com','google.com','hotmail.com','hotmail.co.uk','mac.com','me.com','mail.com','msn.com','live.com','sbcglobal.net','verizon.net','yahoo.com','yahoo.co.uk','email.com','games.com','gmx.net','hush.com','hushmail.com','icloud.com','inbox.com','lavabit.com','love.com','outlook.com','pobox.com','rocketmail.com','safe-mail.net','wow.com','ygm.com','ymail.com','zoho.com','fastmail.fm'];

  return function (name) {
    name = name || $randomName();

    name.domain   = $randomPluck(domain);
    name.username = String(name.last+'.'+name.first).toLowerCase() + '.' + name.birthday.getFullYear();

    // add a helper fn to build email if changes
    name.toEmail = name.toEmail || function () {
      return name.username+'@'+this.domain;
    };

    name.email = name.toEmail();

    return name;
  };
}])
.service('$randomWords', ["$asNumber", "$random", "$clamp", "$randomPluck", function ($asNumber, $random, $clamp, $randomPluck) {
  var
  words = ['edacious','galactometer','barbette','halcyonine','cachet','echinuliform','calando','edapha','caducary','jackyard','ecliptic','faburden','balanism','ichneutic','halfpace','baculine','palaeolimnology','bandolier','famicide','caespitose','edaphic','jade','facultative','barathea','halieutic','decalcomania','cabré','handfast','palaeogeography','effigurate','barege','factive','bahuvrihi','ecophobia','ectogenesis','hame','fabulist','barbiton','icaco','cacoethes','ablepsia','caesaropapism','dation','aasvogel','ecbole','caddis','balustrade','hanap','falsidical','ichthyophagous','factious','debouchure','falanouc','pais','halitus','caisson','factitive','danism','calefacient','dactylography','palanquin','halophilous','fagin','dapocaginous','fandango','calathus','bardel','falcade','haemathermal','ichnogram','ecdemic','falconine','gal','cacidrosis','gallimaufry','ebullition','debellate','paizogony','abecedarian','hamarchy','baculiform','iatrophobia','caboose','palafitte','gallomania','fain','balneology','baetyl','galactophorous','balmorality','faldstool','gambrel','abarticular','cacography','dacnomania','face','baisemain','galère','calamanco','iatramelia','gallophile','darby','palaeogaea','ichnography','decarchy','ecaudate','barathrum','balanoid','effulge','ichthyophile','fanal','fane','cabas','hallux','jacquard','cacuminal','halation','gallipot','dapifer','dactylogram','jamb','calciform','davit','ecesis','deaconing','galliard','eclipsis','abigail','eccoprotic','gaita','hagiography','hamshackle','deadhouse','davenport','echinate','damnification','cabochon','iatrology','famigerate','ichthyic','cacogen','banteng','ichnology','gallize','galactophagist','barbarocracy','barbet','halyard','caducity','galop','ecbolic','effleurage','abear','eclat','baedeker','caitiff','ecclesiography','calender','palative','ecclesiolatry','cacodoxy','calcifuge','calamist','banjolin','gabelle','efferent','ecydisis','janitrix','fanfaron','galilee','cachaemic','galactic','ichnomancy','echidna','darcy','baculus','palaceous','gabbart','hakenkreuz','abdominous','caduceator','cable','falcate','balzarine','backstay','galvanoscope','fantigue','jalousie','darkle','effutiation','jaconet','cachalot','ballistophobia','galvanometer','bar','palaeography','gabion','palaeophile','damine','haliography','barbican','debouch','damascene','bargemaster','eccaleobion','janiform','dasypoedes','abiotrophy','cachinnate','falsiloquence','daphnomancy','ecclesiastry','dealate','echoism','jacu','ectobatic','gad','ecophene','calcine','paideutic','abeam','fagottist','calcariferous','abiectic','iatraliptic','bandore','decantate','calefactory','gambroon','banausic','hackle','eclipsareon','economacy','fairlead','eburnean','barbate','dalmatic','galbanum','damson','abature','balneography','eclaircise','ichthyoid','palaestra','echard','bacciform','cakewalk','debel','echopraxia','ectypography','palaeoclimatology','ecbatic','palaeobiology','balderdash','cabotage','falderal','calcariform','palabra','caconym','gallicide','cachepot','bacillicide','ichthyolatry','backpiece','damoiseau','cacaesthesia','hagiolatry','edh','dag','eclosion','daw','galloon','ecarlate','haematogenesis','ballaster','banquette','jactitation','dap','gallophobia','aberuncators'];

  return function (num) {
    return $randomPluck(words, $clamp($asNumber(num, $random(1, 5)), 1), true).join(' ');
  };
}]);

angular.module('coordinate-vx')
.config(["$wampProvider", "WAMP_URL", "WAMP_REALM", function ($wampProvider, WAMP_URL, WAMP_REALM) {
  $wampProvider.init({
    url: WAMP_URL,
    realm: WAMP_REALM,
    authmethods: ['wampcra']
  });
}])
.factory('RealTimeLog', ["Log", function (Log) {
  function RealTimeLog() {
    Log.apply(this, arguments);
  }

  RealTimeLog.prototype = Object.create(Log);
  RealTimeLog.prototype.constructor = RealTimeLog;

  RealTimeLog.prototype.item = function (v) {
    return { cls: v.c, message: v.m, date: new Date() };
  };

  return RealTimeLog;
}])
.service('$realTime', ["$wamp", "$auth", "$authPersist", "$rootScope", "$filter", "RealTimeLog", function ($wamp, $auth, $authPersist, $rootScope, $filter, RealTimeLog) {

  var
  filterEllipsis = $filter('ellipsis'),
  running = false,
  log = new RealTimeLog([], 10, true),
  logWrapFn = (function (message, cls, fn) {
    return function () {
      // console.log('CALLING', this, arguments);
      var
      msg = message;

      if(angular.isFunction(message)) {
        msg = message.apply(this, arguments);
      }

      log.add({ m: msg, c: cls });

      return fn.apply(this, arguments);
    };
  }).bind(this);

  Object.defineProperty(this, 'log', {
    get: function () { return log.records; }
  });

  // locally bind these functions
  // this.subscribe      = logWrapFn(function (c) { return 'Subscribing ('+c+')'; }, '', $wamp.subscribe.bind($wamp));
  // this.unsubscribe    = logWrapFn(function (z) { return 'Unsubscribing ('+z.topic+')'; }, '', $wamp.unsubscribe.bind($wamp));
  this.publish        = logWrapFn('Publishing', '', $wamp.publish.bind($wamp));
  this.register       = logWrapFn('Registering', '', $wamp.register.bind($wamp));
  this.unregister     = logWrapFn('Unregistering', '', $wamp.unregister.bind($wamp));
  this.call           = logWrapFn('Calling function', '', $wamp.call.bind($wamp));
  this.open           = logWrapFn('Connection opening..',  'success', $wamp.open.bind($wamp));
  this.close          = logWrapFn('Connection closing..',  'danger',  $wamp.close.bind($wamp));

  this.subscribe = function (channel, fn) {
    var
    subscriptionId = null,
    ellipSubId = null;

    // log.add({ m: 'Subscribing to channel ('+channel+')..' });
    return $wamp.subscribe(channel, function (args) {
      log.add({ m: 'Subscription ('+channel+':'+ellipSubId+') got data: ' + JSON.stringify(args) })
      return fn.apply(this, arguments);
    })
      .then(function(res){
        ellipSubId = filterEllipsis(subscriptionId = res.id);
        log.add({ m: 'Subscribed to channel ('+channel+') with id ('+ellipSubId+').' });
        return res;
      }, function(err){
        log.add({ m: 'Got error ('+err+') while subscribing to channel ('+channel+').', c: 'danger' })
        return res;
      });
  };

  this.unsubscribe = function (subscription) {
    var
    channel = subscription.topic,
    id = subscription.id,
    eid = filterEllipsis(id);

    // log.add({ m: 'Unsubscribing from channel ('+channel+') id ('+eid+')..' });

    return $wamp.unsubscribe(subscription)
      .then(function(res){
        log.add({ m: 'Unsubscribed from channel ('+channel+') id ('+eid+').' });

        if(angular.isObject(subscription) && angular.isFunction(subscription.$scopeWatchDeregistration)) {
          subscription.$scopeWatchDeregistration();
          delete subscription.$scopeWatchDeregistration;
        }

        return res;
      }, function(err){
        log.add({ m: 'Got error ('+err+') while unsubscribing channel ('+channel+').', c: 'danger' })
        return res;
      });
  };

  // can't use native subscribe on scope, borks up the returned subscription:
  // this.subscribeScope = $wamp.subscribeOnScope.bind($wamp);
  this.subscribeScope = function (scope, channel, callback) {
    return this.subscribe(channel, callback).then(function (subscription) {
      subscription.$scopeWatchDeregistration = scope.$on('$destroy', function () {
        if(!subscription || !subscription.active) return;
        log.add({ m: 'Auto-unsubscribing scope from channel ('+channel+')', c: 'warning' });
        return subscription.unsubscribe();
      });
      return subscription;
    });
  };

  this.start = function () {
    if(running) return this;
    log.add({ m: 'Starting real-time wamp socket.', c: 'success' });
    running = true;
    $wamp.setAuthId($authPersist.token); // token is our auth id
    $wamp.open();
    return this;
  };

  this.stop = function () {
    if(!running) return this;
    log.add({ m: 'Stopping real-time wamp socket.', c: 'danger' });
    running = false;
    $wamp.close();
    return this;
  };

  $rootScope.$on("$wamp.open", function (z) {
    log.add({ m: 'Connection opened.', c: 'success' });
  });
  $rootScope.$on("$wamp.close", function (z) {
    log.add({ m: 'Connection closed.', c: 'danger' });
  });

  $rootScope.$on("$wamp.onchallenge", function (event, data) {
    log.add({ m: 'Authenticating as '+$auth.profile.name+'..', c: 'info' });

    var
    extra = data.extra,
    derived = autobahn.auth_cra.derive_key($auth.profile._id, extra.salt, extra.iterations, extra.keylen);
    return data.promise.resolve(autobahn.auth_cra.sign(derived, extra.challenge));
  });
}])
.run(["$realTime", "$authWatch", function ($realTime, $authWatch) {
  $authWatch((function (authenticated) { !!authenticated ? this.start() : this.stop(); }).bind($realTime));
}]);

angular.module('coordinate-vx')
.service('$isNull', function () {
  return function (v) { return v === null; };
})
.service('$isUndefined', function () {
  return function (v) { return v === undefined; };
})
.service('$isNullUndefined', ["$isNull", "$isUndefined", function ($isNull, $isUndefined) {
  return function (v) { return $isNull(v) || $isUndefined(v); };
}])
.service('$isString', function () {
  return function (v) { return typeof(v) === 'string'; };
})
.service('$isBoolean', function () {
  return function (v) { return typeof(v) === 'boolean'; };
})
.service('$isNumber', function () {
  return function (v) { return typeof(v) === 'number' && !isNaN(v); };
})
.service('$isNumberBetween', ["$isNumber", function ($isNumber) {
  return function (v, n1, n2) {
    if(!$isNumber(v) || !$isNumber(n1) || !$isNumber(n2))  {
      return false;
    }

    return v >= Math.min(n1, n2) && v <= Math.max(n1, n2);
  };
}])
.service('$isScalar', ["$isNull", "$isString", "$isNumber", "$isBoolean", function ($isNull, $isString, $isNumber, $isBoolean) {
  return function (v) {
    return !$isNull(v) && ($isString(v) || $isNumber(v) || $isBoolean(v));
  };
}])
.service('$isPrimitive', ["$isNull", "$isString", "$isNumber", "$isBoolean", "$isUndefined", function ($isNull, $isString, $isNumber, $isBoolean, $isUndefined) {
  return function (v) {
    return !$isNull(v) && ($isString(v) || $isNumber(v) || $isBoolean(v) || $isUndefined(v));
  };
}])
.service('$isFunction', function () {
  return angular.isFunction;
})
.service('$isArray', function () {
  return angular.isArray;
})
.service('$isPlainObject', function () {
  return function (v) { // only matches {} not new (Date|Buffer|Array...)
    return Object.prototype.toString.call(v) === '[object Object]';
  };
})
.service('$isObjectType', function () {
  return function (str) {
    return str === 'object';
  };
})
.service('$isObject', ["$isNull", "$isFunction", "$isObjectType", function ($isNull, $isFunction, $isObjectType) {
  return function (v, instanceCheck) { // matches all types of objects, unless instanceCheck is provided a function.

    var
    result = !$isNull(v) && $isObjectType(typeof v);

    if(result && $isFunction(instanceCheck)) { // enforce instanceof checking
      if(false === v instanceof instanceCheck) {
        result = false;
      }
    }

    return result;
  };
}])
.service('$isDate', ["$isObject", function ($isObject) {
  return function (v) { // matches only Date object instances
    return $isObject(v, Date);
  };
}])
.service('$asNumber', ["$isNumber", "$isNullUndefined", function ($isNumber, $isNullUndefined) {
  return function (v, defaultVal) {
    defaultVal = $isNumber(defaultVal) ? defaultVal : 0;

    if ($isNullUndefined(v)) { return defaultVal; }
    if ($isNumber(v)) { return v; }

    var n = parseFloat(v);
    if (isNaN(n)) { return defaultVal; }
    return n;
  }
}])
.service('$asBoolean', ["$isBoolean", "$isNumber", "$isString", "$isNullUndefined", function ($isBoolean, $isNumber, $isString, $isNullUndefined) {
  return function (v, defaultVal) {
    defaultVal = $isBoolean(defaultVal) ? defaultVal : false;

    if($isNullUndefined(v)) {
      return defaultVal;
    }

    if($isBoolean(v)) { // return original value if is a boolean
      return v;
    }
    else if($isNumber(v)) { // return true if equal to 1
      return v === 1;
    }
    else if($isString(v)) { // return true  if matches one of the below
      return ['yes','true','1','on','enabled','enable'].indexOf(v.toLowerCase()) > -1;
    }

    return defaultVal;
  }
}])
.service('$asString', ["$isNullUndefined", "$isString", function ($isNullUndefined, $isString) {
  return function (v, defaultVal) {
    defaultVal = $isString(defaultVal) ? defaultVal : '';

    if($isNullUndefined(v)) {
      return defaultVal;
    }

    if($isString(v)) { // return original value if is a string
      return v;
    }

    return String(v);
  }
}])
.service('$round', ["$isNumber", function ($isNumber) {
  return function  (v, precision) {
    if(!$isNumber(v)) { return NaN; }

    precision = Math.abs(Math.round(isNaN(precision) ? 0 : precision));
    var f = Math.pow(10, precision);
    v = Math.round(v * f) / f;
    return v;
  }
}])
.service('$clamp', ["$isNumber", "$round", function ($isNumber, $round) {
  return function  (v, min, max, precision) {
    if (!$isNumber(v)) { return NaN; }
    if ($isNumber(min)) { v = Math.max(v, min); }
    if ($isNumber(max)) { v = Math.min(v, max); }
    if ($isNumber(precision)) { v = $round(v, precision); }
    return v;
  }
}])
.service('$shuffle', ["$isArray", function ($isArray) {
  return function (array) { // performs a shuffle in place
    if(!$isArray(array)) {
      return false;
    }

    var currentIndex = array.length, temporaryValue, randomIndex;
    while (0 !== currentIndex) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex -= 1;
      temporaryValue = array[currentIndex];
      array[currentIndex] = array[randomIndex];
      array[randomIndex] = temporaryValue;
    }

    return array;
  }
}])
.service('$shuffledCopy', ["$isArray", "$shuffle", function ($isArray, $shuffle) {
  return function (array) {
    if(!$isArray(array)) {
      return false;
    }
    return $shuffle(array.slice());
  }
}])
.service('$random', ["$asNumber", "$isNumber", "$round", function ($asNumber, $isNumber, $round) {
  return function (min, max, precision) {
    min = $asNumber(min, 0);
    max = $asNumber(max, 1);

    var
    v = min + (Math.random() * (max - min));

    if ($isNumber(precision)) {
      v = $round(v, precision);
    }

    return v;
  }
}])
.service('$randomPluck', ["$isArray", "$clamp", "$random", "$asNumber", "$shuffledCopy", function ($isArray, $clamp, $random, $asNumber, $shuffledCopy) {
  return function (array, items, alwaysArray) {
    if(!$isArray(array)) {
      return false;
    }

    items = $clamp($asNumber(items, 1), 1);

    if(items === 1 && !alwaysArray) {
      return array[Math.floor($random(0, array.length))];
    }
    else {
      return $shuffledCopy(array).slice(0, items);
    }
  }
}])
.service('$uuid', function () {
  var nonce = 1;
  return function () {
    return nonce++;
  };
});

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.guest.contact', {
      url: '/contact',
      templateUrl: 'state/guest/contact.html',
      controller: 'AppGuestContactCtrl as $contact',
      data: {
        title: 'Contact Us',
        description: 'Get in touch with our support team.'
      }
    });
}])
.controller('AppGuestContactCtrl', ["$scope", "$dirtyForm", "$modalMessage", "$randomEmail", "$randomWords", function ($scope, $dirtyForm, $modalMessage, $randomEmail, $randomWords) {

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    if(!m) {
      m = this.model = {};
    }

    m.name = ident.toString();
    m.email = ident.toEmail();
    m.subject = $randomWords(10);
    m.message = $randomWords(30);
    m.$wasPrefilled = true; // mark so view can respond

    $dirtyForm(form);
  };

  this.submit = function (event, form) {
    form.$setSubmitted();
    $modalMessage('Contact feature is coming soon', 'Coming Soon');
  };

  this.reset = function (event, form) {
    delete this.model;
  };
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.guest.forgot', {
      url: '/forgot',
      templateUrl: 'state/guest/forgot.html',
      controller: 'AppGuestForgotCtrl as $forgot',
      data: {
        title: 'Forgot Password',
        description: 'Recover your account access.'
      }
    });
}])
.controller('AppGuestForgotCtrl', ["$scope", "$modalMessage", "$dirtyForm", "$randomEmail", function ($scope, $modalMessage, $dirtyForm, $randomEmail) {

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    if(!m) {
      m = this.model = {};
    }

    m.email = ident.toEmail();
    m.$wasPrefilled = true; // mark so view can respond

    $dirtyForm(form);
  };

  this.submit = function (event, form) {
    form.$setSubmitted();
    $modalMessage('Forgot-password feature is coming soon', 'Coming Soon');
  };

  this.reset = function (event, form) {
    delete this.model;
  };
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.guest.index', {
      url: '/',
      templateUrl: 'state/guest/index.html',
      controller: 'AppGuestIndexCtrl',
      data: {
        hideTabTitle: true,
        title: 'Home',
        description: 'Click around the links above'
      }
    });
}])
.controller('AppGuestIndexCtrl', ["$scope", function ($scope) {
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.guest.login', {
      url: '/login',
      templateUrl: 'state/guest/login.html',
      controller: 'AppGuestLoginCtrl as $login',
      data: {
        title: 'Login',
        description: 'Enter your login credentials'
      }
    });
}])
.controller('AppGuestLoginCtrl', ["$scope", "$auth", "$guestOnly", function ($scope, $auth, $guestOnly) {

  $guestOnly($scope);

  this.submit = function (event, form) {
    form.$setSubmitted();
    return $auth.login(this.model)
      .catch((function (err) {
        if(this.model) {
          delete this.model.password; // clear password field
        }
        return err;
      }).bind(this));
  };
  this.reset = function (event, form) {
    delete this.model;
  };
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.guest.signup', {
      url: '/signup',
      templateUrl: 'state/guest/signup.html',
      controller: 'AppGuestSignupCtrl as $signup',
      data: {
        title: 'Signup',
        description: 'Create a new account'
      }
    });
}])
.controller('AppGuestSignupCtrl', ["$scope", "$dirtyForm", "$guestOnly", "$auth", "$randomEmail", "$randomWords", "ErrorValidation", function ($scope, $dirtyForm, $guestOnly, $auth, $randomEmail, $randomWords, ErrorValidation) {

  $guestOnly($scope);

  this.quickFill = function (form) {
    var
    m = this.model,
    ident = $randomEmail();

    if(!m) {
      m = this.model = {};
    }

    m.name = ident.toString();
    m.email = ident.toEmail();
    m.password = $randomWords();
    m.passwordConfirm = String(m.password);
    m.$wasPrefilled = true; // mark so view can respond

    $dirtyForm(form);
  };

  this.submit = function (event, form) {
    form.$setSubmitted();
    return $auth.signup(this.model)
      .catch(function (err) {
        if(ErrorValidation.is(err)) {
          err.gradeForm($scope, form);
        }
        return err;
      });
  };
  this.reset = function (event, form) {
    delete this.model;
  };
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.user.dashboard', {
      url: '/dashboard',
      templateUrl: 'state/user/dashboard.html',
      controller: 'AppUserDashboardCtrl',
      data: {
        title: 'Dashboard',
        description: 'Account overview'
      }
    });
}])
.controller('AppUserDashboardCtrl', ["$scope", function ($scope) {
}]);

angular.module('coordinate-vx')
.config(["$stateProvider", function ($stateProvider) {
  $stateProvider
    .state('app.user.settings', {
      url: '/settings',
      templateUrl: 'state/user/settings.html',
      controller: 'AppUserSettingsCtrl',
      data: {
        title: 'Settings',
        description: 'Configuration for your account'
      }
    });
}])
.controller('AppUserSettingsCtrl', ["$scope", function ($scope) {
}]);
