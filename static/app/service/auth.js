angular.module('coordinate-vx')
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

  this.login = function (username, password) {
    return markLoading(
      User.login({ username: username, password: password }).$promise
        .then((function (data) {
          $authPersist.set(data.token); // set the token for this user
          return this.reloadProfile();
        }).bind(this))
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
});