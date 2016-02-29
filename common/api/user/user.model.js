'use strict';

var
mongoose = require('mongoose'),
Schema = mongoose.Schema;

var
UserSchema = new Schema({
  name: String,
  email: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    required: true,
    default: Date.now
  }
});

UserSchema.statics = {
};

UserSchema.methods = {
};

module.exports = mongoose.model('User', UserSchema);
