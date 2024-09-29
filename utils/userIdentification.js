export function getClientIp(req) {
    return req.headers['x-forwarded-for'] ?.split(',').shift() ||
        req.socket ?.remoteAddress;
}

export function findUser(users, header, sessionid, data)
{
    let user;
    if (sessionid != undefined) {
        const ipAddress = getClientIp(header);
         user = users.find(u => u.session == sessionid && u.lastLoginIp == ipAddress);
    }
    else if (sessionid == undefined && header == undefined)
    {
        user = users.find(u => u.username === data.username && u.password === data.password);
    }
    return user;
}

export function findPost(data, toEdit)
{
    const postId = data.id;
    let foundPost = null;
    let isEditable = false;
    const { headers, socket } = data;
    const userReq = findUser(data.users, { headers, socket }, data.sessionid);
    for (const user of data.users)
    {
        const post = user.posts.find(p => p.id === postId);
        if (post)
        {
            foundPost = post;
            isEditable = userReq && user.id === userReq.id;
             console.log(user.id)
            break;
        }
    }
   
    if (!foundPost || !isEditable)
    {
        if (toEdit == undefined || data.res == undefined) {
            return foundPost, isEditable;
        }
        else if(toEdit == true && data.res != undefined)
            {
                return data.res.status(404).send("Post not found or you don't have the priviledges to edit it.");
            }
    }
    
    if (toEdit == true && data.res != undefined)
    {
        data.res.cookie('editingPostId', postId, {
        maxAge: 3600000, //~ 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
        });
        data.res.render("publish.ejs",{logged:true, editable:isEditable, post:foundPost})
    }
    else if(toEdit == false && data.res == undefined)
    {
        return { foundPost, isEditable, userReq };
        //just send the data foundPost and isEditable, user to index js    
    }
}