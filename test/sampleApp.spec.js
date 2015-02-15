/*global before, after, describe, it*/
var Sails = require('sails').Sails;
var fixtures = require('./helpers/fixtures');
var path = require('path');
var fs = require('fs');

describe('Test with models ::', function () {
  //app wrapper
  var sails;
  //before, lift sails
  before(function(done) {
    //set 10sec timeout
    this.timeout(10000);

    //link node modules to the app dir
    try {
      fs.symlinkSync(path.join(__dirname, '../node_modules'), path.join(__dirname, 'helpers/sampleApp/node_modules'), 'file');
    } catch (e1) {
      if (e1.code !== 'EEXIST') {
        throw e1;
      }
    }

    //Try to lift
    new Sails().load({
      appPath: path.join(__dirname, 'helpers/sampleApp'),
      hooks: {
        'fixtures': require('../lib'),
        'grunt': false,
        'views': false,
        'blueprints': false,
      },
      log: {
        level: 'silly'
      },
      connections: {
        test: {
          adapter: 'sails-mongo',
          host:'localhost',
          port: 27017,
          database: 'sails-hook-fixtures-testdb'
        },
      },
      models: {
        connection: 'test',
        migrate: 'drop'
      },
      fixtures: fixtures
    }, function (err, _sails) {
      if (err) { return done(err); }
      sails = _sails;
      return done();
    });
  });

  after(function (done) {
    if (sails) {
      return sails.lower(done);
    }
    //otherwise, just done
    return done();
  });

  it('Should have made two user documents', function () {
    var User = sails.models.user;
    User.find()
    .then(function (results) {
      results.should.have.length(2);
    });
  });

  it('Should have made two group documents', function () {
    var Group = sails.models.group;
    Group.find()
    .then(function (results) {
      results.should.have.length(2);
    });
  });

  it('Should have made two role documents', function () {
    var Role = sails.models.role;
    Role.find()
    .then(function (results) {
      results.should.have.length(2);
    });
  });

});
