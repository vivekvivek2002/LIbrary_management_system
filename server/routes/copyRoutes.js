const express=require("express");

const {
  createCopy,
  getBookCopies,
  updateCopyCondition,
} = require("../controllers/copyController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();

// Get copies of a book
router.get(
  "/book/:bookId",
  protect,
  getBookCopies
);

// Librarian can add a copy
router.post(
  "/book/:bookId",
  protect,
  authorize("librarian"),
  createCopy
);

// Librarian can update condition
router.patch(
  "/:copyId/condition",
  protect,
  authorize("librarian"),
  updateCopyCondition
);

module.exports = router;