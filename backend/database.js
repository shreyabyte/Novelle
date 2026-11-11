
const Database = require("better-sqlite3");
const path = require("path");

// Connect to SQLite database
const db = new Database(
    path.join(__dirname, "database", "reading_tracker.db")
);

// Enable foreign key relationships
db.pragma("foreign_keys = ON");

console.log("SQLite database connected successfully!");

module.exports = db;
