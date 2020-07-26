const User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username: { type: 'string', unique: true, required: true },
    /* A User can belong to many Groups */
    groups: {
      collection: 'group',
      via: 'users'
    },

    /* A User can have many Roles */
    roles: {
      collection: 'role',
      via: 'users'
    },

    /* A User can have many pets */
    pets: {
      collection: 'pet',
      via: 'owner'
    },

    /* A user has one Hometown */
    home: {
      model: 'hometown'
    }

  }

}

module.exports = User
