
const express = require("express");
const bcrypt = require("bcryptjs");

const router = express.Router();
const db = require("../database");

// User Registration
router.post("/register", (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if all fields are provided
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Please fill in all fields."
            });
        }

        // Check if the email is already registered
        const existingUser = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (existingUser) {
            return res.status(409).json({
                message: "Email is already registered."
            });
        }

        // Hash the password before storing it
        const hashedPassword = bcrypt.hashSync(password, 10);

        // Insert the new user into the database
        const result = db.prepare(`
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
        `).run(name, email, hashedPassword);

        res.status(201).json({
            message: "Registration successful!",
            user: {
                user_id: result.lastInsertRowid,
                name: name,
                email: email
            }
        });

    } catch (error) {
        console.error("Registration error:", error);

        res.status(500).json({
            message: "Something went wrong during registration."
        });
    }
});


const jwt = require("jsonwebtoken");

// User Login
router.post("/login", (req, res) => {
    try {
        const { email, password } = req.body;

        // Check whether fields are provided
        if (!email || !password) {
            return res.status(400).json({
                message: "Please enter email and password."
            });
        }

        // Find user by email
        const user = db.prepare(
            "SELECT * FROM users WHERE email = ?"
        ).get(email);

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Compare entered password with hashed password
        const isPasswordValid = bcrypt.compareSync(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password."
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                user_id: user.user_id,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.status(200).json({
            message: "Login successful!",
            token: token,
            user: {
                user_id: user.user_id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login error:", error);

        res.status(500).json({
            message: "Something went wrong during login."
        });
    }
});

module.exports = router;
