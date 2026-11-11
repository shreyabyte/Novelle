require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth");
const app = express();
const authenticateUser = require("./middleware/authMiddleware");
const readingGoalsRoutes = require("./routes/readingGoals");

const booksRoutes = require("./routes/books");
app.get("/api/protected", authenticateUser, (req, res) => {
    res.json({
        message: "You have accessed a protected route!",
        user: req.user
    });
});
app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes); 
app.use("/api/books", authenticateUser, booksRoutes);
app.use("/api/reading-goals", authenticateUser, readingGoalsRoutes);
// Wishlist routes
const wishlistRoutes = require("./routes/wishlist");
app.use("/api/wishlist", authenticateUser, wishlistRoutes);
// Database connection
require("./database");

// Create database tables
require("./config/createTables");

app.get("/", (req, res) => {
    res.send("Personal Reading Tracker Backend is running!");
});

const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
