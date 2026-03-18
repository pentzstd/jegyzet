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
    database: "noted"
})

//  start server
app.listen(PORT, (err) => { if (err) { "Hiba a szerver elindulásakor!" } else { "A szerver a %s porton fut...", PORT } })



//  help functions

//  shortcut to files in the publicccccccc folder
function sf(file) { return path.join(__dirname, "public", "file") }


// routing

// live share link
app.get("/j", (req, res) => {
    const link = "https://prod.liveshare.vsengsaas.visualstudio.com/join?5A56C72F43AE8EBC7A50DD11E339D76DF007";
    res.send(link)
})

app.get("/", (req, res) => {
    res.sendFile(sf("index.html"))
})