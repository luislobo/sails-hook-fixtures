/* global before, after, describe, it */
const Sails = require('sails').Sails
const fixtures = require('./helpers/fixtures')

const { lowerSails } = require('./helpers/sailsHelper')

describe('Test without models ::', async () => {
  // app wrapper
  let sails

  // before, lift sails
  before(async () => {
    return new Promise((resolve, reject) => {
      // Try to lift
      new Sails().load({
        hooks: {
          fixtures: require('../lib'),
          grunt: false
        },
        log: {
          level: 'error'
        },
        fixtures: fixtures
      }, function (err, _sails) {
        if (err) {
          reject(err)
        }
        sails = _sails
        resolve()
      })
    })
  })

  after(async () => {
    return lowerSails(sails)
  })

  it('should not crash when there are no models', async () => {
    return true
  })
}).timeout(10000)

describe('Test without fixtures ::', async () => {
  // app wrapper
  let sails

  // before, lift sails
  before(async () => {
    return new Promise((resolve, reject) => {
      // Try to lift
      new Sails().load({
        hooks: {
          fixtures: require('../lib'),
          grunt: false
        },
        log: {
          level: 'error'
        }
      }, function (err, _sails) {
        if (err) { return reject(err) }
        sails = _sails
        return resolve()
      })
    })
  })

  after(async () => {
    return lowerSails(sails)
  })

  it('should not crash when there are no fixtures', function (done) {
    return done()
  })
}).timeout(10000)
