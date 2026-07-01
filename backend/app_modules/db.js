const mysql = require("mysql2");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

// Adatbázis konfiguráció
const dbConfig = {
    host: "localhost",
    user: "root",
    password: "",
    database: "NOTED",
    waitForConnections: true,
    queueLimit: 0
};

// Pool létrehozása a stabilabb működésért
const pool = mysql.createPool(dbConfig);

// Session tábla beállításai
const sessionOptions = {
    createDatabaseTable: true,
    schema: {
        tableName: 'sessions'
    }
};

// Session store létrehozása a pool segítségével
const sessionStore = new MySQLStore(sessionOptions, pool);

// Exportáljuk a pool-t és a sessionStore-t is
module.exports = {
    db: pool,
    sessionStore: sessionStore
};