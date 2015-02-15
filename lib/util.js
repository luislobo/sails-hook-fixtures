/*global -Promise*/
var Promise = require('bluebird');
var _ = require('lodash');

function findAssociationIds (seed, key, sails) {
  //key is the name of the model in the fixture's collections
  var Model = sails.models[key];
  if (Model === undefined) {
    throw new Error('Undefined model ' + key);
  }
  var collection = seed.collections[key];
  var query = (collection instanceof Array ? {'name': seed.collections[key]} : seed.collections[key]);
  return Model.find(query)
  .then(function (results) {
    if (results.length === 0) {
      throw new Error('No models existed matching query: '+ JSON.stringify(query));
    }
    else {
      //pluck the ids, append them to the correct attribute and return the
      //object with the correct ids for further promise map iteration
      var ids = _.pluck(results, 'id');
      return ids;
    }
  }); //Model.find
}

function pluralize (name) {
  return name + 's';
}

function addAssociation (Model, seeds, sails) {
  sails.log.debug("Associate the following seeds: ");
  sails.log.debug(seeds);
  return Promise.map(seeds, function (seed) {
    //no associations are present, return as is
    if (seed.collections === undefined) {
      return seed;
    }
    else {
      //the collection keys resemble the models to which the associations belong
      var collectionkeys = Object.keys(seed.collections);
      sails.log.debug(collectionkeys);
      //construct object of promises to put in props
      var props = {};
      _(collectionkeys).each(function (key) {
        props[pluralize(key)] = findAssociationIds(seed, key, sails);
      });
      return Promise.props(props)
      .then(function (collections) {
        //got a composite collections object, merge it with seed and return
        sails.log.debug("Got collections: ");
        sails.log.debug(collections);
        delete seed.collections;
        return _.merge(seed, collections);
      });
    }
  });
}

module.exports.create = function (Model, fixtures, sails) {
  return Model.find()
  .then(function (results) {
    if (results.length > 0) {
      throw new Error('Model not empty, skipping fixture');
    }
    else {
      return addAssociation(Model, fixtures, sails)
      .then(function (populatedFixtures) {
        sails.log.debug(populatedFixtures);
        return Model.create(populatedFixtures);
      });
    }
  });
};
