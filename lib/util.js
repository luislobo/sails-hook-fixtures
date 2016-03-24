/*global -Promise*/
var Promise = require('bluebird');
var _ = require('lodash');

function findAssociationIds (seed, key, collection, sails, singular) {
  var Model = sails.models[key];
  if (Model === undefined) {
    throw new Error('Undefined model ' + key);
  }
  //if the collection is of the form of an Array, assume we have to look for attribute 'name'
  //else, it will just be regular query
  var query = (collection instanceof Array ? {'name': collection} : collection);
  return Model.find(query)
  .then(function (results) {
    if (results.length === 0) {
      throw new Error('No models existed matching query: '+ JSON.stringify(query));
    }
    else {
      //pluck the ids, append them to the correct attribute and return the
      //object with the correct ids for further promise map iteration
      var ids = _.map(results, 'id');
      if (singular === true) {
        return ids[0];
      }
      else {
        return ids;
      }
    }
  }); //Model.find
}

/**
* Search the alias for a given collection
*/
function getAlias(Model, association_name) {
  var collection = _.find(Model.associations, function (assoc) {
    return assoc.collection === association_name;
  });
  var model = _.find(Model.associations, function (assoc) {
    return assoc.alias === association_name;
  });
  if (collection === undefined && model === undefined) {
    throw new Error('non-existing association: ' + association_name);
  }
  return collection ? collection.alias :  model.model;
}

function addCollections (Model, seed, sails) {
  //the collection keys resemble the models to which the many side of the association belong
  var collectionkeys = Object.keys(seed.collections);
  //sails.log.debug(collectionkeys);
  //construct object of promises to put in props
  var props = {};
  _.each(collectionkeys, function (key) {
    props[getAlias(Model, key)] = findAssociationIds(seed, key, seed.collections[key], sails);
  });
  return Promise.props(props)
  .then(function (collections) {
    //got a composite collections object, merge it with seed and return
    //sails.log.debug("Got collections: ");
    //sails.log.debug(collections);
    delete seed.collections;
    return _.merge(seed, collections);
  });
}

function addModels (Model, seed, sails) {
  var modelkeys = Object.keys(seed.models);
  //sails.log.debug(modelkeys);
  var props = {};
  _.each(modelkeys, function (key) {
    var alias = getAlias(Model, key, sails);
    props[key] = findAssociationIds(seed, alias, seed.models[key], sails, true);
  });
  return Promise.props(props)
  .then(function (modelsobj) {
    //sails.log.debug("Got models: ");
    //sails.log.debug(modelsobj);
    delete seed.models;
    return _.merge(seed, modelsobj);
  });
}

function addAssociation (Model, seeds, sails) {
  //sails.log.debug("Associate the following seeds: ");
  //sails.log.debug(seeds);
  return Promise.map(seeds, function (seed) {
    //no associations are present, return as is
    if (seed.collections === undefined && seed.models === undefined) {
      return seed;
    }
    if (seed.collections && seed.models) {
      //both are present
      return Promise.join(addCollections(Model, seed, sails), addModels(Model, seed, sails))
      .then(function (collectionSeed, modelSeed) {
        return _.merge(collectionSeed, modelSeed);
      });
    }
    else if (!seed.collections && seed.models) {
      //only model
      return addModels(Model, seed, sails);
    }
    else if (seed.collections && !seed.models){
      //only collections
      return addCollections(Model, seed, sails);
    }
  });
}

module.exports.create = function (Model, fixtures, opts, sails) {
  return Model.find()
  .then(function (results) {
    if (results.length > 0) {
      //only throw here if we don't want to overwrite the model
      if (!_.includes(opts.overwrite, opts.model_name)) {
        throw new Error('Model not empty, skipping fixture');
      }
      else {
        //we want to delete all documents
        return Model.destroy({id: _.map(results, 'id')});
      }
    }
    else {
      //just resolve
      return Promise.resolve(undefined);
    }
  })
  .then(function () {
    //actual creation in case of empty collection
    return addAssociation(Model, fixtures, sails)
    .then(function (populatedFixtures) {
      //sails.log.debug('result of population: ');
      //sails.log.debug(populatedFixtures);
      return Model.create(populatedFixtures);
    });
  });
};

module.exports.empty = function (Model, opts, sails) {
  var model_name = opts.model_name;
  if (_.includes(opts.empty, opts.model_name)) {
    return Model.find()
    .then(function (results) {
      if (results.length > 0) {
        sails.log.info('Removing '+results.length+' existing documents from ' + model_name);
        return Model.destroy({id: _.map(results, 'id')});
      }
      else {
        return Promise.resolve();
      }
    });
  }
  else {
    //just resolve
    return Promise.resolve();
  }
};
