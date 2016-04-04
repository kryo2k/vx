angular.module('vx')
.service('$auth', function ($q, $authPersist, User) {
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
        $authPersist.set(data.token, data.expireDate);
        return this.profile; // return existing profile
      }).bind(this));
  };

  this.setProfile = function (profile) {
    if(angular.isObject(profile)) {
      lastProfile = profile;
    }
    else {
      lastProfile = false;
    }

    return this;
  };

  this.reloadProfileSoft = function () {
    return User.getProfile().$promise
      .then((function (profile) {
        this.setProfile(profile);
        return lastProfile;
      }).bind(this))
      .catch(function (err) { // clean up on any errors here.
        this.setProfile(null);
        $authPersist.clear();
        return false;
      });
  };

  this.reloadProfile = function () {
    return markLoading(this.reloadProfileSoft());
  };

  this.loadUserProfile = function (token) {
    return this.reloadProfile();
  };

  this.signup = function (model) {
    return markLoading(
      User.signup(model).$promise
        .then(function (data) {
          return $authPersist.set(data.token, data.expireDate);
        })
        .then(this.loadUserProfile.bind(this))
    );
  };

  this.login = function (model) {
    return markLoading(
      User.login(model).$promise
        .then(function (data) {
          return $authPersist.set(data.token, data.expireDate);
        })
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
})
.run(function ($auth, $realTime) {
  $realTime.subscribe('vx.user.update', function (args, meta) {
    switch(args[0]) {
      case 'profile': $auth.setProfile(args[1]); break;
    }
  });

  $realTime.subscribe('vx.user.logout', function (args, meta) {
    $auth.logout();
  });
});
