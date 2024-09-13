import express from "express";
import bodyparser from "body-parser";
import json from "json";
import { v4 as uuid } from 'uuid';
import session from "express-session";


let users = {
        "users": [
                {"username": "admin", "password":"1234", posts:[]}
        ]
    }

const app = express();
const port = 3000;


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
    console.log(req.sessionID)
    res.render("index.ejs");
});
app.get("/login", (req, res) =>
{
    res.render("login.ejs");
});
app.listen(port, () =>
{
    console.log(`Server started at port ${port}`);
});