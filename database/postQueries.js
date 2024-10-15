const { Sequelize } = require('sequelize');

async function getPostsLists( filters,db)
{
    const { User, Post } = db;
      try {
    const results = await Post.findAll({
      where: {
            //usernname: _user_,
            ...filters
      },

      attributes: ['p_id', 'title', 'createdAt']
    });

    console.log(results);
    return results;
  } catch (error) {
    console.error('Error selecting rows:', error);
  }

}


async function getPost(filters, db)
{
    const { User, Post } = db;
      try {
    const results = await Post.findAll({
      where: {
            //usernname: _user_,
            ...filters
      },

      //attributes: ['p_id', 'title', 'createdAt']
    });

    console.log(results);
    return results;
  } catch (error) {
    console.error('Error selecting rows:', error);
  }
}


async function createPost(data, db)
{
    const { User, Post } = db;
    Post.create({
        p_id: data.pid,
        username: data.userid,
        title: data.title,
        content: data.content,
        visibility: data.visibility
    }).then(() => {
        return true;
    }).catch((err) => {
        if (err) {
            console.log(err);
            }
    })
}

async function updatePost(data, db)
{
     const { Post } = db;
    Post.update({
            p_id: data.new_pid,
            title: data.title,
            content: data.title,
            visibility: data.visibility
        }, {
        where: {
                p_id: data.old_pid,
                username: userid
            }
        })
        .then((result) => {
            console.log('Updated rows:', result[0]);
            return true;
        })
        .catch((err) => {
            if (err) {
                console.log(err);
                return false;
            }
        })
}

module.exports = { getPostsLists, getPost, createPost, updatePost };