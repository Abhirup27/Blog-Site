
//const { verifyUser } = require("db-handler");

 function getClientIp(req) {
    return req.headers['x-forwarded-for'] ?.split(',').shift() ||
        req.socket ?.remoteAddress;
}

 function findUser(users, header, sessionid, data)
{
    let user;
    if (sessionid != undefined) { //to check if it the right user making the request
        const ipAddress = getClientIp(header);
        console.log(ipAddress)
         user = users.find(u => u.session == sessionid && u.lastLoginIp == ipAddress);
    }
    else if (sessionid == undefined && header == undefined)   //log in
    {
        user = users.find(u => u.username === data.username && u.password === data.password);
    }
    return user;
}

 async function findPost(data, toEdit, verifyUser, getPost,User, Post)
{
    const postId = data.id;
    let foundPost = null;
    let isEditable = false;
    const { headers, socket } = data;
     //const userReq = findUser(data.users, { headers, socket }, data.sessionid);
     const ipAddress = getClientIp({ headers, socket });
     try{
            const userReq = await verifyUser(data.sessionid, ipAddress, User);
             console.log(userReq.dataValues);

            // for (const user of data.users)
            // {
            //     const post = user.posts.find(p => p.id === postId);
            //     if (post)
            //     {
            //         foundPost = post;
            //         isEditable = userReq && user.id === userReq.id;
            //          console.log(user.id)
            //         break;
            //     }
            // }
                
            if (userReq)
            {
                try
                {
                    const { foundPost, isEditable } = await getPost(Post, { p_id: postId }, userReq.dataValues.username);
                    console.log(foundPost.dataValues);
                    if (!foundPost || !isEditable)
                    {
                        if (toEdit == undefined || data.res == undefined) {
                            console.log(foundPost.dataValues);
                            return { foundPost:foundPost.dataValues, isEditable, userReq };
                        }
                        else if(toEdit == true && data.res != undefined)
                        {
                            return data.res.status(404).send("Post not found or you don't have the priviledges to edit it.");
                        }
                    }
                    
                    if (toEdit == true && data.res != undefined)
                    {
                        data.res.cookie('editingPostId', foundPost.dataValues.p_id, {
                        maxAge: 3600000, //~ 1 hour
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict'
                        });
                        data.res.render("publish.ejs",{logged:true, editable:isEditable, post:foundPost.dataValues})
                    }
                    else if(toEdit == false && data.res == undefined)
                    {
                               console.log(foundPost.dataValues.content)
                        return { foundPost:foundPost.dataValues, isEditable, userReq };
                        //just send the data foundPost and isEditable, user to index js    
                    }
            

                } catch (error)
                {
                    console.error("Error geting the post" + error);
                }
            }

     } catch (error)
     {
         console.error("Error fetching user", error);
     }
}

 function getPostsList(data, user) {
    const { headers = undefined, socket = undefined } = data || {};
    if (user == undefined)
    {
        user = findUser(data.users, { headers, socket }, data.sessionID);

    }
    const postsWithoutContent = user.posts.map(post => ({
        id: post.id,
        title: post.title,
        createdAt: post.createdAt,
        modifiedAt: post.modifiedAt
    }));

    return postsWithoutContent;
}

module.exports = {
    findUser,
    findPost,
    getPostsList,
    getClientIp
};
