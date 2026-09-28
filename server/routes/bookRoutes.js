const express = require("express");

const {
    getAllBooks,
    createBook,
    updateBook,
    deleteBook
} = require("../controllers/bookController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get all books
// Member + Librarian
router.get(
    "/",
    protect,
    getAllBooks
);

// Create book
// Librarian only
router.post(
    "/",
    protect,
    authorize("librarian"),
    createBook
);

// Update book
// Librarian only
router.patch(
    "/:bookId",
    protect,
    authorize("librarian"),
    updateBook
);

// Delete book
// Librarian only
router.delete(
    "/:bookId",
    protect,
    authorize("librarian"),
    deleteBook
);

module.exports = router;