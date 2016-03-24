/**
 * Some code adapted from a permissions-hook in the making:
 * https://github.com/tjwebb/sails-permissions/blob/master/api/hooks/permissions-api/index.js#L26
 */
var util = require('./util');
var _ = require('lodash');

function NoFixturesError () {}
NoFixturesError.prototype = Object.create(Error.prototype);

function singleFixture (name, obj, hook, opts, sails) {
  if (obj.length === 0) {
    sails.log.verbose('Skipping empty fixtures list for ' + name);
    sails.emit(hook);
    return;
  }
  sails.log.verbose('Installing ' + obj.length + ' fixtures for ' + name);
  var Model = sails.models[name.toLowerCase()]; //can be undefined
  if (Model === undefined) {
    //fail silently
    sails.log.info('Undefined model `' + name + '`');
    sails.emit(hook);
    return;
  }
  else {
    //add the fixture name to options for easy access
    opts.model_name = name;

    //try to create the fixtures
    return util.create(Model, obj, opts, sails)
    .catch(function (err) {
      sails.log.error('Got error with ' + name + ' fixture: ' + err);
    })
    .finally(function () {
      sails.emit(hook);
    });
  }
}

function emptyExistingCollections (opts, sails) {
  return Promise.map(opts.empty, function (name) {
    var Model = sails.models[name.toLowerCase()]; //can be undefined
    if (Model === undefined) {
      //fail silently
      sails.log.info('Undefined model for emptying: `' + name + '`');
      return;
    }
    //add the fixture name to options for easy access
    opts.model_name = name;
    return util.empty(Model, opts, sails);
  });
}

/*
 * The real workhorse of installing fixtures starts here. Re-made with promises,
 * Should be a whole lot easier to interpret now
 */

function installFixtures (sails, cb) {
  var fixtures = sails.config.fixtures;
  if (fixtures === undefined) {
    //go silently instead of throwing error
    sails.log.info('Unable to install fixtures: no config.fixtures is defined');
    return cb();
  }

  //initialize options
  var opts = {
    overwrite: fixtures.overwrite || [],
    empty: fixtures.empty || []
  };

  //when the last fixture has been injected, the `loaded` hook will be called,
  //to which we subscribe the callback function of the hook
  sails.after('hook:fixture:loaded', function () {
    cb();
  });


  /**
   * empty existing collections first
   */
  emptyExistingCollections (opts, sails)
  .then(function () {

    /**
     * If we have no 'order' attribute, no need for installing fixtures
     */
    if (!fixtures.order) {
      //continue silently
      sails.log.info('No order specified, skipping fixtures');
      sails.emit('hook:fixture:loaded');
      return;
    }
    /**
     * Each of the fixtures defined in the order has to be injected. This is done using
     * the sails.emit(...) function, caught by sails.after(...).
     * The function singleFixture installs the fixtures of one model, then emits that it's done
     * using the provided hook, after which the next in line fixture will be installed
     */
    var hooks = _.map(_.rest(fixtures.order), function (name) { return name; });
    _.each(hooks, function (name, idx) {
      //if this is the last value, set the hook to loaded
      var next = (hooks.length === idx+1 ? 'loaded' : hooks[idx+1]);
      sails.after('hook:fixture:'+name, function () {
        singleFixture(name, fixtures[name], 'hook:fixture:'+next, opts, sails);
      });
    });

    var first = fixtures.order[0];
    if (fixtures.order.length > 1) {
      var next = fixtures.order[1];
      singleFixture(first, fixtures[first], 'hook:fixture:'+next, opts, sails);
    }
    else {
      singleFixture(first, fixtures[first], 'hook:fixture:loaded', opts, sails);
    }
  })
  .catch(function (err) {
    sails.log.error(err);
    sails.emit('hook:fixture:loaded');
  });
}

module.exports = function(sails) {
  return {
    configure: function () {
      sails.log.silly('Configuring fixtures');
      //global variables
      global.Promise = require('bluebird');
      global._ = require('lodash');
    },

    initialize: function (cb) {
      sails.after('hook:orm:loaded', function () {
        sails.log.verbose('initializing fixtures');
        installFixtures(sails, cb);
      });
    }
  };
};
