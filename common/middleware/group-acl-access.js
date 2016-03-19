'use strict';

var
Q = require('q'),
_ = require('lodash'),
compose = require('composable-middleware'),
format = require('util').format,
log = require('../components/log'),
aclAccess = require('./acl-access'),
ModelGroup = require('../api/group/group.model'),
AuthenticationError = require('../components/error-authentication');

module.exports = function (options) {
  options = options || {};

  var
  propertyIsRealCreator = options.propertyIsGroupCreator||'userIsGroupCreator',
  propertyUserGroup = options.propertyUserGroupRole||'userGroupRole',
  propertyUser  = options.propertyUser||'user',
  propertyGroup = options.propertyGroup||'group',
  requirements  = options.require||false;

  return compose()
    .use(function (req, res, next) {

      var
      user  = req[propertyUser],
      group = req[propertyGroup];

      if(!user) {
        return next(new AuthenticationError('Group ACL middle-ware requires authentication.'));
      }
      if(!group || !_.isFunction(group.getRoleUser)) {
        return next(new AuthenticationError('Group ACL middle-ware requires group model.'));
      }

      req[propertyIsRealCreator] = group.createdBy.equals(user._id);

      // get the role of user on requested group
      group.getRoleUser(user, function (err, role) {
        if(err) return next(err);

        // pass this along to acl access (preconfigured to expect this key)
        req[propertyUserGroup] = role;

        // trigger acl access check
        next();
      });
    })
    .use(aclAccess({
      subject: function (req) { // format to proper subject for acl checking
        return ModelGroup.getRoleACLKey(req[propertyUserGroup]);
      },
      object: propertyGroup,
      require: requirements
    }));
};