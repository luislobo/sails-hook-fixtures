module.exports = {

  attributes: {
    name: {type:'string', required:true},

    /* A Pet is owned by one owner */
    owner: {
      model: 'user'
    }
  }
}
