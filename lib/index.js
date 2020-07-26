/**
 * Some code adapted from a permissions-hook in the making:
 * https://github.com/tjwebb/sails-permissions/blob/master/api/hooks/permissions-api/index.js#L26
 */
const Promise = require('bluebird')
const util = require('./util')
const _ = require('lodash')
const debug = require('debug')('sails-hook-fixtures:index')

function NoFixturesError () {}

NoFixturesError.prototype = Object.create(Error.prototype)

async function singleFixture (name, obj, hook, opts, sails) {
  debug('singleFixture', name, obj, hook, opts)
  if (obj.length === 0) {
    sails.log.verbose('Skipping empty fixtures list for ' + name)
    sails.emit(hook)
    return
  }
  sails.log.verbose('Installing ' + obj.length + ' fixtures for ' + name)
  const Model = sails.models[name.toLowerCase()] // can be undefined
  if (Model === undefined) {
    // fail silently
    sails.log.info('Undefined model `' + name + '`')
    sails.emit(hook)
  } else {
    // add the fixture name to options for easy access
    // add the fixture name to options for easy access
    opts.modelName = name

    // try to create the fixtures
    try {
      const created = await util.create(Model, obj, opts, sails)
      debug('created', created)
    } catch (err) {
      sails.log.error('Got error with ' + name + ' fixture: ' + err)
    } finally {
      debug({ hook })
      sails.emit(hook)
    }
  }
}

function emptyExistingCollections (opts, sails) {
  debug('emptyExistingCollections', opts)
  return Promise.map(opts.empty, function (name) {
    const Model = sails.models[name.toLowerCase()] // can be undefined
    if (Model === undefined) {
      // fail silently
      sails.log.info('Undefined model for emptying: `' + name + '`')
      return
    }
    // add the fixture name to options for easy access
    opts.modelName = name
    return util.empty(Model, opts, sails)
  })
}

/*
 * The real workhorse of installing fixtures starts here. Re-made with promises,
 * Should be a whole lot easier to interpret now
 */

async function installFixtures (sails, cb) {
  debug('installFixtures')
  // when the last fixture has been injected, the `loaded` hook will be called,
  // to which we subscribe the callback function of the hook
  sails.after('hook:fixture:loaded', function () {
    cb()
  })

  const fixtures = sails.config.fixtures
  if (fixtures === undefined) {
    // go silently instead of throwing error
    sails.log.info('Unable to install fixtures: no config.fixtures is defined')
    sails.emit('hook:fixture:loaded')
    return
  }

  // initialize options
  const opts = {
    overwrite: fixtures.overwrite || [],
    empty: fixtures.empty || []
  }

  /**
   * empty existing collections first
   */
  try {
    await emptyExistingCollections(opts, sails)

    /**
     * If we have no 'order' attribute, no need for installing fixtures
     */
    if (!fixtures.order) {
      // continue silently
      sails.log.info('No order specified, skipping fixtures')
      debug('No order specified, skipping fixtures')
      sails.emit('hook:fixture:loaded')
      return
    }
    /**
     * Each of the fixtures defined in the order has to be injected. This is done using
     * the sails.emit(...) function, caught by sails.after(...).
     * The function singleFixture installs the fixtures of one model, then emits that it's done
     * using the provided hook, after which the next in line fixture will be installed
     */
    const hooks = _.map(_.tail(fixtures.order), function (name) { return name })
    debug('hooks', hooks)
    _.each(hooks, function (name, idx) {
      // if this is the last value, set the hook to loaded
      const next = (hooks.length === idx + 1 ? 'loaded' : hooks[idx + 1])
      sails.after('hook:fixture:' + name, async function () {
        await singleFixture(name, fixtures[name], 'hook:fixture:' + next, opts, sails)
      })
    })

    const first = fixtures.order[0]
    if (fixtures.order.length > 1) {
      const next = fixtures.order[1]
      await singleFixture(first, fixtures[first], 'hook:fixture:' + next, opts, sails)
    } else {
      await singleFixture(first, fixtures[first], 'hook:fixture:loaded', opts, sails)
    }

  } catch (err) {

    sails.log.error(err)
    sails.emit('hook:fixture:loaded')
  }
}

module.exports = function (sails) {
  return {
    configure: function () {
      debug('configure', 'Configuring fixtures')
      sails.log.silly('Configuring fixtures')
    },

    initialize: async function (cb) {
      debug('initialize', 'Initializing fixtures')
      // If no ORM, do nothing
      if (!sails.hooks.orm) {
        return cb()
      }
      sails.after('hook:orm:loaded', function () {
        debug('hook:orm:loaded', 'Initializing fixtures')
        sails.log.verbose('initializing fixtures')
        installFixtures(sails, cb)
      })
    }
  }
}
