import express from "express";
import bodyparser from "body-parser";
import json from "json";
import { v4 as uuid } from 'uuid';
import session from "express-session";


let users = [
    {
        id: "1",
        username: "admin",
        password: "1234",
        email: "admin@example.com",
        lastLoginIp: "",
        session: "",
        posts: [{title:"TEST",content:"This is a sample text."}],
        createdAt: "2024-09-14T12:00:00Z",
        updatedAt: "2024-09-14T12:00:00Z"
    }
];
const app = express();
const port = process.env.PORT || 8080;


app.use(session(
{ name:'SessionCookie',
  genid: function(req) {
      //console.log('session id created');
    return uuid();}, 
  secret: 'Shsh!Secret!',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false,expires:60000 }
    }));
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));

app.get("/", (req,res) =>
{
    let ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u=>u.session == req.sessionID && u.lastLoginIp == ipAddress);
    if (user) {
        //res.send('Login successful!');
        res.render("posts.ejs", {posts:user.posts,  logged:true});
    }
    else
    {
        res.render("index.ejs");
    }
});


function getClientIp(req) {
    return req.headers['x-forwarded-for']?.split(',').shift()
      || req.socket?.remoteAddress;
  }

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Find the user
    let user = users.find(u => u.username === username && u.password === password);
    req.session.username=req.sessionID;
    console.log(req.sessionID)
    const ipAddress = getClientIp(req);

    if (user) {
        user.lastLoginIp = ipAddress;
        user.session = req.sessionID;
        res.render("posts.ejs", {posts:user.posts, logged:true});
        //res.send('Login successful!');

    } else {
        res.status(401).send('Invalid username or password');
    }
});

app.listen(port, () =>
{
    console.log(`Server started at port ${port}`);
});

app.get("/logout", (req, res) => {
    const ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u=>u.session == req.sessionID && u.lastLoginIp == ipAddress);
    if (user) {
        //res.send('Login successful!');
        user.session = ""
        user.lastLoginIp= ""
        res.render("index.ejs", { logged: false, message: "Logged out successfully!" });
    }
    else
    {
        res.render("index.ejs", { message: "No active session found." });
    }
    // res.send("Logged out!");
});

app.post("/publish", (req, res) => {
     const ipAddress = getClientIp(req);
    console.log(req.sessionID)
    let user = users.find(u=>u.session == req.sessionID && u.lastLoginIp == ipAddress);
    if (user) {
        
        if (req.body.Title) {
            const newPost = {
                title: req.body.Title,
                content: req.body.Body
            };
            user.posts.push(newPost);
            user.updatedAt = new Date().toISOString();
            res.render("posts.ejs", { posts:user.posts, logged: true, message: "Post published successfully!" });
        }
        else {
            res.render("publish.ejs", { logged: true });
        }
    }
    else
    {
        res.render("index.ejs");
    }

});