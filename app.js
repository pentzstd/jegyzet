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
    const link = "https://prod.liveshare.vsengsaas.visualstudio.com/join?4647618E29F3B0A0FDF5772180C3FD6729F2";
    res.send(link)
})

app.get("/", (req, res) => {
    res.sendFile(sf("index.html"))
})