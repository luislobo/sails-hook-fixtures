/*global before, after, describe, it*/
var Sails = require('sails').Sails;
var fixtures = require('./helpers/fixtures');

describe('Test without models ::', function () {
  //app wrapper
  var sails;

  //before, lift sails
  before(function(done) {
    console.log(__dirname);
    //set 10sec timeout
    this.timeout(10000);

    //Try to lift
    new Sails().load({
      hooks: {
        'fixtures': require('../lib'),
        'grunt': false
      },
      log: {
        level: 'error'
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

  it('should not crash when there are no models', function () {
    return true;
  });
});

describe('Test without fixtures ::', function () {
  //app wrapper
  var sails;

  //before, lift sails
  before(function(done) {
    console.log(__dirname);
    //set 10sec timeout
    this.timeout(10000);

    //Try to lift
    new Sails().load({
      hooks: {
        'fixtures': require('../lib'),
        'grunt': false
      },
      log: {
        level: 'error'
      },
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

  it('should not crash when there are no fixtures', function () {
    return true;
  });
});
