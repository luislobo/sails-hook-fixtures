# Sails-hook-fixtures
[![Build status][travis-image]][travis-url]
[![Dependency Status][daviddm-image]][daviddm-url]

Installable hook that injects fixtures into your sails ORM at runtime. With associations!

## Installation
`npm i sails-hook-fixtures`

## Usage
When lifting your Sails app, any fixtures that are loaded are checked against the model tabels/collections in the database. If the database table/collection is empty, the fixtures for that table/collection are automatically installed. If you want to overwrite an existing table/collection each time you lift, use the `overwrite` option.

Currently only tested against Waterline + MongoDB.

## Configuration
Define your `fixtures` object so that it is loaded as `sails.config.fixtures`. For instance, export it in [sails/config/local.js](http://sailsjs.org/#!/documentation/anatomy/myApp/config/local.js.html):

```javascript
// sails/config/local.js
module.exports = {
  fixtures: { ... }
}
```

The fixtures object should have an attribute `order` specifying the order in which to populate your models. This is important if you want to associate models.

The fixtures for a model are configured as an array of objects. Each object will be made into a document in the database.

```javascript
// sails/config/local.js
fixtures: {
  order: ['User', 'Pet'],
  User: [
    {
      username: 'Walter',
      state: 'New Mexico'
    },
    {
      username: 'Skyler',
      state: 'New Mexico'
    }
  ],
  Pet: [
    {
      name: 'Pikachu',
      type: 'Electric'
    },
    {
      name: 'Charizard',
      type: 'Fire'
    }
  ]
}
```

For an example, take a look at [the sample fixtures used in testing](https://github.com/arryon/sails-hook-fixtures/blob/master/test/helpers/fixtures.js)

Each attribute other than those of the options below is assumed to be the capitalized name of your model. Inability to find the model will silently fail and continue.

## Options
| attribute name      | usage                                                          | example                    |
|-----------|----------------------------------------------------------------|----------------------------|
| order     | Specify the order in which to inject fixtures into models      | `order: ['User', 'Group']` |
| overwrite | Specify which model documents to always overwrite when lifting | `overwrite: ['User']`      |

## Associations
The hook can automatically add associations between your models if you specify them in the right way. This only works if you use Waterline!

### Terminology
* **Association/relation**: relation between two models
* **Fixture**: object that is injected as a document into the database
* **Document**: an entry in the database

### General Usage
Define associations as you would look up documents in an existing sails application. Want to add user `jason` to group `testusers`? Define a relation in the fixture object that says `user: {username: 'jason'}`. You can add every [*where* query from sails](http://sailsjs.org/#!/documentation/concepts/ORM/Querylanguage.html) to the relation definition.

Does the model you want to add have an attribute `name`? Then as added bonus you can directly input an array into the relation definition. If you want to associate `jason` with groups `user` and `editor`, and your `Group` model has an attribute `name`, you can just say `group: ['user', 'editor']`.

Be sure when using relations to specify the right order of injecting the fixtures! When the *User* model hasn't been populated yet, a relation to *Group* can't be added.

Different relations in Sails have different ways of adding them. For an extensive overview, see the [waterline associations documentation](https://github.com/balderdashy/waterline-docs/blob/master/associations.md)

### One-to-one relations
Define a `models` attribute at the owning side of the relation. If a `User` owns one `Pet`, define the fixture as:

```javascript
// sails/config/local.js
fixtures: {
  // note that the order is reversed compared
  // to the One-to-many relation
  order: ['Pet', 'User'],
  User: [
    {
      username: 'Robinson Crusoe',
      models: {
        // note we can pass an array directly here
        // instead of a 'where' query object, because
        // the underlying code will assume we want
        // to look up the 'name' attribute.
        // Is equivalent to {name: 'Wilson'}.
        pet: ['Wilson']
      }
    }
  ],
  Pet: [
    {
      name: 'Wilson'
    }
  ]
}
```

### One-to-many relations
work with a `models` object inside the fixture. The relation will (and must) be added at the owned side of the relation. For instance, a `User` can have mulitiple pets, but a `Pet` can only belong to one user. Insert the relation at the `Pet` fixture like this:

```javascript
// sails/config/local.js
fixtures: {
  order: ['User', 'Pet'],
  User: [
    {
      username: 'Schrodinger'
    }
  ],
  Pet: [
    {
      name: 'cat',
      models: {
        owner: {username: 'Schrodinger'}
      }
    }
  ]
}
```

### Many-to-many relations
Work with a `collections` object inside the fixture. The relation will be added at the model where you insert the `collections` definition. Make sure this is the same side that has `dominant: true` inside the model definition

Example:
```javascript
// sails/config/local.js
fixtures: {
  // First, inject users. Then, group can have users
  // added to its model attribute
  order: ['User', 'Group'],
  User: [
    {
      username: 'Turing',
    },
    {
      username: 'Asimov'
    }
  ],
  Group: [
    {
      name: 'Users',
      collections: {
        // Queries a 'where' query internally
        // with {username: user} as object.
        // resulting documents are added to the
        // alias of the 'user' association
        user: {username: ['Turing', 'Asimov']}
      }
    }
  ]
}
```

## Development
Want to contribute? Clone the repository, install the dependencies with `npm install`, and get going. You can test using the command `grunt`, which will also run JSHint against your changes to see if they are syntactically correct.

Note that you need a working adaptor for the database. In the test files I describe a `test` connection that uses a local mongoDB instance. Change according to your database configuration.

[travis-image]: https://travis-ci.org/arryon/sails-hook-fixtures.svg?branch=master
[travis-url]: https://travis-ci.org/arryon/sails-hook-fixtures
[daviddm-image]: https://david-dm.org/arryon/sails-hook-fixtures.svg
[daviddm-url]: https://david-dm.org/arryon/sails-hook-fixtures
