CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'member'
        CHECK (role IN ('member', 'librarian')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE copies (
    id SERIAL PRIMARY KEY,
    book_id INTEGER NOT NULL
        REFERENCES books(id),
    copy_code VARCHAR(50) UNIQUE NOT NULL,
    condition VARCHAR(20) NOT NULL DEFAULT 'good'
        CHECK (condition IN ('good', 'damaged', 'lost'))
);

CREATE TABLE loans (
    id SERIAL PRIMARY KEY,
    member_id INTEGER NOT NULL
        REFERENCES users(id),
    copy_id INTEGER NOT NULL
        REFERENCES copies(id),
    borrowed_at DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    returned_at DATE,
    fine NUMERIC(10,2) DEFAULT 0
);