-- Q1: Top 5 most borrowed books in last 30 days

SELECT
    b.id,
    b.title,
    b.author,
    b.isbn,
    COUNT(l.id) AS borrow_count
FROM loans l
JOIN copies c
    ON c.id = l.copy_id
JOIN books b
    ON b.id = c.book_id
WHERE l.borrowed_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY
    b.id,
    b.title,
    b.author,
    b.isbn
ORDER BY borrow_count DESC
LIMIT 5;


-- Q2: Members with overdue loans
-- and total fine if returned today

SELECT
    u.id AS member_id,
    u.name AS member_name,
    u.email AS member_email,
    COUNT(l.id) AS overdue_loans,
    SUM((CURRENT_DATE - l.due_date) * 10)
        AS total_fine_if_returned_today
FROM users u
JOIN loans l
    ON l.member_id = u.id
WHERE l.returned_at IS NULL
AND l.due_date < CURRENT_DATE
GROUP BY
    u.id,
    u.name,
    u.email
ORDER BY total_fine_if_returned_today DESC;