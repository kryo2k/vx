'use strict';

var
_  = require('lodash'),
Q  = require('q');

function qFlushModels() {
  return Array.prototype.slice.call(arguments)
    .reduce(function(p, model){
      return p.then(function (output) {
        return Q.nfcall(model.remove.bind(model), {})
          .then(function (result) {
            if(!result) return 0;
            if(_.isArray(result)) return result[0];
            if(result.result) {
              return result.result.n;
            }

            return 0;
          })
          .then(function (flushed) {
            output.push(flushed);
            return output;
          });
      })
    }, Q([]));
}

function qSeedModels(models, seed) {
  if(!Array.isArray(models) || !models.length) return Q.reject(new Error('No models to seed.'));
  if(!Array.isArray(seed) || !models.length)   return Q.reject(new Error('No model data to seed.'));
  if(models.length !== seed.length)            return Q.reject(new Error('Model length does not match seed length.'));

  return models.reduce(function (promise, model, index) {

    promise = promise.then(function(output) { // create output for seeded results
      output.push([]);
      return output;
    });

    return (seed[index]||[]).reduce(function (promise, spec) {
      return promise.then(function(output) {
        return Q.nfcall(model.create.bind(model), spec)
          .then(function (created) {
            output[index].push(created);
            return output;
          });
      });
    }, promise);
  }, Q([]));
}


exports.qFlushModels = qFlushModels;
exports.qSeedModels = qSeedModels;