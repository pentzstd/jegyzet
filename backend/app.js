const express = require("express");
const session = require("express-session");
const path = require("path");

// Importáljuk a db modult (destrukturálással kiszedjük a db-t és a store-t)
const { db, sessionStore } = require("./db"); 

const port = 3000;
const app = express();

// Session mentési beállításai
app.use(session({
    key: "session_id",
    secret: "alma",
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // A db.js-ből jön
    rolling: true,
    cookie: {
        secure: false, // Fejlesztés alatt false, élesben HTTPS-sel true
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10
    }
}));

// Statikus fájlok és JSON feldolgozás
app.use(express.static(path.join(__dirname, "..", "frontend")));
app.use(express.json());

// Szerver indítása (A console.log-ot javítottam, mert a te kódodban csak stringek álltak magukban)
app.listen(port, (err) => { 
    if (err) {
        console.error("Hiba a szerver indulásakor!", err);
    } else {
        console.log(`A szerver figyel a ${port} porton...`);
    }
});



// exports
module.exports = app;



// imports
