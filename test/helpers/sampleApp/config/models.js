module.exports.models = {
  datastore: 'default',
  migrate: 'drop',
  attributes: {
    createdAt: {
      type: 'ref',
      autoCreatedAt: true
    },
    updatedAt: {
      type: 'ref',
      autoUpdatedAt: true
    },
    id: {
      type: 'string',
      columnName: '_id'
    }
  }
}
