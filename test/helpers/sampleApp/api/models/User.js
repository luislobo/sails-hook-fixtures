/**
 * Hash a user password.
 *
 * @param {Object}   user
 * @param {Function} next
 */

var bcrypt = require('bcryptjs');

function hashPassword (user, next) {
  if (user.password) {
    bcrypt.hash(user.password, 10, function (err, hash) {
      user.password = hash;
      next(err, user);
    });
  } else {
    next(null, user);
  }
}

var User = {
  // Enforce model schema in the case of schemaless databases
  schema: true,

  attributes: {
    username  : { type: 'string', unique: true, required: true },
    email     : { type: 'email',  unique: true, required: true },
    password  : { type: 'string', required: true },
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

    /**
     * Validate password used by the local strategy.
     *
     * @param {string}   password The password to validate
     * @param {Function} next
     */
    validatePassword: function (password, next) {
      bcrypt.compare(password, this.password, next);
    },

    //Override toJSON method to remove password from API
    toJSON: function() {
      var obj = this.toObject();
      // Remove the password object value
      delete obj.password;
      // return the new object without password
      return obj;
    }
  },

  /**
   * Callback to be run before creating a User.
   *
   * @param {Object}   user The soon-to-be-created User
   * @param {Function} next
   */
  beforeCreate: function (user, next) {
    hashPassword(user, next);
  },

  /**
   * Callback to be run before updating a User.
   *
   * @param {Object}   user Values to be updated
   * @param {Function} next
   */
  beforeUpdate: function (user, next) {
    hashPassword(user, next);
  },


};

module.exports = User;
