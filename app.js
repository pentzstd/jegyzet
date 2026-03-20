//  require
const express = require("express")
const session = require("express-session")
const path = require("path")
const mysql = require("mysql2")

//  port
const PORT = 3000

//  static folder es json decodolas
const app = express()
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())

//  csatlakozas az adatbazishoz
let db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "NOTED"
})

//  start server
app.listen(PORT, (err) => { if (err) { "Hiba a szerver elindulásakor!" } else { "A szerver a %s porton fut...", PORT } })



//  help functions

//  shortcut to files in the publicccccccc folder
function sf(file) { return path.join(__dirname, "public", file) }


// routing

// live share link
app.get("/j", (req, res) => {
    const link = "https://prod.liveshare.vsengsaas.visualstudio.com/join?7473CCC00ED20B3D652E554AB7A6C05CE055";
    res.send(link)
})


app.get("/:user_id/:project", (req, res) => {
    res.sendFile(sf("projects.html"))
})

app.get("/", (req, res) => {
    res.sendFile(sf("index.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(sf("login-register.html"))
})

app.get("/register", (req, res) => {
    res.sendFile(sf("login-register.html"))
})



//  actions
app.post("/register", (req, res) => {
    req.body;
})