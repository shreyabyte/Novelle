
const db = require("../database");

// 1. Users table
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// 2. Books table
db.exec(`
    CREATE TABLE IF NOT EXISTS books (
        book_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT,
        total_pages INTEGER NOT NULL,
        current_page INTEGER DEFAULT 0,
        status TEXT DEFAULT 'To Read',
        rating INTEGER,
        review TEXT,
        date_started DATE,
        date_completed DATE,

        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
    )
`);

// 3. Reading goals table
db.exec(`
    CREATE TABLE IF NOT EXISTS reading_goals (
        goal_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        year INTEGER NOT NULL,
        target_books INTEGER NOT NULL,

        UNIQUE(user_id, year),

        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
    )
`);

// 4. Journal entries table
db.exec(`
    CREATE TABLE IF NOT EXISTS journal_entries (
        entry_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        book_id INTEGER,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE,

        FOREIGN KEY (book_id)
        REFERENCES books(book_id)
        ON DELETE SET NULL
    )
`);

// 5. Wishlist table
db.exec(`
    CREATE TABLE IF NOT EXISTS wishlist (
        wishlist_id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        author TEXT NOT NULL,
        genre TEXT,
        added_at DATETIME DEFAULT CURRENT_TIMESTAMP,

        FOREIGN KEY (user_id)
        REFERENCES users(user_id)
        ON DELETE CASCADE
    )
`);

console.log("All database tables created successfully!");
