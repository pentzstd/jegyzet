//  require
const express = require("express")
const session = require("express-session")
const path = require("path")
const mysql = require("mysql2")
const cookieStore = require("express-mysql-session")(session)

//  port
const PORT = 3000

let dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "NOTED"
};

let sessionOptions = {
    createDatabaseTable: true, // Ez hozza létre a táblát automatikusan
    schema: {
        tableName: 'sessions' // Opcionális: megadhatod a tábla nevét
    }
};

// Csatlakozás az adatbázishoz
let db = mysql.createConnection(dbConfig);

const sessionStore = new cookieStore(sessionOptions, db);

const app = express();

app.use(session({
    key: "session_id",
    secret: "alma",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    rolling: true,
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10
    }
}));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())



//  start server
app.listen(PORT, (err) => { if (err) { "Hiba a szerver elindulásakor!" } else { "A szerver a %s porton fut...", PORT } })



//  help functions

//  shortcut to files in the publicccccccc folder
function sf(file) { return path.join(__dirname, "public", file) }





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
    const sqlI = "INSERT INTO projects (project_name) VALUES (?)";

    let name = "New Project"

    // First insert the project
    db.query(sqlI, [name], (errI, resultsI) => {
        if (errI) return res.json({ success: false });

        const newProjectId = resultsI.insertId; // mysql gives you this automatically

        // Then link it to the user in the junction table
        const sqlLink = "INSERT INTO user_projects (user_id, project_id) VALUES (?, ?)";
        db.query(sqlLink, [userId, newProjectId], (errL) => {
            if (errL) return res.json({ success: false });
            res.json({ success: true, projectId: newProjectId, name: name});
        });
    });
});

app.post("/set-new-open-project", (req, res) => {
    const {new_open_project_id} = req.body
    if (new_open_project_id != "NO") req.session.user.open_project_id = new_open_project_id;

    const sql = "SELECT * FROM modules WHERE project_id = ?"
    db.query(sql, [req.session.user.open_project_id], (err, results) => {
        if (err) return res.json({ success:false });
        res.json({success: true, modules:results, new_id:req.session.user.open_project_id})
    })
})

app.get("/get-user-projects", (req, res) => {
    const userId = req.session.user.id;

    const sql = `
        SELECT projects.*
        FROM projects
        JOIN user_projects ON projects.id = user_projects.project_id
        WHERE user_projects.user_id = ?
    `;

    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        let projectExists = false
        for (const result of results) {
            if (req.session.user.open_project_id == result.id) {
                projectExists = true
                break;
            }
        }
        //if (!projectExists) req.session.user.open_project_id = results[0].id
        res.json({results:results, open_project_id: req.session.user.open_project_id});
    });
});

app.delete("/delete-project", (req, res) => {
    const { projectId } = req.body;
    const userId = req.session.user.id;

    const sqlDeleteLink = "DELETE FROM user_projects WHERE project_id = ? AND user_id = ?";

    db.query(sqlDeleteLink, [projectId, userId], (errL, resultsL) => {
        if (errL) return res.json({ success: false, error: errL });

        if (resultsL.affectedRows === 0) {
            return res.json({ success: false, message: "Nincs jogosultság vagy nem létezik." });
        }

        const sqlDeleteProject = "DELETE FROM projects WHERE id = ?";
        
        db.query(sqlDeleteProject, [projectId], (errP) => {
            if (errP) return res.json({ success: false, error: errP });
            
            res.json({ success: true, message: "Projekt sikeresen törölve." });
        });
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

app.post("/create-new-module", (req, res) => {
    const defPos = {x: 25, y: 25}
    const {title, module} = req.body
    const sql = "INSERT INTO modules (title, data, project_id, xPos, yPos) VALUES (?, ?, ?, ?, ?)"

    db.query(sql, [title, module, req.session.user.open_project_id, defPos.x, defPos.y], (err, results) => {
        if (err) return res.json({success: false})
        return res.json({success:true, id: results.insertId, xPos: results.xPos})
    })
})

app.put("/update-modules", (req, res) => {
    const modulePositions = req.body.positions; // {id, x, y} objektumok listája
    const sql = "UPDATE modules SET xPos = ?, yPos = ? WHERE id = ?";
    
    let completed = 0;
    let hasError = false;

    if (modulePositions.length === 0) return res.json({ success: true });

    modulePositions.forEach(el => {
        db.query(sql, [el.x, el.y, el.id], (err, results) => {
            if (err) {
                hasError = true;
            }
            completed++;

            // Csak akkor válaszolunk, ha az ÖSSZES lekérdezés lefutott
            if (completed === modulePositions.length) {
                if (hasError) return res.status(500).json({ success: false });
                return res.json({ success: true });
            }
        });
    });
});

// routing

// live share link
app.get("/j", (req, res) => {
    const link = "https://prod.liveshare.vsengsaas.visualstudio.com/join?6BF44C3FECB1EF8225DFA81A909F84C554E0";
    res.send(link)
})


app.get("/projects", (req, res) => {
    res.sendFile(sf("projects.html"))
})

