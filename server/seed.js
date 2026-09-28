require("dotenv").config();
const bcrypt = require("bcryptjs");
const pool = require("./config/db");

const seedDatabase = async () => {
  try {
    // Clear existing data
    await pool.query("TRUNCATE loans, copies, books, users RESTART IDENTITY CASCADE");

    // Passwords
    const librarianPassword = await bcrypt.hash("admin123", 10);
    const memberPassword = await bcrypt.hash("member123", 10);

    // Create librarian
    const librarian = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      ["Library Admin", "admin@library.com", librarianPassword, "librarian"]
    );

    // Create member
    const member = await pool.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role`,
      ["John Member", "member@library.com", memberPassword, "member"]
    );

    // Create books
    const book1 = await pool.query(
      `INSERT INTO books (title, author, isbn)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ["The Great Gatsby", "F. Scott Fitzgerald", "9780743273565"]
    );

    const book2 = await pool.query(
      `INSERT INTO books (title, author, isbn)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ["Clean Code", "Robert C. Martin", "9780132350884"]
    );

    // Create copies
    await pool.query(
      `INSERT INTO copies (book_id, copy_code, condition)
       VALUES ($1, $2, $3), ($1, $4, $3)`,
      [book1.rows[0].id, "GAT-001", "good", "GAT-002"]
    );

    await pool.query(
      `INSERT INTO copies (book_id, copy_code, condition)
       VALUES ($1, $2, $3), ($1, $4, $3)`,
      [book2.rows[0].id, "CLC-001", "good", "CLC-002"]
    );

    console.log("Database seeded successfully!");
    console.log("Librarian: admin@library.com / admin123");
    console.log("Member: member@library.com / member123");

    process.exit(0);
  } catch (error) {
    console.error("Seed failed:", error);
    process.exit(1);
  }
};

seedDatabase();