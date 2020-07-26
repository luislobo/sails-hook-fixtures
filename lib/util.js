const Promise = require('bluebird')
const _ = require('lodash')
const debug = require('debug')('sails-hook-fixtures:util')

async function findAssociationIds (seed, key, collection, sails, singular) {
  debug('findAssociationIds', seed, key, collection, singular)
  var Model = sails.models[key]
  if (Model === undefined) {
    throw new Error('Undefined model ' + key)
  }
  // if the collection is of the form of an Array, assume we have to look for attribute 'name'
  // else, it will just be regular query
  const query = (collection instanceof Array ? { name: collection } : collection)
  const results = await Model.find(query)
  if (results.length === 0) {
    throw new Error('No models existed matching query: ' + JSON.stringify(query))
  } else {
    // pluck the ids, append them to the correct attribute and return the
    // object with the correct ids for further promise map iteration
    const ids = _.map(results, 'id')
    if (singular === true) {
      return ids[0]
    } else {
      return ids
    }
  }

}

/**
 * Search the alias for a given collection
 */
function getAlias (Model, associationName) {
  debug('getAlias', Model.associations, associationName)
  const collection = _.find(Model.associations, function (assoc) {
    return assoc.collection === associationName
  })
  const model = _.find(Model.associations, function (assoc) {
    return assoc.alias === associationName
  })
  if (collection === undefined && model === undefined) {
    throw new Error('non-existing association: ' + associationName)
  }
  return collection ? collection.alias : model.model
}

async function addCollections (Model, seed, sails) {
  debug('addCollections', seed)
  // the collection keys resemble the models to which the many side of the association belong
  var collectionkeys = Object.keys(seed.collections)
  // sails.log.debug(collectionkeys);
  // construct object of promises to put in props
  var props = {}
  _.each(collectionkeys, function (key) {
    props[getAlias(Model, key)] = findAssociationIds(seed, key, seed.collections[key], sails)
  })
  const collections = await Promise.props(props)

  // got a composite collections object, merge it with seed and return
  // sails.log.debug("Got collections: ");
  // sails.log.debug(collections);
  delete seed.collections
  return _.merge(seed, collections)

}

async function addModels (Model, seed, sails) {
  debug('addModels', seed)
  const modelkeys = Object.keys(seed.models)
  // sails.log.debug(modelkeys);
  const props = {}
  _.each(modelkeys, function (key) {
    props[key] = findAssociationIds(seed, getAlias(Model, key), seed.models[key], sails, true)
  })
  const modelsobj = await Promise.props(props)

  // sails.log.debug("Got models: ");
  // sails.log.debug(modelsobj);
  delete seed.models
  return _.merge(seed, modelsobj)
}

function addAssociation (Model, seeds, sails) {
  debug('addAssociation', seeds)
  // sails.log.debug("Associate the following seeds: ");
  // sails.log.debug(seeds);
  return Promise.map(seeds, async function (seed) {
    // no associations are present, return as is
    if (seed.collections === undefined && seed.models === undefined) {
      return seed
    }
    if (seed.collections && seed.models) {
      // both are present
      const seedWithCollections = await addCollections(Model, seed, sails)
      return addModels(Model, seedWithCollections, sails)
    } else if (!seed.collections && seed.models) {
      // only model
      return addModels(Model, seed, sails)
    } else if (seed.collections && !seed.models) {
      // only collections
      return addCollections(Model, seed, sails)
    }
  })
}

module.exports.create = async function (Model, fixtures, opts, sails) {
  debug('create', fixtures, opts)
  const result = await Model.count()

  if (result > 0) {
    // only throw here if we don't want to overwrite the model
    if (!_.includes(opts.overwrite, opts.modelName)) {
      throw new Error('Model not empty, skipping fixture')
    } else {
      // we want to delete all documents
      await Model.destroy({})
    }
  }
  // actual creation in case of empty collection
  const populatedFixtures = await addAssociation(Model, fixtures, sails)
  debug('result of population', populatedFixtures)
  return Model.createEach(populatedFixtures).fetch()
}

module.exports.empty = async function (Model, opts, sails) {
  debug('empty', opts)
  const modelName = opts.modelName
  if (_.includes(opts.empty, opts.modelName)) {
    const results = await Model.find()
    if (results.length > 0) {
      sails.log.info('Removing ' + results.length + ' existing documents from ' + modelName)
      return Model.destroy({ id: _.map(results, 'id') }).fetch()
    }
  }
}
