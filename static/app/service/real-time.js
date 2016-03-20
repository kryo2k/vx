angular.module('coordinate-vx')
.config(function ($wampProvider, WAMP_URL, WAMP_REALM) {
  $wampProvider.init({
    url: WAMP_URL,
    realm: WAMP_REALM,
    authmethods: ['wampcra']
  });
})
.service('$realTime', function ($wamp, $authPersist, $rootScope) {

  var
  running = false;

  // locally bind these functions
  this.subscribe = $wamp.subscribe.bind($wamp);
  this.publish   = $wamp.publish.bind($wamp);
  this.register  = $wamp.register.bind($wamp);
  this.call      = $wamp.call.bind($wamp);

  this.start = function () {
    if(running) return this;
    running = true;
    $wamp.setAuthId($authPersist.token); // token is our auth id
    $wamp.open();
    return this;
  };

  this.stop = function () {
    if(!running) return this;
    running = false;
    $wamp.close();
    return this;
  };

  $rootScope.$on("$wamp.onchallenge", function (event, data) {
    console.log('getting challenge request:', data.method);

      // if (data.method === "myauth"){
      //     return data.promise.resolve(autobahn.auth_cra.sign('someSecret', data.extra.challenge));
      //  }
      //  //You can also access the following objects:
      //  // data.session
      //  //data.extra
  });

  // $rootScope.$on("$wamp.open", function (event, session) {
  //   console.log('We are connected to the WAMP Router!', arguments);
  // });

  // $rootScope.$on("$wamp.close", function (event, data) {
  //   console.log('We are disconnected from the WAMP Router!', arguments);
  //   $scope.reason = data.reason;
  //   $scope.details = data.details;
  // });

})
.run(function ($realTime, $authWatch) {
  $authWatch((function (authenticated) { !!authenticated ? this.start() : this.stop(); }).bind($realTime));
});
