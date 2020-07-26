const _ = require('lodash')
const fixtures = require('./helpers/fixtures')
const chai = require('chai')
chai
  .use(require('chai-as-promised'))

const { reloadSails, lowerSails } = require('./helpers/sailsHelper')

describe('Test overwriting ::', function () {
  let sails

  before(async () => {
    sails = await reloadSails(sails, fixtures)
  })
  after(async () => {
    return lowerSails(sails)
  })

  it('Should create new User models when reloading', async function () {

    const results = await sails.models.user.find()
    const idsBefore = _.map(results, 'id')
    sails = await reloadSails(sails)
    const results2 = await sails.models.user.find()
    const idsAfter = _.map(results2, 'id')
    idsAfter.should.not.equal(idsBefore)
  })
})
