module.exports = {
  order: ['User','Pet', 'Group', 'Role'],
  User: [
    {
      username: 'test',
      email: 'test@test.com',
      password: 'test'
    },
    {
      username: 'admin',
      email: 'admin@admin.com',
      password: 'admin'
    }
  ],
  Role: [
    {
      name: 'admin',
      collections: {
        user: {username: 'admin'},
      }
    },
    {
      name: 'user',
      collections: {
        user: {username: 'test'}
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
        user: {username: ['admin']},
      }
    },
    {
      name: 'Ordinary group',
      collections: {
        user: {username: ['test']}
      }
    }
  ],
  Pet: [
    {
      name: 'Pikachu',
      models: {
       owner: {username: 'test'}
      }
    }
  ]
};
