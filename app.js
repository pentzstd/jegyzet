//  require
const express = require("express")
const session = require("express-session")
const path = require("path")
const mysql = require("mysql2")

//  port
const PORT = 3000

//  static folder es json decodolas
const app = express()
app.use(session({
    secret: "alma",
    resave: false,
    saveUninitialized: false,
    cookie: {secure:false}
}))
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
    const link = "https://prod.liveshare.vsengsaas.visualstudio.com/join?DBB70E47E1D95C2BCE43FBB9852B8735F2BE";
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
//registering
app.post("/register", (req, res) => {
    const sql = "INSERT INTO users (email, password) VALUES (?,?)"
    const {email,password} = req.body

    db.query(sql, [email, password], (err, results) => {
        if (err) { return res.json({ success: false }) }
        else { 
            req.session.user = {
                id: results.insertId,
                email: email
            }
            res.json({ success: true, user: req.session.user }) 
        }
    })
})

//  login managing
app.post("/login", (req, res) => {
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    const { email, password } = req.body;

    db.query(sql, [email, password], (err, results) => {
        if (err) return res.json({ success: false, err:err });

        if (results.length > 0) {
            const user = results[0];
            
            // 1. Beállítjuk az adatokat
            req.session.user = {
                id: user.id,
                email: user.email
            };

            // 2. KÉNYSZERÍTETT MENTÉS (Ez a kulcs!)
            req.session.save((err) => {
                if (err) return res.json({ success: false });
                // Csak ha a mentés KÉSZ, akkor küldjük a választ a kliensnek
                res.json({ success: true });
            });
        } else {
            res.json({ success: false });
        }
    });
});

//  user data
app.get("/me", (req, res) => {
    res.json(req.session.user || null)
})