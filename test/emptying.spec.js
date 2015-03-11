/* global before, after, describe, it */
var Sails = require('sails').Sails;
var fixtures = require('./helpers/fixtures');
var path = require('path');
var fs = require('fs');
var assert = require('assert');
//app wrapper
var sails;

function loadSails (seed, done) {
  console.log('Loading sails');
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
      level: 'info'
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
    fixtures: seed
  }, function (err, _sails) {
    if (err) { return done(err); }
    sails = _sails;
    return done();
  });
}

function lowerSails (done) {
  console.log('Lowering sails');
  //unlink the node_modules symlink
  try {
    fs.unlinkSync(path.join(__dirname, 'helpers/sampleApp/node_modules'));
  } catch (e0) {
    if (e0.code !== 'EEXIST') {
      throw e0;
    }
  }
  if (sails) {
    return sails.lower(done);
  }
  //otherwise, just done
  return done();
}

describe('Test with weird fixtures ::', function () {
  before(function () {
    this.timeout(10000);
  });
  after(function (done) {
    lowerSails(done);
  });

  it('Should handle a missing "order" attribute', function (done) {
    var fixtures = {};
    assert.doesNotThrow(function () {
      loadSails(fixtures, done);
    }, 'Sails failed to load');
  });
});

describe('Test overwriting ::', function () {
  //before, lift sails
  before(function(done) {
    //set 10sec timeout
    this.timeout(10000);

    //load, then lower, then load again to overwrite the user model
    loadSails(fixtures, done);
  });

  after(function (done) {
    lowerSails(done);
  });

  it('Should empty the Pet collection', function (done) {
    var Pet = sails.models.pet;
    lowerSails(function () {
      //load sails with custom fixture that empties Pet collection
      loadSails({empty: ['Pet']}, function () {
        //now, pet should be empty
        Pet.find()
        .then(function (pets) {
          pets.should.have.length(0);
          done();
        });
      });
    });
  });
});
