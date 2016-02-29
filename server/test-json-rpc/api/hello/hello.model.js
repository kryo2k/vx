'use strict';

var
mongoose = require('mongoose'),
Schema = mongoose.Schema;

var
HelloSchema = new Schema({
  name: String,
  message: {
    type: String,
    required: true
  },
  created: {
    type: Date,
    default: Date.now
  }
});

HelloSchema.statics = {
};

HelloSchema.methods = {
};

module.exports = mongoose.model('Hello', HelloSchema);
