const express = require("express");

const { borrowBook ,
    getMyLoans,
    returnBook,
    getAllLoans,
} = require("../controllers/loanController");

const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");

const router = express.Router();
// 

router.post(
  "/borrow/:bookId",
  protect,
  authorize("member"),
  borrowBook
);
// 
router.get(
  "/my",
  protect,
  authorize("member"),
  getMyLoans
);

// 
router.patch(
  "/:loanId/return",
  protect,
  authorize("librarian"),
  returnBook
);

// view loans
router.get(
  "/",
  protect,
  authorize("librarian"),
  getAllLoans
);

module.exports = router;