
const express = require("express");
const router = express.Router();

const db = require("../database");

// Set or update a reading goal
router.post("/", (req, res) => {
    try {
        const userId = req.user.user_id;
        const { year, target_books } = req.body;

        // Validate input
        if (!Number.isInteger(year) || !Number.isInteger(target_books)) {
            return res.status(400).json({
                message: "Year and target books must be whole numbers."
            });
        }

        if (year < 2000 || target_books <= 0) {
            return res.status(400).json({
                message: "Please enter a valid year and reading target."
            });
        }

        // Check whether a goal already exists for this year
        const existingGoal = db.prepare(`
            SELECT * FROM reading_goals
            WHERE user_id = ? AND year = ?
        `).get(userId, year);

        if (existingGoal) {
            // Update existing goal
            db.prepare(`
                UPDATE reading_goals
                SET target_books = ?
                WHERE user_id = ? AND year = ?
            `).run(target_books, userId, year);

            return res.status(200).json({
                message: "Reading goal updated successfully!"
            });
        }

        // Create a new goal
        const result = db.prepare(`
            INSERT INTO reading_goals (
                user_id,
                year,
                target_books
            )
            VALUES (?, ?, ?)
        `).run(userId, year, target_books);

        res.status(201).json({
            message: "Reading goal created successfully!",
            goal_id: result.lastInsertRowid
        });

    } catch (error) {
        console.error("Reading goal error:", error);

        res.status(500).json({
            message: "Unable to save reading goal."
        });
    }
});


 // Get all reading goals with progress
router.get("/", (req, res) => {
    try {
        const userId = req.user.user_id;

        const goals = db.prepare(`
            SELECT
                rg.goal_id,
                rg.year,
                rg.target_books,

                COUNT(
                    CASE
                        WHEN b.status = 'Completed'
                        AND b.date_completed IS NOT NULL
                        AND strftime('%Y', b.date_completed) = CAST(rg.year AS TEXT)
                        THEN 1
                    END
                ) AS completed_books

            FROM reading_goals rg

            LEFT JOIN books b
                ON rg.user_id = b.user_id

            WHERE rg.user_id = ?

            GROUP BY rg.goal_id
            ORDER BY rg.year DESC
        `).all(userId);

        const goalsWithProgress = goals.map(goal => {
            const remaining = Math.max(
                0,
                goal.target_books - goal.completed_books
            );

            const percentage = Math.min(
                100,
                Math.round(
                    (goal.completed_books / goal.target_books) * 100
                )
            );

            return {
                ...goal,
                remaining_books: remaining,
                progress_percentage: percentage
            };
        });

        res.status(200).json({
            message: "Reading goals retrieved successfully!",
            goals: goalsWithProgress
        });

    } catch (error) {
        console.error("Fetch reading goals error:", error);

        res.status(500).json({
            message: "Unable to retrieve reading goals."
        });
    }
});

// DELETE a reading goal
router.delete("/:id", (req, res) => {
    try {
        const userId = req.user.user_id;
        const goalId = Number(req.params.id);

        const result = db.prepare(`
            DELETE FROM reading_goals
            WHERE goal_id = ? AND user_id = ?
        `).run(goalId, userId);

        if (result.changes === 0) {
            return res.status(404).json({
                message: "Reading goal not found."
            });
        }

        res.status(200).json({
            message: "Reading goal deleted successfully!"
        });

    } catch (error) {
        console.error("Delete reading goal error:", error);

        res.status(500).json({
            message: "Unable to delete reading goal."
        });
    }
});

module.exports = router;
