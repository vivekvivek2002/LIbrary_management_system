const pool = require("../config/db");
const calculateFine = require("../utils/fineCalculator");

// ==========================================
// BORROW BOOK - MEMBER
// ==========================================
exports.borrowBook = async (req, res) => {
  const client = await pool.connect();

  try {
    const memberId = req.user.id;
    const { bookId } = req.params;

    await client.query("BEGIN");

    // 1. Check member
    const memberResult = await client.query(
      `SELECT id, role
       FROM users
       WHERE id = $1`,
      [memberId]
    );

    if (memberResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Member not found",
      });
    }

    if (memberResult.rows[0].role !== "member") {
      await client.query("ROLLBACK");

      return res.status(403).json({
        message: "Only members can borrow books",
      });
    }

    // 2. Maximum 3 active loans
    const activeLoansResult = await client.query(
      `SELECT COUNT(*) AS count
       FROM loans
       WHERE member_id = $1
       AND returned_at IS NULL`,
      [memberId]
    );

    const activeLoanCount = Number(
      activeLoansResult.rows[0].count
    );

    if (activeLoanCount >= 3) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "You can borrow a maximum of 3 books",
      });
    }

    // 3. Check overdue loans
    const overdueResult = await client.query(
      `SELECT id
       FROM loans
       WHERE member_id = $1
       AND returned_at IS NULL
       AND due_date < CURRENT_DATE
       LIMIT 1`,
      [memberId]
    );

    if (overdueResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message:
          "You have an overdue loan and cannot borrow another book",
      });
    }

    // 4. Check if member already has this book
    const existingLoanResult = await client.query(
      `SELECT l.id
       FROM loans l
       JOIN copies c
         ON c.id = l.copy_id
       WHERE l.member_id = $1
       AND c.book_id = $2
       AND l.returned_at IS NULL
       LIMIT 1`,
      [memberId, bookId]
    );

    if (existingLoanResult.rows.length > 0) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "You already have this book on loan",
      });
    }

    // 5. Check book exists
    const bookResult = await client.query(
      `SELECT id, title
       FROM books
       WHERE id = $1`,
      [bookId]
    );

    if (bookResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Book not found",
      });
    }

    // 6. Find available copy
    // R6 concurrency protection:
    // database unique partial index prevents
    // two active loans for the same copy.
    const copyResult = await client.query(
      `SELECT c.id, c.copy_code
       FROM copies c
       WHERE c.book_id = $1
       AND c.condition = 'good'
       AND NOT EXISTS (
         SELECT 1
         FROM loans l
         WHERE l.copy_id = c.id
         AND l.returned_at IS NULL
       )
       ORDER BY c.id
       LIMIT 1
       FOR UPDATE OF c`,
      [bookId]
    );

    if (copyResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(409).json({
        message: "No available copy of this book",
      });
    }

    const copy = copyResult.rows[0];

    // 7. Create loan
    const loanResult = await client.query(
      `INSERT INTO loans (
        member_id,
        copy_id,
        borrowed_at,
        due_date
      )
      VALUES (
        $1,
        $2,
        CURRENT_DATE,
        CURRENT_DATE + 14
      )
      RETURNING
        id,
        member_id,
        copy_id,
        borrowed_at,
        due_date,
        returned_at,
        fine`,
      [memberId, copy.id]
    );

    await client.query("COMMIT");

    res.status(201).json({
      message: "Book borrowed successfully",

      loan: loanResult.rows[0],

      copy: {
        id: copy.id,
        copy_code: copy.copy_code,
      },
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Borrow book error:", error);

    // R6: concurrent borrow protection
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Book copy is no longer available",
      });
    }

    res.status(500).json({
      message: "Failed to borrow book",
    });
  } finally {
    client.release();
  }
};


// ==========================================
// GET MY LOANS - MEMBER
// ==========================================
exports.getMyLoans = async (req, res) => {
  try {
    const memberId = req.user.id;

    const result = await pool.query(
      `SELECT
        l.id,
        b.title,
        b.author,
        b.isbn,
        c.copy_code,
        l.borrowed_at,
        l.due_date,
        l.returned_at,

        -- Current overdue fine
        CASE
          WHEN l.returned_at IS NULL
          AND l.due_date < CURRENT_DATE
          THEN (CURRENT_DATE - l.due_date) * 10
          ELSE l.fine
        END AS fine,

        -- Overdue status
        CASE
          WHEN l.returned_at IS NULL
          AND l.due_date < CURRENT_DATE
          THEN true
          ELSE false
        END AS overdue

      FROM loans l

      JOIN copies c
        ON c.id = l.copy_id

      JOIN books b
        ON b.id = c.book_id

      WHERE l.member_id = $1

      ORDER BY l.borrowed_at DESC`,
      [memberId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error("Get my loans error:", error);

    res.status(500).json({
      message: "Failed to fetch loans",
    });
  }
};


// ==========================================
// RETURN BOOK - LIBRARIAN
// ==========================================
exports.returnBook = async (req, res) => {
  const client = await pool.connect();

  try {
    const { loanId } = req.params;
    const { condition } = req.body;

    // 1. Validate condition
    const allowedConditions = [
      "good",
      "damaged",
      "lost",
    ];

    if (
      !condition ||
      !allowedConditions.includes(condition)
    ) {
      return res.status(400).json({
        message:
          "Condition must be good, damaged, or lost",
      });
    }

    await client.query("BEGIN");

    // 2. Find and lock loan
    const loanResult = await client.query(
      `SELECT
        l.id,
        l.member_id,
        l.copy_id,
        l.borrowed_at,
        l.due_date,
        l.returned_at,
        c.copy_code,
        b.title

       FROM loans l

       JOIN copies c
         ON c.id = l.copy_id

       JOIN books b
         ON b.id = c.book_id

       WHERE l.id = $1

       FOR UPDATE`,
      [loanId]
    );

    if (loanResult.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        message: "Loan not found",
      });
    }

    const loan = loanResult.rows[0];

    // 3. Prevent double return
    if (loan.returned_at !== null) {
      await client.query("ROLLBACK");

      return res.status(400).json({
        message: "This loan has already been returned",
      });
    }

    // 4. Calculate final fine
    const fine = calculateFine(
      loan.due_date,
      new Date()
    );

    // 5. Update loan
    const updateLoanResult = await client.query(
      `UPDATE loans

       SET
         returned_at = CURRENT_DATE,
         fine = $1

       WHERE id = $2
       AND returned_at IS NULL

       RETURNING
         id,
         member_id,
         copy_id,
         borrowed_at,
         due_date,
         returned_at,
         fine`,
      [fine, loanId]
    );

    // 6. Update copy condition
    await client.query(
      `UPDATE copies
       SET condition = $1
       WHERE id = $2`,
      [condition, loan.copy_id]
    );

    await client.query("COMMIT");

    res.json({
      message: "Book returned successfully",

      loan: updateLoanResult.rows[0],

      copy: {
        id: loan.copy_id,
        copy_code: loan.copy_code,
        condition: condition,
      },

      fine: fine,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Return book error:", error);

    res.status(500).json({
      message: "Failed to return book",
      error: error.message,
    });
  } finally {
    client.release();
  }
};


// ==========================================
// GET ALL LOANS - LIBRARIAN
// ==========================================
exports.getAllLoans = async (req, res) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT
        l.id,
        u.name AS member_name,
        u.email AS member_email,
        b.title,
        b.author,
        b.isbn,
        c.copy_code,
        l.borrowed_at,
        l.due_date,
        l.returned_at,

        -- Current overdue fine
        CASE
          WHEN l.returned_at IS NULL
          AND l.due_date < CURRENT_DATE
          THEN (CURRENT_DATE - l.due_date) * 10
          ELSE l.fine
        END AS fine,

        -- Loan status
        CASE
          WHEN l.returned_at IS NOT NULL
            THEN 'returned'

          WHEN l.due_date < CURRENT_DATE
            THEN 'overdue'

          ELSE 'active'
        END AS status

      FROM loans l

      JOIN users u
        ON u.id = l.member_id

      JOIN copies c
        ON c.id = l.copy_id

      JOIN books b
        ON b.id = c.book_id
    `;

    // Filter by loan status
    if (status) {
      if (
        !["active", "overdue", "returned"].includes(
          status
        )
      ) {
        return res.status(400).json({
          message:
            "Status must be active, overdue, or returned",
        });
      }

      // Active loans
      if (status === "active") {
        query += `
          WHERE l.returned_at IS NULL
          AND l.due_date >= CURRENT_DATE
        `;
      }

      // Overdue loans
      if (status === "overdue") {
        query += `
          WHERE l.returned_at IS NULL
          AND l.due_date < CURRENT_DATE
        `;
      }

      // Returned loans
      if (status === "returned") {
        query += `
          WHERE l.returned_at IS NOT NULL
        `;
      }
    }

    query += `
      ORDER BY l.borrowed_at DESC
    `;

    const result = await pool.query(query);

    res.json(result.rows);
  } catch (error) {
    console.error("Get all loans error:", error);

    res.status(500).json({
      message: "Failed to fetch loans",
    });
  }
};