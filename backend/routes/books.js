
const express = require("express");
const router = express.Router();

const db = require("../database");
const authenticateUser = require("../middleware/authMiddleware");
router.use(authenticateUser);

// Add a new book
router.post("/", (req, res) => {
    try {
        const {
            title,
            author,
            genre,
            total_pages,
            current_page
        } = req.body;

        // Validate required fields
        if (!title || !author || total_pages === undefined) {
            return res.status(400).json({
                message: "Title, author and total pages are required."
            });
        }

        // Validate page numbers
        const pages = Number(total_pages);
        const currentPage = current_page === undefined
            ? 0
            : Number(current_page);

        if (
            !Number.isInteger(pages) ||
            pages <= 0 ||
            !Number.isInteger(currentPage) ||
            currentPage < 0 ||
            currentPage > pages
        ) {
            return res.status(400).json({
                message: "Please enter valid page numbers."
            });
        }

        // Determine reading status
        let status = req.body.status || "To Read";

        if (currentPage === pages) {
            status = "Completed";
        } else if (currentPage > 0 && status === "To Read") {
            status = "Reading";
        }

        const allowedStatuses = [
            "To Read",
            "Reading",
            "Completed",
            "On Hold",
            "Dropped"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid reading status."
            });
        }
        
        // Set completion date if book is completed
        const dateCompleted = status === "Completed"
            ? new Date().toISOString().slice(0, 10)
            : null;

        // Insert book for the logged-in user
        const result = db.prepare(`
            INSERT INTO books (
                user_id,
                title,
                author,
                genre,
                total_pages,
                current_page,
                status,
                date_completed
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            req.user.user_id,
            title,
            author,
            genre || null,
            pages,
            currentPage,
            status,
            dateCompleted
        );

        res.status(201).json({
            message: "Book added successfully!",
            book_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error("Add book error:", error);

        res.status(500).json({
            message: "Unable to add book."
        });
    }
});


// Get all books belonging to the logged-in user
router.get("/", (req, res) => {
    try {
        const books = db.prepare(`
            SELECT *
            FROM books
            WHERE user_id = ?
            ORDER BY book_id DESC
        `).all(req.user.user_id);

        res.status(200).json({
            message: "Books retrieved successfully!",
            total_books: books.length,
            books: books
        });

    } catch (error) {
        console.error("Fetch books error:", error);

        res.status(500).json({
            message: "Unable to retrieve books."
        });
    }
});


// Update a book
router.put("/:id", (req, res) => {
    try {
        const bookId = Number(req.params.id);
        const userId = req.user.user_id;

        const {
            title,
            author,
            genre,
            total_pages,
            current_page,
            status,
            rating,
            review
        } = req.body;

        // Check whether the book belongs to this user
        const book = db.prepare(`
            SELECT * FROM books
            WHERE book_id = ? AND user_id = ?
        `).get(bookId, userId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        const newTotalPages = total_pages === undefined
            ? book.total_pages
            : Number(total_pages);

        const newCurrentPage = current_page === undefined
            ? book.current_page
            : Number(current_page);

        // Validate page numbers
        if (
            !Number.isInteger(newTotalPages) ||
            newTotalPages <= 0 ||
            !Number.isInteger(newCurrentPage) ||
            newCurrentPage < 0 ||
            newCurrentPage > newTotalPages
        ) {
            return res.status(400).json({
                message: "Please enter valid page numbers."
            });
        }

        // Determine reading status
        let newStatus = status ?? book.status;

        if (newCurrentPage === newTotalPages) {
            newStatus = "Completed";
        } else if (newCurrentPage > 0 && newStatus === "To Read") {
            newStatus = "Reading";
        }

        const allowedStatuses = [
            "To Read",
            "Reading",
            "Completed",
            "On Hold",
            "Dropped"
        ];

        if (!allowedStatuses.includes(newStatus)) {
            return res.status(400).json({
                message: "Invalid reading status."
            });
        }

        // Validate rating
        if (
            rating !== undefined &&
            rating !== null &&
            (!Number.isInteger(rating) || rating < 1 || rating > 5)
        ) {
            return res.status(400).json({
                message: "Rating must be between 1 and 5."
            });
        }

        // Set completion date
        const dateCompleted = newStatus === "Completed"
            ? (book.date_completed ||
                new Date().toISOString().slice(0, 10))
            : null;

        // Update book
        db.prepare(`
            UPDATE books
            SET title = ?,
                author = ?,
                genre = ?,
                total_pages = ?,
                current_page = ?,
                status = ?,
                rating = ?,
                review = ?,
                date_completed = ?
            WHERE book_id = ? AND user_id = ?
        `).run(
            title ?? book.title,
            author ?? book.author,
            genre ?? book.genre,
            newTotalPages,
            newCurrentPage,
            newStatus,
            rating === undefined ? book.rating : rating,
            review ?? book.review,
            dateCompleted,
            bookId,
            userId
        );

        res.status(200).json({
            message: "Book updated successfully!"
        });

    } catch (error) {
        console.error("Update book error:", error);

        res.status(500).json({
            message: "Unable to update book."
        });
    }
});


// Delete a book
router.delete("/:id", (req, res) => {
    try {
        const bookId = Number(req.params.id);
        const userId = req.user.user_id;

        // Check whether the book belongs to this user
        const book = db.prepare(`
            SELECT * FROM books
            WHERE book_id = ? AND user_id = ?
        `).get(bookId, userId);

        if (!book) {
            return res.status(404).json({
                message: "Book not found."
            });
        }

        // Delete the book
        db.prepare(`
            DELETE FROM books
            WHERE book_id = ? AND user_id = ?
        `).run(bookId, userId);

        res.status(200).json({
            message: "Book deleted successfully!"
        });

    } catch (error) {
        console.error("Delete book error:", error);

        res.status(500).json({
            message: "Unable to delete book."
        });
    }
});


// Search and filter books
router.get("/search", (req, res) => {
    try {
        const userId = req.user.user_id;

        const { search, genre, status } = req.query;

        let query = `
            SELECT *
            FROM books
            WHERE user_id = ?
        `;

        const params = [userId];

        // Search by title or author
        if (search) {
            query += `
                AND (
                    title LIKE ?
                    OR author LIKE ?
                )
            `;

            params.push(`%${search}%`, `%${search}%`);
        }

        // Filter by genre
        if (genre) {
            query += ` AND genre = ?`;
            params.push(genre);
        }

        // Filter by reading status
        if (status) {
            const allowedStatuses = [
                "To Read",
                "Reading",
                "Completed",
                "On Hold",
                "Dropped"
            ];

            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    message: "Invalid reading status."
                });
            }

            query += ` AND status = ?`;
            params.push(status);
        }

        query += ` ORDER BY book_id DESC`;

        const books = db.prepare(query).all(...params);

        res.status(200).json({
            message: "Books retrieved successfully!",
            total_books: books.length,
            books: books
        });

    } catch (error) {
        console.error("Search books error:", error);

        res.status(500).json({
            message: "Unable to search books."
        });
    }
});

module.exports = router;
