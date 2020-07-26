/**
* Role.js
*
* @description :: A Role represents something a User or Group can be, like an
                  administrator, manager or a reader. Naming of roles is left to
                  to user of the application. Roles can be granted by an admin.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    name: { type: 'string', unique: true },

    /* Users that have this Role */
    users: {
      collection: 'user',
      via: 'roles',
      dominant: true
    },
    /* Groups that have this Role */
    groups: {
      collection: 'group',
      via: 'roles',
      dominant: true
    }
  }
}
