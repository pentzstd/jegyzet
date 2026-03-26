//  require
const express = require("express")
const session = require("express-session")
const path = require("path")
const mysql = require("mysql2")
const cookieStore = require("express-mysql-session")(session)

//  port
const PORT = 3000

//  csatlakozas az adatbazishoz
let dbOptions = {
    host: "localhost",
    user: "root",
    password: "",
    database: "NOTED"
}
const sessionStore = new cookieStore(dbOptions);
let db = mysql.createConnection(dbOptions)

//  static folder es json decodolas
const app = express()
app.use(session({
    key: "session_id",
    secret: "alma",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    rolling: true,
    cookie: {
        secure:false,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10
    }
}))
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())



//  start server
app.listen(PORT, (err) => { if (err) { "Hiba a szerver elindulásakor!" } else { "A szerver a %s porton fut...", PORT } })



//  help functions

//  shortcut to files in the publicccccccc folder
function sf(file) { return path.join(__dirname, "public", file) }





// routing

// live share link
app.get("/j", (req, res) => {
    const link = "https://prod.liveshare.vsengsaas.visualstudio.com/join?6BF44C3FECB1EF8225DFA81A909F84C554E0";
    res.send(link)
})


app.get("/:user_id/:project_id", (req, res) => {
    res.sendFile(sf("projects.html"))
})

app.get("/", (req, res) => {
    res.sendFile(sf("index.html"))
})

app.get("/login", (req, res) => {
    res.sendFile(sf("login.html"))
})

app.get("/register", (req, res) => {
    res.sendFile(sf("register.html"))
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
            
            req.session.user = {
                id: user.id,
                email: email
            };

            req.session.save((err) => {
                if (err) return res.json({ success: false });
                res.json({ success: true });
            });
        } else {
            res.json({ success: false });
        }
    });
});

app.post("/create-project", (req, res) => {
    const userId = req.session.user.id;
    const sqlI = "INSERT INTO note_projects (project_name) VALUES (?)";

    let name = "New Project"

    // First insert the project
    db.query(sqlI, [name], (errI, resultsI) => {
        if (errI) return res.json({ success: false });

        const newProjectId = resultsI.insertId; // mysql gives you this automatically

        // Then link it to the user in the junction table
        const sqlLink = "INSERT INTO user_note_projects (user_id, project_id) VALUES (?, ?)";
        db.query(sqlLink, [userId, newProjectId], (errL) => {
            if (errL) return res.json({ success: false });
            res.json({ success: true, projectId: newProjectId, name: name});
        });
    });
});

app.get("/get-user-projects", (req, res) => {
    const userId = req.session.user.id;

    const sql = `
        SELECT note_projects.*
        FROM note_projects
        JOIN user_note_projects ON note_projects.id = user_note_projects.project_id
        WHERE user_note_projects.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

//  user data
app.get("/me", (req, res) => {
    res.json(req.session.user || null)
})

app.get("/log-out", (req, res) => {
    req.session.user = null;
    if (req.session.user !== null) {
        res.sendStatus(501)
    }
    res.sendStatus(200);
})

app.get("/create-new-node", (req, res) => {

})

app.get("/create-new-project", (req, res) => {

})