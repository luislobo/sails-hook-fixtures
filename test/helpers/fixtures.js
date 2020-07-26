module.exports = {
  order: ['Hometown', 'User', 'Pet', 'Group', 'Role', 'Company'],
  overwrite: ['User'],
  User: [
    {
      username: 'test'
    },
    {
      username: 'admin'
    },
    {
      username: 'Ash Ketchum',
      models: {
        home: ['Pallet Town']
      }
    }
  ],
  Hometown: [
    {
      name: 'Pallet Town'
    }
  ],
  Role: [
    {
      name: 'admin',
      collections: {
        user: { username: 'admin' }
      }
    },
    {
      name: 'user',
      collections: {
        user: { username: 'test' }
      }
    },
    {
      name: 'reader',
      collections: {
        group: ['Ordinary group']
      }
    }
  ],
  Group: [
    {
      name: 'Admin group',
      collections: {
        user: { username: ['admin'] }
      }
    },
    {
      name: 'Ordinary group',
      collections: {
        user: { username: ['test'] }
      }
    }
  ],
  Pet: [
    {
      name: 'Pikachu',
      models: {
        owner: { username: 'Ash Ketchum' }
      }
    }
  ],
  Company: [
    {
      name: 'Sweet & Co',
      models: {
        hometown: ['Pallet Town']
      },
      collections: {
        group: ['Admin group', 'Ordinary group']
      }
    },
    {
      id: '56ff2dcde7db1b663d0ae57e',
      name: 'Nice & Co',
      models: {
        hometown: ['Pallet Town']
      },
      collections: {
        group: ['Admin group', 'Ordinary group']
      }
    }
  ]
}
