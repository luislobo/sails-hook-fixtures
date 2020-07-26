const Sails = require('sails').Sails
const path = require('path')
const debug = require('debug')('sails-hook-fixtures:sailsHelper')
const resetCache = require('resnap')()
const _ = require('lodash')

async function loadSails (fixtures) {
  debug('loadSails', fixtures)
  if (!fixtures) {
    resetCache();
    fixtures = require('./fixtures')
  }

  return new Promise((resolve, reject) => {
    // Try to lift
    new Sails().load({
      appPath: path.join(__dirname, 'sampleApp'),
      hooks: {
        fixtures: require('../../lib'),
        grunt: false,
        views: false,
        blueprints: false
      },
      log: {
        level: 'silent'
      },
      datastores: {
        default: {
          adapter: 'sails-mongo',
          host: 'localhost',
          port: 27017,
          database: 'sails-hook-fixtures-testdb'
        }
      },
      models: {
        datastore: 'default',
        migrate: 'drop'
      },
      fixtures: fixtures
    }, function (err, sails) {
      if (err) {
        reject(err)
      }
      resolve(sails)
    })
  })
}

async function reloadSails (sails, fixtures) {
  await lowerSails(sails)
  resetCache()

  sails = await loadSails(fixtures)
  return sails
}

async function lowerSails (sails) {
  debug('lowerSails')
  return new Promise((resolve, reject) => {
    if (sails && _.isFunction(sails.lower)) {
      sails.lower({}, (err) => {
        if (err) {
          reject(err)
        }
        resolve()
      })
    }
    resolve()
  })
}

module.exports = {
  reloadSails,
  loadSails,
  lowerSails
}
