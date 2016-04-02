/**
* Group.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    name: {
      type:'string',
      required: true
    },
    /* A Group can contain many Users */
    users: {
      collection: 'user',
      via: 'groups',
      dominant: true
    },

    /* A group can have many Roles */
    roles: {
      collection: 'role',
      via: 'groups'
    },
    
    /* A company  */
    company:{
      collection: 'company',
      via: 'companyGroups'
    }
  }
};
