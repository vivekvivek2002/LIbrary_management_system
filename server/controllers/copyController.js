const pool=require("../config/db");

// / Add copy to a book
exports.createCopy = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { copy_code, condition = "good" } = req.body;

    if (!copy_code) {
      return res.status(400).json({
        message: "Copy code is required",
      });
    }

    if (!["good", "damaged", "lost"].includes(condition)) {
      return res.status(400).json({
        message: "Invalid copy condition",
      });
    }

    // Check whether book exists
    const book = await pool.query(
      "SELECT id FROM books WHERE id = $1",
      [bookId]
    );

    if (book.rows.length === 0) {
      return res.status(404).json({
        message: "Book not found",
      });
    }

    const result = await pool.query(
      `INSERT INTO copies (book_id, copy_code, condition)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [bookId, copy_code, condition]
    );

    res.status(201).json({
      message: "Copy created successfully",
      copy: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    if (error.code === "23505") {
      return res.status(409).json({
        message: "Copy code already exists",
      });
    }

    res.status(500).json({
      message: "Failed to create copy",
    });
  }
};

// Get copies of a book
exports.getBookCopies = async (req, res) => {
  try {
    const { bookId } = req.params;

    const result = await pool.query(
      `SELECT
        c.id,
        c.book_id,
        c.copy_code,
        c.condition,
        CASE
          WHEN c.condition = 'good'
          AND NOT EXISTS (
            SELECT 1
            FROM loans l
            WHERE l.copy_id = c.id
            AND l.returned_at IS NULL
          )
          THEN true
          ELSE false
        END AS available
       FROM copies c
       WHERE c.book_id = $1
       ORDER BY c.id`,
      [bookId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch copies",
    });
  }
};

// Update copy condition
exports.updateCopyCondition = async (req, res) => {
  try {
    const { copyId } = req.params;
    const { condition } = req.body;

    if (!["good", "damaged", "lost"].includes(condition)) {
      return res.status(400).json({
        message: "Invalid copy condition",
      });
    }

    const result = await pool.query(
      `UPDATE copies
       SET condition = $1
       WHERE id = $2
       RETURNING *`,
      [condition, copyId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Copy not found",
      });
    }

    res.json({
      message: "Copy condition updated",
      copy: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update copy",
    });
  }
};