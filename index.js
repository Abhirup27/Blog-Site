import express from "express";
import bodyparser from "body-parser";
import json from "json";
let users = {
        "users": [
                {"username": "admin", "password":"1234"}
        ]
    }

const app = express();
const port = 3000;
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.get("/", (req,res) =>
{
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