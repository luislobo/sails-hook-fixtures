const assert = require('assert')
const fixtures = require('./helpers/fixtures')
const _ = require('lodash')
const chai = require('chai')
chai.should()
chai
  .use(require('chai-as-promised'))

const { reloadSails, lowerSails } = require('./helpers/sailsHelper')

describe('Test with one empty fixture :: ', () => {
  let sails

  before(async () => {
    delete require.cache[require.resolve('./helpers/fixtures')]
    const fixtures = _.cloneDeep(require('./helpers/fixtures'))
    // empty roles to test empty list
    fixtures.Role = []

    sails = await reloadSails(sails, fixtures)
  })
  after(async () => {
    return lowerSails(sails)
  })

  it('Should disregard an empty fixture array', function () {
  })
})

describe('Test with models ::', () => {

  let sails
  before(async () => {
    delete require.cache[require.resolve('./helpers/fixtures')]
    const fixtures = require('./helpers/fixtures')
    sails = await reloadSails(sails, fixtures)
  })
  after(async () => {
    return lowerSails(sails)
  })

  it('Should have made three user documents', async function () {
    const results = await sails.models.user.find()
    results.should.be.an('array').to.have.length(3)

  })

  it('Should have made two group documents', async function () {
    const results = await sails.models.group.find()
    results.should.have.length(2)
  })

  it('Should have made three role documents', async function () {
    const results = await sails.models.role.find()
    results.should.have.length(3)
  })

  it('Should have made two company documents', async function () {
    const results = await sails.models.company.find()
    results.should.have.length(2)
  })

  it('Should have added an association to group "admin" to user "admin"', async function () {
    const admin = await sails.models.user.findOne({ username: 'admin' }).populate('groups')
    assert(_.some(admin.groups, { name: 'Admin group' }))
  })

  it('Should have added roles to all users', async function () {
    const users = await sails.models.user.find().populate('roles')
    const roles = _.map(users, function (user) {
      return user.roles
    })
    assert(_.some(roles, function (role) {
      return !_.isEmpty(role)
    }))
  })

  it('Should Pikachu is owned by Ash Ketchum', async function () {
    const Pet = sails.models.pet
    const pikachu = await Pet.findOne({ name: 'Pikachu' }).populate('owner')
    pikachu.owner.username.should.equal('Ash Ketchum')
  })

  it('Should say "Pallet Town" is Ash Ketchum\'s hometown', async function () {
    const ash = await sails.models.user.findOne({ username: 'Ash Ketchum' }).populate('home')
    ash.home.name.should.equal('Pallet Town')
  })
}).timeout(10000)
