module.exports = {
  order: ['User', 'Group', 'Role'],
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
        user: {username: 'arryon'},
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
};
