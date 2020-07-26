const assert = require('assert')
const _ = require('lodash')
const chai = require('chai')
chai
  .use(require('chai-as-promised'))

const { reloadSails, lowerSails } = require('./helpers/sailsHelper')

describe('Test with weird fixtures ::', function () {
  let sails

  after(async () => {
    return lowerSails(sails)
  })

  it('Should handle a missing "order" attribute', async () => {
    try {
      sails = await reloadSails(sails, {})
    } catch (err) {
      assert(false, 'Should not throw')
    }
  })
})

describe('Test emptying ::', function () {
  let sails

  after(async () => {
    return lowerSails(sails)
  })

  it('Should empty the Pet collection', async () => {
    sails = await reloadSails(sails, { empty: ['Pet'] })
    const pets = await sails.models.pet.find()
    pets.should.have.length(0)
  })
})
