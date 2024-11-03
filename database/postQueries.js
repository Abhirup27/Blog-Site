const { Sequelize } = require('sequelize');
const { Op } = require('sequelize');

async function getPostsListsAdmin(filters, Post) {
  try {
    const results = await Post.findAll({
      where: {
        ...filters
      },
      attributes: ['p_id', 'title', 'created_at', 'u_id']
    });
    console.log(results);
    return results;
  } catch (error) {
    console.error('Error selecting rows:', error);
    return null; 
  }
}

async function getPostsLists(filters, requestingUsername, Post) {
  try {
    // Start with the base visibility conditions
    const whereClause = {
      [Op.or]: [
        { visibility: 'public' },
        { username: requestingUsername }
      ]
    };

    // Spread all filters into the where clause
    Object.assign(whereClause, filters);

    const postList = await Post.findAll({
      where: whereClause,
      attributes: ['p_id', 'title', 'created_at', 'username', 'visibility'],
      order: [['created_at', 'DESC']]
    });

    if (!postList || postList.length === 0) {
      
      return [];
    }
   
    return postList;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

async function getPostAdmin(filters, db)
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
        throw error;
  }
}

async function getPost(Post, filters, username)
{
 // let foundPost = null;
  let isEditable = false;
  try {
    const foundPost = await Post.findOne({
      where: {
        ...filters
      },

      attributes: ['p_id', 'title', 'content', 'username', 'visibility', 'created_at', 'updated_at']
    })
    if (!foundPost) {
      return null; // Post not found
    }

    if (foundPost.username === username) {
      isEditable = true;
      return { foundPost, isEditable }; // Username matches, return the post
    }

    if (foundPost.visibility === 'public') {
      return { foundPost, isEditable }; // Post is public, return it
    }

    return null; // Username doesn't match and post is not public
  } catch (error)
  {
    console.error("Error fetching Post" + error);
    throw error;
  }
}

async function createPost(data, Post)
{
   
   const result = await Post.create({
        p_id: data.id,
        username: data.userid,
        title: data.title,
        content: data.content,
      visibility: data.visibility,
      createdAt: data.createdAt,
    }).then(() => {
        return true;
    }).catch((err) => {
        if (err) {
          console.log(err);
          
            }
    })
  
  return result;
}

async function updatePost(data, Post)
{
    
    Post.update({
            p_id: data.new_pid,
            title: data.title,
            content: data.content,
            visibility: data.visibility
        }, {
        where: {
                p_id: data.old_pid,
                username: data.userid
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
  
  return true;
}

async function deletePost(p_id, Post)
{
  try
  {
      const deletedPost = await Post.destroy({
        where: {
          p_id: p_id
        }
      });
    if (deletedPost)
    {
      return true;
    }
    else
    {
      return false;
      }
  }
  catch (err)
  {
    console.error(err);
  }
}

module.exports = { getPostsLists, getPostsListsAdmin, getPost, getPostAdmin, createPost, updatePost, deletePost };