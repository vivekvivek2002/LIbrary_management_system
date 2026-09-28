const pool = require("../config/db");

// Get all books
exports.getAllBooks = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                b.id,
                b.title,
                b.author,
                b.isbn,
                COUNT(c.id)::int AS total_copies,
                COUNT(
                    CASE
                        WHEN c.condition = 'good'
                        AND NOT EXISTS (
                            SELECT 1
                            FROM loans l
                            WHERE l.copy_id = c.id
                            AND l.returned_at IS NULL
                        )
                        THEN 1
                    END
                )::int AS available_copies
            FROM books b
            LEFT JOIN copies c ON c.book_id = b.id
            GROUP BY b.id
            ORDER BY b.id DESC
        `);

        res.json(result.rows);

    } catch (error) {
        console.error("Get books error:", error);

        res.status(500).json({
            message: "Failed to get books"
        });
    }
};


// Create a new book
exports.createBook = async (req, res) => {
    try {
        const { title, author, isbn } = req.body;

        if (!title || !author || !isbn) {
            return res.status(400).json({
                message: "Title, author and ISBN are required"
            });
        }

        const result = await pool.query(
            `
            INSERT INTO books (title, author, isbn)
            VALUES ($1, $2, $3)
            RETURNING *
            `,
            [title, author, isbn]
        );

        res.status(201).json({
            message: "Book created successfully",
            book: result.rows[0]
        });

    } catch (error) {
        console.error("Create book error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "ISBN already exists"
            });
        }

        res.status(500).json({
            message: "Failed to create book"
        });
    }
};


// Update a book
exports.updateBook = async (req, res) => {
    try {
        const { bookId } = req.params;
        const { title, author, isbn } = req.body;

        if (!title || !author || !isbn) {
            return res.status(400).json({
                message: "Title, author and ISBN are required"
            });
        }

        const result = await pool.query(
            `
            UPDATE books
            SET title = $1,
                author = $2,
                isbn = $3
            WHERE id = $4
            RETURNING *
            `,
            [title, author, isbn, bookId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Book not found"
            });
        }

        res.json({
            message: "Book updated successfully",
            book: result.rows[0]
        });

    } catch (error) {
        console.error("Update book error:", error);

        if (error.code === "23505") {
            return res.status(409).json({
                message: "ISBN already exists"
            });
        }

        res.status(500).json({
            message: "Failed to update book"
        });
    }
};


// Delete a book
exports.deleteBook = async (req, res) => {
    const client = await pool.connect();

    try {
        const { bookId } = req.params;

        await client.query("BEGIN");

        // Check if book exists
        const bookResult = await client.query(
            `
            SELECT id
            FROM books
            WHERE id = $1
            `,
            [bookId]
        );

        if (bookResult.rows.length === 0) {
            await client.query("ROLLBACK");

            return res.status(404).json({
                message: "Book not found"
            });
        }

        // Check whether the book has ever been borrowed
        const loanResult = await client.query(
            `
            SELECT l.id
            FROM loans l
            JOIN copies c ON c.id = l.copy_id
            WHERE c.book_id = $1
            LIMIT 1
            `,
            [bookId]
        );

        if (loanResult.rows.length > 0) {
            await client.query("ROLLBACK");

            return res.status(409).json({
                message: "Book cannot be deleted because it has loan history"
            });
        }

        // Delete copies first
        await client.query(
            `
            DELETE FROM copies
            WHERE book_id = $1
            `,
            [bookId]
        );

        // Delete book
        const result = await client.query(
            `
            DELETE FROM books
            WHERE id = $1
            RETURNING *
            `,
            [bookId]
        );

        await client.query("COMMIT");

        res.json({
            message: "Book deleted successfully",
            book: result.rows[0]
        });

    } catch (error) {
        await client.query("ROLLBACK");

        console.error("Delete book error:", error);

        res.status(500).json({
            message: "Failed to delete book"
        });

    } finally {
        client.release();
    }
};