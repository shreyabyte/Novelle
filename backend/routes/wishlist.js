const express = require("express");
const router = express.Router();

const db = require("../database");

// Add a book to wishlist
router.post("/", (req, res) => {
    try {
        const userId = req.user.user_id;
        const { title, author, genre } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                message: "Title and author are required."
            });
        }

        const result = db.prepare(`
            INSERT INTO wishlist (user_id, title, author, genre)
            VALUES (?, ?, ?, ?)
        `).run(userId, title, author, genre || null);

        res.status(201).json({
            message: "Book added to wishlist successfully!",
            wishlist_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error("Add wishlist book error:", error);

        res.status(500).json({
            message: "Unable to add book to wishlist."
        });
    }
});

// Get all wishlisted books
router.get("/", (req, res) => {
    try {
        const userId = req.user.user_id;

        const books = db.prepare(`
            SELECT *
            FROM wishlist
            WHERE user_id = ?
            ORDER BY added_at DESC
        `).all(userId);

        res.status(200).json({
            message: "Wishlist retrieved successfully!",
            books: books
        });

    } catch (error) {
        console.error("Fetch wishlist error:", error);

        res.status(500).json({
            message: "Unable to retrieve wishlist."
        });
    }
});

// Update a wishlisted book
router.put("/:id", (req, res) => {
    try {
        const userId = req.user.user_id;
        const wishlistId = Number(req.params.id);

        const { title, author, genre } = req.body;

        if (!title || !author) {
            return res.status(400).json({
                message: "Title and author are required."
            });
        }

        const result = db.prepare(`
            UPDATE wishlist
            SET title = ?, author = ?, genre = ?
            WHERE wishlist_id = ? AND user_id = ?
        `).run(title, author, genre || null, wishlistId, userId);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Wishlisted book not found."
            });
        }

        res.status(200).json({
            message: "Wishlist book updated successfully!"
        });

    } catch (error) {
        console.error("Update wishlist book error:", error);

        res.status(500).json({
            message: "Unable to update wishlist book."
        });
    }
});

// Delete a wishlisted book
router.delete("/:id", (req, res) => {
    try {
        const userId = req.user.user_id;
        const wishlistId = Number(req.params.id);

        const result = db.prepare(`
            DELETE FROM wishlist
            WHERE wishlist_id = ? AND user_id = ?
        `).run(wishlistId, userId);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Wishlisted book not found."
            });
        }

        res.status(200).json({
            message: "Book removed from wishlist successfully!"
        });

    } catch (error) {
        console.error("Delete wishlist book error:", error);

        res.status(500).json({
            message: "Unable to remove book from wishlist."
        });
    }
});

// Move a book from wishlist to reading list
router.post("/:id/move", (req, res) => {
    try {
        const userId = req.user.user_id;
        const wishlistId = Number(req.params.id);
        const totalPages = Number(req.body.total_pages);

        if (!Number.isInteger(totalPages) || totalPages <= 0) {
            return res.status(400).json({
                message: "Please provide a valid total page count."
            });
        }

        // Find the wishlisted book
        const book = db.prepare(`
            SELECT *
            FROM wishlist
            WHERE wishlist_id = ? AND user_id = ?
        `).get(wishlistId, userId);

        if (!book) {
            return res.status(404).json({
                message: "Wishlisted book not found."
            });
        }

        // Transfer the book and remove it from wishlist
        const moveBook = db.transaction(() => {

            const result = db.prepare(`
                INSERT INTO books
                (user_id, title, author, genre, total_pages, current_page, status)
                VALUES (?, ?, ?, ?, ?, 0, 'To Read')
            `).run(
                userId,
                book.title,
                book.author,
                book.genre,
                totalPages
            );

            db.prepare(`
                DELETE FROM wishlist
                WHERE wishlist_id = ? AND user_id = ?
            `).run(wishlistId, userId);

            return result.lastInsertRowid;
        });

        const newBookId = moveBook();

        res.status(200).json({
            message: "Book moved to reading list successfully!",
            book_id: newBookId
        });

    } catch (error) {
        console.error("Move wishlist book error:", error);

        res.status(500).json({
            message: "Unable to move book to reading list."
        });
    }
});

module.exports = router;