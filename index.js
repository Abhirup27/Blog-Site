const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const bodyparser = require("body-parser");
const { formatDate } = require("utils");
const { findUser, findPost, getPostsList, getClientIp } = require("utils/userIdentification");
//const { getConnection } = require("db-handler/connection-handler");
const json = require("json");
const { v4: uuid } = require('uuid');
const session = require("express-session");
const crypto = require("crypto");
const cookieParser = require("cookie-parser");
const { fileURLToPath } = require('url');
const { dirname, join } = require('path');

//const { User, Post} = require('./database/models');
const { Sequelize } = require('sequelize');
const {getPostsLists, getPost, createPost, updatePost, deletePost, getUserLogin, setUserInfo, verifyUser, newUserRegister, createDatabase}  = require('db-handler');


function generateUUID(id, postTitle, date)
{
   // const namespace = "Roop";
    const hash = crypto.createHash('sha1');
    
    // Concatenate the inputs into a single string
    const data = `${id}${postTitle}${date}`;
    
    hash.update(data);
    const uuid = hash.digest('hex');
    
    // Format as UUID
    return `${uuid.substr(0,8)}-${uuid.substr(8,4)}-${uuid.substr(12,4)}-${uuid.substr(16,4)}-${uuid.substr(20,12)}`;
}

// stub Database need to update later     
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
},
{
    id: "2",
    username: "admin2",
    password: "12345",
    email: "admin2@example.com",
    lastLoginIp: "",
    session: "",
    posts: [{
        title: "TEST2",
        id: uuid(),
        content: "This is a sample text.2",
        createdAt: "2024-09-14T12:00:00Z",
        updatedAt: "2024-09-14T12:00:00Z"
    }],
    createdAt: "2024-09-14T12:00:00Z",
    updatedAt: "2024-09-14T12:00:00Z"
}];
/* ====================================*/

const app = express();
const port = process.env.PORT || 8080;


app.use(session({
    name: 'SessionCookie',
    genid: function (req) {
        //console.log('session id created');
        return uuid();
    },
    secret: process.env.SESSION_SECRET || 'default',
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


createDatabase(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_HOST)
    .then(() => {
         const {db} = require('./database');
        const { User, Post } = db;
        db.sequelize.sync().then((req) => {

            app.listen(port, () => {
                console.log("server running");
            });

        });


        app.get("/", async (req, res) => {

        const headers = req.headers;
        const socket = req.socket;
            //let user = findUser(users, { headers, socket }, req.sessionID)
            const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);
        
        if (user) {
           
            //const postsWithoutContent = getPostsList(undefined,user);
            const postsWithoutContent = await getPostsLists({ username: user.dataValues.username }, user.dataValues.username, Post);
            res.render("posts.ejs", {
                posts: postsWithoutContent,
                logged: true,
                formatDate: formatDate
            });
    
        } else {
            res.render("index.ejs");
        }
    });

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    req.session.username = req.sessionID;
    console.log(req.sessionID);
    const ipAddress = getClientIp(req);
    
    try {
        const user = await getUserLogin(username, password, ipAddress, req.sessionID, User);
        console.log("This is after getUserLogin", user);
        
        if (user) {
            const postsWithoutContent = await getPostsLists({username: user.username}, user.username, Post);
            
            res.render("posts.ejs", {
                posts: postsWithoutContent,
                logged: true,
                formatDate: formatDate
            });
        } else {
            res.render("index.ejs", {logged: false, message: "Invalid username or password."});
        }
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).render("index.ejs", {message: "An error occurred during login."});
    }
});
        
        app.post('/register',(req, res) => {
            const { username, password,email } = req.body;

            let user = findUser(users, undefined, undefined, { username, password });

            if (user)
            {
                res.render("index.ejs", { message: "Email or username already used. Registration failed!" });
            }
            else {
                // make changes to DB; Send Email verification;
            }
        });

        app.get("/logout", async(req, res) => {
            const headers = req.headers;
            const socket = req.socket;
            //let user = findUser(users, { headers, socket }, req.sessionID)
            const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);
            if (user) {
                const update = await setUserInfo(user.dataValues.username, { session_id: '', ip_addr: '' }, User);
                //user.session = ""
                if (update === true)
                {
                res.clearCookie('SessionCookie');
                res.render("index.ejs", {
                    logged: false,
                    message: "Logged out successfully!"
                });
                }
                else {
                    console.error("error updating user info");
                }

            } else {
                res.render("index.ejs", {
                    message: "No active session found."
                });
            }
            // res.send("Logged out!");
        });

        app.post("/publish", async(req, res) => {

            const headers = req.headers;
            const socket = req.socket;
            //let user = findUser(users, { headers, socket }, req.sessionID)
            const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);
            if (user) {

                if (req.body.Title) {
                    console.log(req.body.Title)
                    const newPost = {
                        id: generateUUID(user.id, req.body.Title, new Date().toISOString()),
                        userid: user.dataValues.username,
                        title: req.body.Title,
                        content: req.body.Body,
                        visibility: 'public',
                        createdAt: new Date().toISOString(),
                        modifiedAt: new Date().toISOString()
                    };
                   // user.posts.push(newPost);
                    // user.updatedAt = new Date().toISOString();
                    const success = await createPost(newPost, Post);
        
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

        app.get("/posts/:id", async (req, res) => {

            const postId = req.params.id;
            let headers = req.headers;
            let socket = req.socket;
            const sessionid = req.sessionID
            const id = req.params.id; // id of the post
            const { foundPost, isEditable, userReq } = await findPost({ id, users, headers, socket, sessionid }, false, verifyUser, getPost, User, Post);
            console.log(foundPost);
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
            findPost({ id, users, headers, socket, sessionid, res }, true, verifyUser, getPost, User, Post);

        });

        // function updatePost(user, postId, newTitle, newContent) {
        //     const postIndex = user.posts.findIndex(post => post.id === postId);
        //     if (postIndex !== -1) {
        //         user.posts[postIndex].title = newTitle;
        //         user.posts[postIndex].content = newContent;
        //         user.posts[postIndex].updatedAt = new Date().toISOString();
        //         return true;
        //     }
        //     return false;
        // }

        // function deletePost(user, postId) {
        //     const postIndex = user.posts.findIndex(post => post.id === postId);
        //     if (postIndex !== -1) {
        //         user.posts.splice(postIndex, 1);
        //         user.updatedAt = new Date().toISOString();
        //         return true;
        //     }
        //     return false;
        // }

        app.post("/update", async(req, res) => {
            //check if post id already exists in the DB, then make changes.
            // remember to change the modified at field
    
            const headers = req.headers;
            const socket = req.socket;
           // let user = findUser(users, { headers, socket }, req.sessionID)
            const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);
            if (user) {
                const { Title, Body } = req.body;
                const postId = req.cookies.editingPostId;

                if (postId && Title && Body) {
                    if (await updatePost({ new_pid: generateUUID(user.dataValues.username, Title, user.dataValues.createdAt), old_pid: postId, userid: user.dataValues.username, title: Title, content: Body, visibility: 'Public' }, Post))
                    {
                        //user.updatedAt = new Date().toISOString();

                        res.clearCookie('editingPostId');
                        res.render("posts.ejs", {
                            posts:  await getPostsLists({username: user.dataValues.username},user.dataValues.username,Post),
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

        app.post("/delete-post", async(req, res) => {
            const headers = req.headers;
            const socket = req.socket;
            const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);

            if (user) {

                const postId = req.body.postId;
                console.log('Received postId:', postId);
                console.log(user.dataValues.username)
                if (postId) {
                    // Check if the post belongs to the user
                    const postExists = await getPostsLists({ p_id: postId }, user.dataValues.username, Post);
               
                    if (postExists) {
                        if (await deletePost(postExists[0].dataValues.p_id, Post)) {


                            res.redirect(303, "/deleted?success=true");
                        } else {
                  

                            res.redirect(303, "/deleted?success=false"); //change this such that the page stays on the current one but displays the message.
                        }
                    } else {
                        res.status(403).send("You don't have permission to delete this post");
                    }
                } else {
                    res.status(400).send("Missing post ID");
                }
            }
            else {
                res.status(401).send("User not authorized");
            }
        });

        // ?success=true
        app.get("/published", async(req, res) => {

            const headers = req.headers;
            const socket = req.socket;
            const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);
            const postsWithoutContent = await getPostsLists({ username: user.dataValues.username }, user.dataValues.username, Post);
            if (req.query.success == 'true') {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post has been published successfully!", formatDate: formatDate });
            }
            else {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post failed to publish!", formatDate: formatDate });
            }
   

        });

        app.get("/deleted", async(req, res) => {
            const headers = req.headers;
            const socket = req.socket;
             const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);
            const postsWithoutContent = await getPostsLists({ username: user.dataValues.username }, user.dataValues.username, Post);
            if (req.query.success == 'true') {
                console.log(postsWithoutContent.length)
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post has been removed.", formatDate: formatDate });
            }
            else {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post failed to delete!", formatDate: formatDate });
            }

        });

        app.get("/updated", async(req, res) => {
            const headers = req.headers;
            const socket = req.socket;
            const user = await verifyUser(req.sessionID, getClientIp({ headers, socket }), User);
            const postsWithoutContent = await getPostsLists({ username: user.dataValues.username }, user.dataValues.username, Post);
            if (req.query.success == 'true') {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post has been updated.", formatDate: formatDate });
            }
            else {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post failed to update!", formatDate: formatDate });
            }

        });
    })
      .catch((err) => {
    console.error("Error creating database:", err);
  });