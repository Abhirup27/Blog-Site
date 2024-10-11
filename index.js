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
const {createDatabase}  = require('db-handler');


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
        const { User } = db;
        db.sequelize.sync({ force: true }).then((req) => {

            app.listen(3000, () => {
                console.log("server running");
            });

        });
        //createDatabaseIfNotExists('database_development', 'root', 'ABHIrup_27', 'localhost')
        //createDatabaseIfNotExists(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, process.env.DB_HOST);


        app.get("/", (req, res) => {

        const headers = req.headers;
        const socket = req.socket;
        let user = findUser(users, { headers, socket }, req.sessionID)
        if (user) {
            //res.send('Login successful!');
            const postsWithoutContent = getPostsList(undefined,user);
            res.render("posts.ejs", {
                posts: postsWithoutContent,
                logged: true,
                formatDate: formatDate
            });
    
        } else {
            res.render("index.ejs");
        }
    });

    app.post('/login', (req, res) => {
        const {
            username,
            password
        } = req.body;

        
        let user = findUser(users, undefined, undefined, { username, password });
        req.session.username = req.sessionID;
        console.log(req.sessionID);
        const ipAddress = getClientIp(req);

        if (user) {
            user.lastLoginIp = ipAddress;
            user.session = req.sessionID;

            const postsWithoutContent = getPostsList(undefined,user);
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

        app.get("/logout", (req, res) => {
            const headers = req.headers;
            const socket = req.socket;
            let user = findUser(users, { headers, socket }, req.sessionID)
            if (user) {
      
                user.session = ""
                res.clearCookie('SessionCookie');
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
            findPost({ id, users, headers, socket, sessionid, res }, true)

        });

        function updatePost(user, postId, newTitle, newContent) {
            const postIndex = user.posts.findIndex(post => post.id === postId);
            if (postIndex !== -1) {
                user.posts[postIndex].title = newTitle;
                user.posts[postIndex].content = newContent;
                user.posts[postIndex].updatedAt = new Date().toISOString();
                return true;
            }
            return false;
        }

        function deletePost(user, postId) {
            const postIndex = user.posts.findIndex(post => post.id === postId);
            if (postIndex !== -1) {
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

            if (user) {
                const { Title, Body } = req.body;
                const postId = req.cookies.editingPostId;

                if (postId && Title && Body) {
                    if (updatePost(user, postId, Title, Body)) {
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

            if (user) {

                const postId = req.body.postId;
                console.log('Received postId:', postId);

                if (postId) {
                    // Check if the post belongs to the user
                    const postExists = user.posts.some(post => post.id === postId);
                    if (postExists) {
                        if (deletePost(user, postId)) {


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
        app.get("/published", (req, res) => {

            const headers = req.headers;
            const socket = req.socket;
            const sessionID = req.sessionID;
            const postsWithoutContent = getPostsList({ headers, socket, sessionID, users }, undefined)
            if (req.query.success == 'true') {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post has been published successfully!", formatDate: formatDate });
            }
            else {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post failed to publish!", formatDate: formatDate });
            }
   

        });

        app.get("/deleted", (req, res) => {
            const headers = req.headers;
            const socket = req.socket;
            const sessionID = req.sessionID;
            const postsWithoutContent = getPostsList({ headers, socket, sessionID, users }, undefined)
            if (req.query.success == 'true') {
                console.log(postsWithoutContent.length)
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post has been removed.", formatDate: formatDate });
            }
            else {
                res.render("posts.ejs", { posts: postsWithoutContent, logged: true, message: "Post failed to delete!", formatDate: formatDate });
            }

        });

        app.get("/updated", (req, res) => {
            const headers = req.headers;
            const socket = req.socket;
            const sessionID = req.sessionID;
            const postsWithoutContent = getPostsList({ headers, socket, sessionID, users }, undefined)
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