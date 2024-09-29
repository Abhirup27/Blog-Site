import express from "express";
import bodyparser from "body-parser";
import { formatDate } from "utils/dateUtils";
import { findUser, findPost } from "utils/userIdentification";
import json from "json";
import {
    v4 as uuid
} from 'uuid';
import session from "express-session";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function generateUUID(username, id, postTitle)
{
   // const namespace = "Roop";
    const hash = crypto.createHash('sha1');
    
    // Concatenate the inputs into a single string
    const data = `${username}${id}${postTitle}`;
    
    hash.update(data);
    const uuid = hash.digest('hex');
    
    // Format as UUID
    return `${uuid.substr(0,8)}-${uuid.substr(8,4)}-${uuid.substr(12,4)}-${uuid.substr(16,4)}-${uuid.substr(20,12)}`;
}

//TODO: make a sidebar which shows recent published posts. It can use socket io to communicate in different protocol and PORT, to update in realtime(not by page refresh)
// Make the posts privatable 
     
let users = [{
    id: "1",
    username: "admin",
    password: "1234",
    email: "admin@example.com",
    lastLoginIp: "",
    session: "",
    posts: [{
        title: "TEST",
        id: uuid(),
        content: "This is a sample text.",
        createdAt: "2024-09-14T12:00:00Z",
        updatedAt: "2024-09-14T12:00:00Z"
    }],
    createdAt: "2024-09-14T12:00:00Z",
    updatedAt: "2024-09-14T12:00:00Z"
}];
const app = express();
const port = process.env.PORT || 8080;


app.use(session({
    name: 'SessionCookie',
    genid: function (req) {
        //console.log('session id created');
        return uuid();
    },
    secret: 'Shsh!Secret!',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        expires: 7200000  // ~ 2 hours
    }
}));

//==========SETTING UP EXPRESSJS===========//
app.use(express.json());

app.use(express.static("public"));

// app.set('views', [
// join(__dirname, 'views'),
// join(__dirname, 'utils')
// ]);

app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(cookieParser());

//==========SETTING UP EXPRESSJS===========//

app.get("/", (req, res) => {

    const headers = req.headers;
    const socket = req.socket;
    let user = findUser(users, { headers, socket }, req.sessionID)
    if (user) {
        //res.send('Login successful!');
        const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title,
            createdAt: post.createdAt,
            modifiedAt:post.modifiedAt

        }));
        res.render("posts.ejs", {
            posts: postsWithoutContent,
            logged: true,
            formatDate: formatDate
        });
   
    } else {
        res.render("index.ejs");
    }
});


function getClientIp(req) {
    return req.headers['x-forwarded-for'] ?.split(',').shift() ||
        req.socket ?.remoteAddress;
}

app.post('/login', (req, res) => {
    const {
        username,
        password
    } = req.body;

    // Find the user
    //let user = users.find(u => u.username === username && u.password === password); // 
    let user = findUser(users, undefined, undefined, { username, password });
    req.session.username = req.sessionID;
    console.log(req.sessionID)
    const ipAddress = getClientIp(req);

    if (user) {
        user.lastLoginIp = ipAddress;
        user.session = req.sessionID;

        const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title,
            createdAt: post.createdAt,
            modifiedAt:post.modifiedAt

        }));
        res.render("posts.ejs", {
            posts: postsWithoutContent,
            logged: true,
            formatDate: formatDate
        });
        //res.send('Login successful!');

    } else {
        res.status(401).send('Invalid username or password');
    }
});

app.listen(port, () => {
    console.log(`Server started at port ${port}`);
});

app.get("/logout", (req, res) => {
    const ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);
    if (user) {
        //res.send('Login successful!');
        user.session = ""
        user.lastLoginIp = ""
        res.render("index.ejs", {
            logged: false,
            message: "Logged out successfully!"
        });
    } else {
        res.render("index.ejs", {
            message: "No active session found."
        });
    }
    // res.send("Logged out!");
});

app.post("/publish", (req, res) => {

    const headers = req.headers;
    const socket = req.socket;
    let user = findUser(users, { headers, socket }, req.sessionID)
    if (user) {

        if (req.body.Title) {
            console.log(req.body.Title)
            const newPost = {
                id: generateUUID(user.username, user.id, req.body.Title),
                title: req.body.Title,
                content: req.body.Body,
                createdAt: new Date().toISOString(),
                modifiedAt: new Date().toISOString()
            };
            user.posts.push(newPost);
            user.updatedAt = new Date().toISOString();
            // res.render("posts.ejs", {
            //     posts: user.posts,
            //     logged: true,
            //     message: "Post published successfully!"
            // });
            res.redirect(303, '/published?success=true');
        } else {
            res.render("publish.ejs", {
                logged: true
            });
        }
    } else {
        res.render("index.ejs");
    }

});

app.get("/posts/:id", (req, res) => {

    const postId = req.params.id;
     let headers = req.headers;
    let socket = req.socket;
    const sessionid = req.sessionID
    const id = req.params.id; // id of the post
    const { foundPost, isEditable, userReq } = findPost({ id, users, headers, socket, sessionid }, false);
    // let headers = req.headers;
    // let socket = req.socket;
    
    // const userReq = findUser(users, { headers, socket }, req.sessionID)
 
    // const postId = req.params.id;
    // let foundPost = null;
    // let isEditable = false;

    // for (const user of users) {
    //     const post = user.posts.find(p => p.id === postId);
    //     if (post) {
    //         foundPost = post;
    //         isEditable = userReq && user.id === userReq.id;
    //         break;
    //     }
    // }

    // if (!foundPost) {
    //     return res.status(404).send("Post not found");
    // }

    res.render("post.ejs", {
        post: foundPost,
        editable: isEditable,
        logged: !!userReq
    });


});

app.get("/posts/:id/edit", (req, res) => {
    let headers = req.headers;
    let socket = req.socket;
    const sessionid = req.sessionID
    const id = req.params.id; // id of the post
    findPost({id, users,headers, socket, sessionid, res}, true)
    // let headers = req.headers;
    // let socket = req.socket;
    // const userReq = findUser(users, { headers, socket }, req.sessionID)

    // const postId = req.params.id;
    // let foundPost = null;
    // let isEditable = false;

    // for (const user of users) {
    //     const post = user.posts.find(p => p.id === postId);
    //     if (post) {
    //         foundPost = post;
    //         isEditable = userReq && user.id === userReq.id;
    //         break;
    //     }
    // }

    // if (!foundPost || !isEditable) {
    //     return res.status(404).send("Post not found or you don't have the priviledges to edit it.");
    // }

    // //I am sending the post ID to the client as a cookie here
    // // the other way to do this is maybe by generating persistent/ consistent UUIDs by combining the userid and the postid(random numbers and strings), then when the user submits,...
    // res.cookie('editingPostId', postId, {
    //     maxAge: 3600000, //~ 1 hour
    //     httpOnly: true,
    //     secure: process.env.NODE_ENV === 'production',
    //     sameSite: 'strict'
    // });
    // res.render("publish.ejs",{logged:true, editable:isEditable, post:foundPost})

});

function updatePost(user, postId, newTitle, newContent)
{
    const postIndex = user.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1)
    {
        user.posts[postIndex].title = newTitle;
        user.posts[postIndex].content = newContent;
        user.posts[postIndex].updatedAt = new Date().toISOString();
        return true;
    }
    return false;
}

function deletePost(user, postId)
{
    const postIndex = user.posts.findIndex(post => post.id === postId);
    if (postIndex !== -1)
    {
        user.posts.splice(postIndex, 1);
        user.updatedAt = new Date().toISOString();
        return true;
    }
    return false;
}

app.post("/update", (req, res) => {
    //check if post id already exists in the DB, then make changes.
    // remember to change the modified at field
    
    const headers = req.headers;
    const socket = req.socket;
    let user = findUser(users, { headers, socket }, req.sessionID)

    if (user)
    {
        const { Title, Body } = req.body;
        const postId = req.cookies.editingPostId;

        if (postId && Title && Body) {
            if (updatePost(user, postId, Title, Body))
            {
                user.updatedAt = new Date().toISOString();

                res.clearCookie('editingPostId');
                res.render("posts.ejs", {
                    posts: user.posts,
                    logged: true,
                    message: "Post updated successfully!",
                    formatDate: formatDate
                });

            }
            else {
                res.status(404).send("post not found");
            }
        }
        else {
            res.status(400).send("Missing Required fields");
        }
    } else {
        res.render("index.ejs");
    }
    
    


});

app.post("/delete-post", (req, res) => {
    const headers = req.headers;
    const socket = req.socket;
    let user = findUser(users, { headers, socket }, req.sessionID)

    if (user)
    {
        // const postId = req.body.postId;
        // if (postId)
        // {
        //     if (deletePost(user, postId))
        //     {
        //         res.render("posts.ejs", {
        //             posts: user.posts,
        //             logged: true,
        //             message: "Post deleted successfully!"
        //         });
        //     }
        //     else {
        //         res.status(404).send("Post not found!");
        //     }
        // }
        // else
        // {
        //     res.status(400).send("Missing post ID!");
        // }

          const postId = req.body.postId;
        console.log('Received postId:', postId);

        if (postId) {
            // Check if the post belongs to the user
            const postExists = user.posts.some(post => post.id === postId);
            if (postExists) {
                if (deletePost(user, postId)) {
                    // Render the posts page with a success message
                    // res.render("posts.ejs", {
                    //     posts: user.posts,
                    //     logged: true,
                    //     message: "Post deleted successfully!"
                    // });

                    res.redirect(303, "/deleted?success=true"); 
                } else {
                    // Render the posts page with an error message
                    // res.render("posts.ejs", {
                    //     posts: user.posts,
                    //     logged: true,
                    //     message: "Failed to delete post"
                    // });

                    res.redirect(303, "/deleted?success=false"); //change this such that the page stays on the current one but displays the message.
                }
            } else {
                res.status(403).send("You don't have permission to delete this post" );
            }
        } else {
            res.status(400).send("Missing post ID" );
        }
    }
    else {
        res.status(401).send("User not authorized");
    }
});

// ?success=true
app.get("/published", (req, res) => {

    const headers = req.headers;
    const socket = req.socket;
    let user = findUser(users, { headers, socket }, req.sessionID)
      const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title,
            createdAt: post.createdAt,
            modifiedAt:post.modifiedAt

        }));
    if (req.query.success == 'true')
    {
        res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post has been published successfully!", formatDate: formatDate }); 
    }
    else
    {
            res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post failed to publish!", formatDate: formatDate }); 
    }
   

});

app.get("/deleted", (req, res) => {
    const headers = req.headers;
    const socket = req.socket;
    let user = findUser(users, { headers, socket }, req.sessionID)
      const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title,
            createdAt: post.createdAt,
            modifiedAt:post.modifiedAt

        }));
    if (req.query.success == 'true')
    {
        console.log(postsWithoutContent.length)
        res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post has been removed.",formatDate: formatDate }); 
    }
    else
    {
            res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post failed to delete!",formatDate: formatDate }); 
    }

});

app.get("/updated", (req, res) => {
    const headers = req.headers;
    const socket = req.socket;
    let user = findUser(users, { headers, socket }, req.sessionID)
      const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title,
            createdAt: post.createdAt,
            modifiedAt:post.modifiedAt

        }));
    if (req.query.success == 'true')
    {
        res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post has been updated.", formatDate: formatDate }); 
    }
    else
    {
            res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post failed to update!",formatDate: formatDate }); 
    }

});