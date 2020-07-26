module.exports = {
  attributes: {
    name: {
      type: 'string',
      required: true
    },
    companyGroups: {
      collection: 'group',
      via: 'company',
      dominant: true
    },
    hometown: {
      model: 'hometown',
      required: true
    }
  }
}
