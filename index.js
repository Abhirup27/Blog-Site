import express from "express";
import bodyparser from "body-parser";
import json from "json";
import {
    v4 as uuid
} from 'uuid';
import session from "express-session";
import crypto from "crypto";
import cookieParser from "cookie-parser";

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
// imp make a database schema. connect it with nodejs. Three ways, sqlite. Mariadb with the server on the same machine, or on different machine with an open PORT. Need to make dockerimage for that too.       
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
        content: "This is a sample text."
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
app.use(express.json());
app.use(express.static("public"));
app.use(bodyparser.urlencoded({
    extended: true
}));

app.use(cookieParser());

app.get("/", (req, res) => {
    const string1 = "example string";
console.log(generateUUID(string1));
console.log(generateUUID(string1)); // This will produce the same UUID

const string2 = "another string";
console.log(generateUUID(string2)); // This will produce a different UUID
    let ipAddress = getClientIp(req);
    //console.log(req.sessionID)
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);
    if (user) {
        //res.send('Login successful!');
        res.render("posts.ejs", {
            posts: user.posts,
            logged: true
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
    let user = users.find(u => u.username === username && u.password === password);
    req.session.username = req.sessionID;
    console.log(req.sessionID)
    const ipAddress = getClientIp(req);

    if (user) {
        user.lastLoginIp = ipAddress;
        user.session = req.sessionID;

        const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title

        }));
        res.render("posts.ejs", {
            posts: postsWithoutContent,
            logged: true
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
    const ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);
    if (user) {

        if (req.body.Title) {
            console.log(req.body.Title)
            const newPost = {
                id: generateUUID(user.username, user.id, req.body.Title),
                title: req.body.Title,
                content: req.body.Body
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
    const ipAddress = getClientIp(req);
    const userReq = users.find(u => u.session === req.sessionID && u.lastLoginIp === ipAddress);

    let foundPost = null;
    let isEditable = false;

    for (const user of users) {
        const post = user.posts.find(p => p.id === postId);
        if (post) {
            foundPost = post;
            isEditable = userReq && user.id === userReq.id;
            break;
        }
    }

    if (!foundPost) {
        return res.status(404).send("Post not found");
    }

    res.render("post.ejs", {
        post: foundPost,
        editable: isEditable,
        logged: !!userReq
    });


});

app.get("/posts/:id/edit", (req, res) => {
    const postId = req.params.id;
    const ipAddress = getClientIp(req);
    const userReq = users.find(u => u.session === req.sessionID && u.lastLoginIp === ipAddress);

    let foundPost = null;
    let isEditable = false;

    for (const user of users) {
        const post = user.posts.find(p => p.id === postId);
        if (post) {
            foundPost = post;
            isEditable = userReq && user.id === userReq.id;
            break;
        }
    }

    if (!foundPost || !isEditable) {
        return res.status(404).send("Post not found or you don't have the priviledges to edit it.");
    }

    //I am sending the post ID to the client as a cookie here
    // the other way to do this is maybe by generating persistent/ consistent UUIDs by combining the userid and the postid(random numbers and strings), then when the user submits,...
    res.cookie('editingPostId', postId, {
        maxAge: 3600000, //~ 1 hour
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    res.render("publish.ejs",{logged:true, editable:isEditable, post:foundPost})

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
    
    const ipAddress = getClientIp(req);
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);

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
                    message: "Post updated successfully!"
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
    const ipAddress = getClientIp(req);
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);

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

     const ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);
      const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title

        }));
    if (req.query.success == 'true')
    {
        res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post has been published successfully!" }); 
    }
    else
    {
            res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post failed to publish!" }); 
    }
   

});

app.get("/deleted", (req, res) => {
        const ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);
      const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title

        }));
    if (req.query.success == 'true')
    {
        res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post has been removed." }); 
    }
    else
    {
            res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post failed to delete!" }); 
    }

});

app.get("/updated", (req, res) => {
           const ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u => u.session == req.sessionID && u.lastLoginIp == ipAddress);
      const postsWithoutContent = user.posts.map(post => ({
            id: post.id,
            title: post.title

        }));
    if (req.query.success == 'true')
    {
        res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post has been updated." }); 
    }
    else
    {
            res.render("posts.ejs", { posts: postsWithoutContent,logged: true, message: "Post failed to update!" }); 
    }

});