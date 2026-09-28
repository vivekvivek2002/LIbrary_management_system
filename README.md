# Library Management System

A full-stack Library Management System built using PostgreSQL, Express.js, React.js, and Node.js.

The system supports member registration/login, librarian management, book catalogue management, physical book copies, borrowing, returns, overdue tracking, and fine calculation.

---

## Tech Stack

### Frontend
- React.js
- React Router
- Axios
- Vite

### Backend
- Node.js
- Express.js
- JWT Authentication
- bcryptjs
- PostgreSQL
- pg

### Testing
- Jest

---

## Features

### Member

- Register an account
- Login/logout
- Search books
- View book availability
- Borrow books
- Automatically assign an available physical copy
- Maximum 3 active loans
- Cannot borrow when an overdue loan exists
- Cannot borrow the same book while it is already on loan
- View personal loan history
- View due dates
- View overdue status
- View current fines

### Librarian

- Login using seeded account
- View book catalogue
- Add books
- Edit books
- Delete books
- Add physical copies
- View copies
- Change copy condition
- View all loans
- Filter active, overdue, and returned loans
- Process book returns
- Record returned copy condition
- Calculate final fine

---

## Business Rules

### Book

- ISBN must be unique.
- Copy code must be unique.
- A book can have multiple physical copies.

### Borrowing

- Members borrow a book, not a specific physical copy.
- The system automatically assigns an available copy.
- Only copies with `good` condition can be borrowed.
- Maximum 3 active loans per member.
- Members with an overdue loan cannot borrow another book.
- A member cannot borrow the same book while already having it on loan.
- Due date is 14 days after borrowing.

### Return

- Only librarians can process returns.
- A loan can only be returned once.
- The librarian records the copy condition:
  - good
  - damaged
  - lost
- Damaged and lost copies cannot be lent.
- Loan history is never deleted.

### Fine

The fine is:

```text
₹10 per overdue calendar day