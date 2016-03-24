(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('directive/autobahn-control.html',
    '<div autobahn=""><div><label>Autobahn</label> <span class="text-success" ng-if="$autobahn.connected">Online</span> <span class="text-danger" ng-if="!$autobahn.connected">Offline</span></div><pre ng-if="$autobahn.connected" ng-bind="$autobahn.connectionInfo|json"></pre><div class="btn-group"><button class="btn btn-default" ng-if="$autobahn.connected" ng-click="inputTest()">Input Test</button> <button class="btn btn-default" ng-if="$autobahn.connected" ng-click="$autobahn.realTime.close()">Close</button> <button class="btn btn-default" ng-if="!$autobahn.connected" ng-click="$autobahn.realTime.open()">Open</button></div><table class="table table-condensed small"><thead><tr><th>Message</th><th class="text-right">Date</th></tr></thead><tbody><tr ng-repeat="entry in $autobahn.log" ng-class="entry.cls"><td ng-bind="entry.message"></td><td class="text-right" ng-bind="entry.date|date:\'short\'"></td></tr></tbody></table><ng-transclude></ng-transclude></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('directive/heart-beat-control.html',
    '<div heart-beat=""><label>Heart-beat</label> <span class="text-muted" ng-if="$heartBeat.isIdle">Idle</span> <span class="text-danger" ng-if="$heartBeat.isWarning">Warning</span> <span class="text-success" ng-if="$heartBeat.service.checking">Updating</span><pre>\n' +
    'lastCheck: {{$heartBeat.service.lastCheck | date:\'short\'}} (next check in {{$heartBeat.service.nextCheckInSec|duration:durationOpts}})\n' +
    'ttl:       {{$heartBeat.service.expireAt  | date:\'short\'}} (expires in {{$heartBeat.service.ttlSec | duration:durationOpts}})\n' +
    'idle:      {{$heartBeat.service.lastTouch | date:\'short\'}} (last touched {{$heartBeat.service.idleSec | duration:durationOpts}} ago)\n' +
    '</pre><div class="btn-group"><button class="btn btn-default" ng-click="$heartBeat.extend()">Update</button> <button class="btn btn-default" ng-click="$heartBeat.service.refresh()" ng-disabled="$heartBeat.service.checking">Refresh</button> <button class="btn btn-default" ng-click="$heartBeat.service.touch()">Touch</button></div><label><input type="checkbox" ng-model="$heartBeat.service.longTerm"> Long-term session</label></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('directive/navigation.html',
    '<div class="navbar navbar-default"><div class="container-fluid"><div class="navbar-header"><a class="navbar-brand" ui-sref="app.guest.index"><span class="glyphicon glyphicon-home"></span> Brand</a></div><ul class="nav navbar-nav"><li ui-sref-active="active"><a ui-sref="app.guest.contact">Contact</a></li></ul><ul class="nav navbar-nav navbar-right" heart-beat=""><li class="navbar-text navbar-text-dbl" ng-if="$heartBeat.isWarning"><div class="small text-right"><div class="text-danger"><b>Your session will expire in <code>{{$heartBeat.service.ttlSec|duration:durationOpts}}</code>.</b></div><div><a href="" ng-click="$heartBeat.extend()">Click here</a> <span>to extend it.</span></div></div></li><li ui-sref-active="active" ng-if="$app.authenticated"><a href="" ui-sref="app.user.settings"><small>{{$app.profile.name}}</small></a></li><li ng-if="$app.authenticated" user-notifications=""></li><li ng-if="$app.authenticated" uib-dropdown=""><a href="" uib-dropdown-toggle=""><span class="glyphicon glyphicon-menu-hamburger"></span></a><ul uib-dropdown-menu=""><li ui-sref-active="active"><a ui-sref="app.user.dashboard">Dashboard</a></li><li ui-sref-active="active"><a ui-sref="app.user.settings">Settings</a></li><li role="separator" class="divider"></li><li ui-sref-active="active"><a href="" ng-click="$navigation.logout($event)">Logout</a></li></ul></li><li ui-sref-active="active" ng-if="!$app.authenticated"><a ui-sref="app.guest.login">Login</a></li><li ui-sref-active="active" ng-if="!$app.authenticated"><a ui-sref="app.guest.signup">Signup</a></li></ul><ng-transclude></ng-transclude></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('directive/page-header.html',
    '<div class="page-header"><h1 ng-if="title">{{title}}</h1><p class="lead" ng-if="description">{{description}}</p><ng-transclude></ng-transclude></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('directive/user-notifications.html',
    '<li><ul class="nav navbar-nav"><li class="user-notifications" uib-dropdown="" autobahn="" ng-show="$autobahn.connected"><a href="" class="notifcation-button" uib-dropdown-toggle=""><span class="glyphicon glyphicon-inbox"></span> <span class="notification-count">69</span></a><div uib-dropdown-menu=""><p>Notifications will arrive here soon</p></div><ng-transclude></ng-transclude></li><li class="navbar-form small"><label><input type="checkbox" ng-model="pushSubscribe" ng-disabled="subscriptionChanging"> subscribe</label></li></ul></li>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('directive/validation-error.html',
    '<div class="help-block validation-error" ng-if="$validation.hasErrors"><ul ng-if="$validation.isArray" class="list-unstyled"><li ng-repeat="error in $validation.errors"><span class="small validation-error-message" ng-bind="error"></span></li></ul><div ng-if="$validation.isString"><span class="small validation-error-message" ng-bind="$validation.errors"></span></div><ng-transclude></ng-transclude></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('directive/validation-feedback.html',
    '<span class="form-control-feedback" ng-show="$formInput.model.$dirty"><span class="glyphicon glyphicon-remove form-control-feedback" ng-show="$formInput.model.$invalid"></span> <span class="glyphicon glyphicon-ok form-control-feedback" ng-show="$formInput.model.$valid"></span></span>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('modal/default.html',
    '<div class="modal-header" ng-class="modal.titleClass"><button ng-if="modal.dismissable" type="button" ng-click="$dismiss()" class="close">&times;</button><h4 ng-if="modal.title" ng-bind="modal.title" class="modal-title"></h4></div><div class="modal-body" ng-class="modal.bodyClass"><div ng-if="modal.text" class="text-center"><span ng-bind="modal.text"></span></div><div ng-if="modal.html" ng-bind-html="modal.html"></div><div ng-if="modal.template" ng-include="modal.template"></div></div><div class="modal-footer" ng-show="modal.buttons.length"><button class="btn" ng-repeat="button in modal.buttons" ng-class="button.classes" ng-click="button.click($event)" ng-bind="button.text"></button></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/app.html',
    '<div class="app-container"><navigation></navigation><div class="container"><page-header ph-title="$app.state.data.title" ph-description="$app.state.data.description" ng-if="$app.state.data.title"></page-header><div ui-view=""></div></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/guest.html',
    '<div class="app-guest-container"><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/user.html',
    '<div class="app-user-container"><div ui-view=""></div></div>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/guest/contact.html',
    '<form class="form" name="form" ng-submit="$contact.submit($event, form)" form-reset="$contact.reset($event, $form)"><div class="row"><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.name"><label class="control-label">Name</label> <input class="form-control" name="name" type="text" placeholder="Joe Smith" ng-model="$contact.model.name" required=""><validation-feedback></validation-feedback><validation-error></validation-error></div></div><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.email"><label class="control-label">E-mail address</label> <input class="form-control" name="email" type="email" placeholder="joe@smith.com" ng-model="$contact.model.email" required=""> <span class="help-block" ng-show="form.email.$dirty && form.email.$error.email">E-mail address is not valid.</span><validation-feedback></validation-feedback><validation-error></validation-error></div></div></div><div class="row"><div class="col-sm-12"><div class="form-group has-feedback" form-input="form.subject"><label class="control-label">Subject</label> <input class="form-control" name="subject" type="text" placeholder="Interested in your services." ng-model="$contact.model.subject"><validation-feedback></validation-feedback><validation-error></validation-error></div></div></div><div class="row"><div class="col-sm-12"><div class="form-group has-feedback" form-input="form.message"><label class="control-label">Message</label> <textarea class="form-control" name="message" rows="5" placeholder="Enter your message." ng-model="$contact.model.message" required=""></textarea><validation-feedback></validation-feedback><validation-error></validation-error></div></div></div><dl class="text-right"><div class="btn-group"><button type="button" class="btn btn-lg btn-default" ng-click="$contact.quickFill(form)">Quick Fill</button> <button type="submit" class="btn btn-lg btn-primary" ng-disabled="form.$invalid">Submit</button> <button type="reset" class="btn btn-lg btn-default" ng-disabled="!form.$dirty">Reset</button></div></dl></form>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/guest/forgot.html',
    '<form class="form" name="form" ng-submit="$forgot.submit($event, form)" form-reset="$forgot.reset($event, $form)"><div class="row"><div class="col-sm-12"><div class="form-group has-feedback" form-input="form.email"><label class="control-label">E-mail address</label> <input class="form-control" name="email" type="email" placeholder="joe@smith.com" ng-model="$forgot.model.email" required=""> <span class="help-block" ng-show="form.email.$dirty && form.email.$error.email">E-mail address is not valid.</span><validation-feedback></validation-feedback><validation-error></validation-error></div></div></div><div class="row"><div class="col-sm-12"><p>If you have forgotten the e-mail address you used, or no longer have access to it, please <a ui-sref="app.guest.contact">contact our support</a> to assist you in recovering your account.</p></div></div><dl class="text-right"><div class="btn-group"><button type="button" class="btn btn-lg btn-default" ng-click="$forgot.quickFill(form)">Quick Fill</button> <button type="submit" class="btn btn-lg btn-primary" ng-disabled="form.$invalid">Recover</button> <button type="reset" class="btn btn-lg btn-default" ng-disabled="!form.$dirty">Reset</button></div></dl></form><ul class="nav nav-pills"><li ui-sref-active="active"><a ui-sref="app.guest.login">Login</a></li><li ui-sref-active="active"><a ui-sref="app.guest.signup">Signup</a></li></ul>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/guest/index.html',
    '<h3 class="text-center">Guest Home Page</h3>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/guest/login.html',
    '<form class="form" name="form" ng-submit="$login.submit($event, form)" form-reset="$login.reset($event, $form)"><div class="row"><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.username"><label class="control-label">Username</label> <input class="form-control" name="username" type="text" placeholder="Enter your username" ng-model="$login.model.username" required=""><validation-feedback></validation-feedback><validation-error></validation-error></div></div><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.password"><label class="control-label">Password</label> <input class="form-control" name="password" type="password" placeholder="Enter your password" ng-model="$login.model.password" required=""><validation-feedback></validation-feedback><validation-error></validation-error></div></div></div><dl class="form-group text-right"><div class="checkbox pull-left text-left"><label><input type="checkbox" ng-model="$login.model.rememberMe"> <span>Remember my credentials</span></label><p class="help-block small">Only use this option if you\'re on a trusted computer.</p></div><div class="btn-group"><button type="submit" class="btn btn-lg btn-primary" ng-disabled="form.$invalid">Login</button> <button type="reset" class="btn btn-lg btn-default" ng-disabled="!form.$dirty">Reset</button></div><div class="clearfix"></div></dl></form><ul class="nav nav-pills"><li ui-sref-active="active"><a ui-sref="app.guest.signup">Signup</a></li><li ui-sref-active="active"><a ui-sref="app.guest.forgot">Forgot Password</a></li></ul>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/guest/signup.html',
    '<form class="form" name="form" ng-submit="$signup.submit($event, form)" form-reset="$signup.reset($event, $form)"><div class="row"><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.name"><label class="control-label">Name</label> <input class="form-control" name="name" type="text" placeholder="Joe Smith" ng-model="$signup.model.name" validation-input="" required=""><validation-feedback></validation-feedback><validation-error></validation-error></div></div><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.email"><label class="control-label">E-mail address</label> <input class="form-control" name="email" type="email" placeholder="joe@smith.com" ng-model="$signup.model.email" validation-input="" required=""> <span class="help-block" ng-show="form.email.$dirty && form.email.$error.email">E-mail address is not valid.</span><validation-feedback></validation-feedback><validation-error></validation-error></div></div></div><div class="row"><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.password"><label class="control-label">Password</label> <input class="form-control" name="password" type="password" placeholder="My super STRONG password!" ng-model="$signup.model.password" ng-minlength="8" validation-input="" required=""> <span class="help-block" ng-show="form.password.$dirty && form.password.$error.minlength">Must be between 8 and 128 characters. At least one upper case and/or special character is required.</span><validation-feedback></validation-feedback><validation-error></validation-error></div></div><div class="col-sm-6"><div class="form-group has-feedback" form-input="form.passwordConfirm"><label class="control-label">Confirm Password</label> <input class="form-control" name="passwordConfirm" type="password" placeholder="Confirm your password" ng-model="$signup.model.passwordConfirm" validation-input="" input-match="$signup.model.password" required=""> <span class="help-block" ng-show="form.passwordConfirm.$dirty && form.passwordConfirm.$error.match">This does not match your password.</span><validation-feedback></validation-feedback><validation-error></validation-error></div></div></div><dl class="text-right"><div class="pull-left text-left" ng-if="$signup.model.$wasPrefilled && !!$signup.model.password"><div><b><small>Generated Password:</small></b></div><code class="text-muted">{{$signup.model.password}}</code></div><div class="btn-group"><button type="button" class="btn btn-lg btn-default" ng-click="$signup.quickFill(form)">Quick Fill</button> <button type="submit" class="btn btn-lg btn-primary" ng-disabled="form.$invalid">Signup</button> <button type="reset" class="btn btn-lg btn-default" ng-disabled="!form.$dirty">Reset</button></div></dl></form><ul class="nav nav-pills"><li ui-sref-active="active"><a ui-sref="app.guest.login">Login</a></li><li ui-sref-active="active"><a ui-sref="app.guest.forgot">Forgot Password</a></li></ul>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/user/dashboard.html',
    '<heart-beat-control></heart-beat-control><hr><autobahn-control></autobahn-control>');
}]);
})();

(function(module) {
try {
  module = angular.module('coordinate-vx.tpl');
} catch (e) {
  module = angular.module('coordinate-vx.tpl', []);
}
module.run(['$templateCache', function($templateCache) {
  $templateCache.put('state/user/settings.html',
    '');
}]);
})();
