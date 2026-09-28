import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const LibrarianDashboard = () => {
    const navigate = useNavigate();

    const [loans, setLoans] = useState([]);
    const [status, setStatus] = useState("");
    const [loading, setLoading] = useState(true);

    const [books, setBooks] = useState([]);
    const [booksLoading, setBooksLoading] = useState(true);

    const [selectedBook, setSelectedBook] = useState(null);
    const [copies, setCopies] = useState([]);
    const [copiesLoading, setCopiesLoading] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const [showAddBook, setShowAddBook] = useState(false);

    const [bookForm, setBookForm] = useState({
        title: "",
        author: "",
        isbn: ""
    });


    // =========================
    // FETCH LOANS
    // =========================

    const fetchLoans = async (selectedStatus = "") => {
        try {
            setLoading(true);
            setError("");

            const url = selectedStatus
                ? `/loans?status=${selectedStatus}`
                : "/loans";

            const response = await api.get(url);

            setLoans(response.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load loans"
            );
        } finally {
            setLoading(false);
        }
    };


    // =========================
    // FETCH BOOKS
    // =========================

    const fetchBooks = async () => {
        try {
            setBooksLoading(true);

            const response = await api.get("/books");

            setBooks(response.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load books"
            );
        } finally {
            setBooksLoading(false);
        }
    };


    // =========================
    // INITIAL LOAD
    // =========================

    useEffect(() => {
        fetchLoans(status);
    }, [status]);

    useEffect(() => {
        fetchBooks();
    }, []);


    // =========================
    // ADD BOOK
    // =========================

    const handleAddBook = async (event) => {
        event.preventDefault();

        try {
            setError("");
            setMessage("");

            const response = await api.post(
                "/books",
                bookForm
            );

            setMessage(response.data.message);

            setBookForm({
                title: "",
                author: "",
                isbn: ""
            });

            setShowAddBook(false);

            fetchBooks();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to add book"
            );
        }
    };


    // =========================
    // ADD COPY
    // =========================

    const handleAddCopy = async (bookId) => {
        const copyCode = window.prompt(
            "Enter unique copy code"
        );

        if (!copyCode) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.post(
                `/copies/book/${bookId}`,
                {
                    copy_code: copyCode.trim()
                }
            );

            setMessage(response.data.message);

            await fetchBooks();

            if (
                selectedBook &&
                selectedBook.id === bookId
            ) {
                const copiesResponse = await api.get(
                    `/copies/book/${bookId}`
                );

                setCopies(copiesResponse.data);
            }

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to add copy"
            );
        }
    };


    // =========================
    // VIEW COPIES
    // =========================

    const handleViewCopies = async (book) => {
        try {
            setError("");
            setMessage("");

            setSelectedBook(book);
            setCopiesLoading(true);

            const response = await api.get(
                `/copies/book/${book.id}`
            );

            setCopies(response.data);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to load copies"
            );
        } finally {
            setCopiesLoading(false);
        }
    };


    // =========================
    // CLOSE COPIES
    // =========================

    const handleCloseCopies = () => {
        setSelectedBook(null);
        setCopies([]);
    };


    // =========================
    // CHANGE COPY CONDITION
    // =========================

    const handleConditionChange = async (
        copyId,
        condition
    ) => {
        try {
            setError("");
            setMessage("");

            const response = await api.patch(
                `/copies/${copyId}/condition`,
                {
                    condition
                }
            );

            setMessage(response.data.message);

            if (selectedBook) {
                const copiesResponse = await api.get(
                    `/copies/book/${selectedBook.id}`
                );

                setCopies(copiesResponse.data);
            }

            fetchBooks();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to update copy condition"
            );
        }
    };


    // =========================
    // DELETE BOOK
    // =========================

    const handleDeleteBook = async (bookId) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this book?"
        );

        if (!confirmed) {
            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.delete(
                `/books/${bookId}`
            );

            setMessage(response.data.message);

            fetchBooks();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to delete book"
            );
        }
    };


    // =========================
    // RETURN BOOK
    // =========================

    const handleReturn = async (loanId) => {
        const condition = window.prompt(
            "Enter copy condition: good, damaged, or lost"
        );

        if (!condition) {
            return;
        }

        const selectedCondition =
            condition.toLowerCase().trim();

        if (
            !["good", "damaged", "lost"]
                .includes(selectedCondition)
        ) {
            setError(
                "Condition must be good, damaged, or lost"
            );

            return;
        }

        try {
            setError("");
            setMessage("");

            const response = await api.patch(
                `/loans/${loanId}/return`,
                {
                    condition: selectedCondition
                }
            );

            setMessage(
                `${response.data.message}. Fine: ₹${response.data.fine}`
            );

            fetchLoans(status);
            fetchBooks();

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Failed to return book"
            );
        }
    };


    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login");
    };


    // =========================
    // DATE FORMAT
    // =========================

    const formatDate = (date) => {
        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleDateString(
            "en-IN"
        );
    };


    return (
        <div style={styles.container}>

            {/* =========================
                NAVBAR
            ========================= */}

            <nav style={styles.navbar}>

                <h2 style={styles.navTitle}>
                    📚 Librarian Dashboard
                </h2>

                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                >
                    Logout
                </button>

            </nav>


            <main style={styles.main}>

                {/* =========================
                    MESSAGES
                ========================= */}

                {message && (
                    <div style={styles.success}>
                        {message}
                    </div>
                )}

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}


                {/* =========================
                    BOOK CATALOGUE
                ========================= */}

                <section style={styles.section}>

                    <div style={styles.sectionHeader}>

                        <h1 style={styles.heading}>
                            📚 Book Catalogue
                        </h1>

                        <button
                            onClick={() =>
                                setShowAddBook(
                                    !showAddBook
                                )
                            }
                            style={styles.primaryButton}
                        >
                            {showAddBook
                                ? "Cancel"
                                : "+ Add Book"}
                        </button>

                    </div>


                    {/* ADD BOOK FORM */}

                    {showAddBook && (

                        <form
                            onSubmit={handleAddBook}
                            style={styles.form}
                        >

                            <input
                                type="text"
                                placeholder="Book title"
                                value={bookForm.title}
                                onChange={(event) =>
                                    setBookForm({
                                        ...bookForm,
                                        title: event.target.value
                                    })
                                }
                                required
                                style={styles.input}
                            />

                            <input
                                type="text"
                                placeholder="Author"
                                value={bookForm.author}
                                onChange={(event) =>
                                    setBookForm({
                                        ...bookForm,
                                        author: event.target.value
                                    })
                                }
                                required
                                style={styles.input}
                            />

                            <input
                                type="text"
                                placeholder="ISBN"
                                value={bookForm.isbn}
                                onChange={(event) =>
                                    setBookForm({
                                        ...bookForm,
                                        isbn: event.target.value
                                    })
                                }
                                required
                                style={styles.input}
                            />

                            <button
                                type="submit"
                                style={styles.primaryButton}
                            >
                                Add Book
                            </button>

                        </form>
                    )}


                    {/* BOOK TABLE */}

                    {booksLoading ? (

                        <p style={styles.normalText}>
                            Loading books...
                        </p>

                    ) : books.length === 0 ? (

                        <p style={styles.normalText}>
                            No books found.
                        </p>

                    ) : (

                        <div style={styles.tableContainer}>

                            <table style={styles.table}>

                                <thead>

                                    <tr>

                                        <th style={styles.th}>
                                            ID
                                        </th>

                                        <th style={styles.th}>
                                            Title
                                        </th>

                                        <th style={styles.th}>
                                            Author
                                        </th>

                                        <th style={styles.th}>
                                            ISBN
                                        </th>

                                        <th style={styles.th}>
                                            Total Copies
                                        </th>

                                        <th style={styles.th}>
                                            Available
                                        </th>

                                        <th style={styles.th}>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {books.map((book) => (

                                        <tr key={book.id}>

                                            <td style={styles.td}>
                                                {book.id}
                                            </td>

                                            <td style={styles.td}>
                                                {book.title}
                                            </td>

                                            <td style={styles.td}>
                                                {book.author}
                                            </td>

                                            <td style={styles.td}>
                                                {book.isbn}
                                            </td>

                                            <td style={styles.td}>
                                                {book.total_copies}
                                            </td>

                                            <td style={styles.td}>
                                                {book.available_copies}
                                            </td>

                                            <td style={styles.td}>

                                                <button
                                                    onClick={() =>
                                                        handleAddCopy(
                                                            book.id
                                                        )
                                                    }
                                                    style={
                                                        styles.copyButton
                                                    }
                                                >
                                                    + Copy
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleViewCopies(
                                                            book
                                                        )
                                                    }
                                                    style={
                                                        styles.viewButton
                                                    }
                                                >
                                                    View Copies
                                                </button>

                                                <button
                                                    onClick={() =>
                                                        handleDeleteBook(
                                                            book.id
                                                        )
                                                    }
                                                    style={
                                                        styles.deleteButton
                                                    }
                                                >
                                                    Delete
                                                </button>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>


                {/* =========================
                    COPY MANAGEMENT
                ========================= */}

                {selectedBook && (

                    <section style={styles.section}>

                        <div style={styles.sectionHeader}>

                            <h1 style={styles.heading}>
                                📦 Copies -{" "}
                                {selectedBook.title}
                            </h1>

                            <button
                                onClick={
                                    handleCloseCopies
                                }
                                style={
                                    styles.filterButton
                                }
                            >
                                Close
                            </button>

                        </div>


                        {copiesLoading ? (

                            <p style={styles.normalText}>
                                Loading copies...
                            </p>

                        ) : copies.length === 0 ? (

                            <p style={styles.normalText}>
                                No copies found.
                            </p>

                        ) : (

                            <div
                                style={
                                    styles.tableContainer
                                }
                            >

                                <table
                                    style={styles.table}
                                >

                                    <thead>

                                        <tr>

                                            <th style={styles.th}>
                                                ID
                                            </th>

                                            <th style={styles.th}>
                                                Copy Code
                                            </th>

                                            <th style={styles.th}>
                                                Condition
                                            </th>

                                            <th style={styles.th}>
                                                Change Condition
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>

                                        {copies.map(
                                            (copy) => (

                                                <tr
                                                    key={
                                                        copy.id
                                                    }
                                                >

                                                    <td style={styles.td}>
                                                        {
                                                            copy.id
                                                        }
                                                    </td>

                                                    <td style={styles.td}>
                                                        {
                                                            copy.copy_code
                                                        }
                                                    </td>

                                                    <td style={styles.td}>
                                                        {
                                                            copy.condition
                                                        }
                                                    </td>

                                                    <td style={styles.td}>

                                                        <select
                                                            value={
                                                                copy.condition
                                                            }
                                                            onChange={(
                                                                event
                                                            ) =>
                                                                handleConditionChange(
                                                                    copy.id,
                                                                    event
                                                                        .target
                                                                        .value
                                                                )
                                                            }
                                                            style={
                                                                styles.select
                                                            }
                                                        >

                                                            <option value="good">
                                                                Good
                                                            </option>

                                                            <option value="damaged">
                                                                Damaged
                                                            </option>

                                                            <option value="lost">
                                                                Lost
                                                            </option>

                                                        </select>

                                                    </td>

                                                </tr>

                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                )}


                {/* =========================
                    LOANS
                ========================= */}

                <section style={styles.section}>

                    <h1 style={styles.heading}>
                        📖 Loans
                    </h1>


                    {/* FILTERS */}

                    <div style={styles.filters}>

                        <button
                            onClick={() =>
                                setStatus("")
                            }
                            style={styles.filterButton}
                        >
                            All
                        </button>

                        <button
                            onClick={() =>
                                setStatus("active")
                            }
                            style={styles.filterButton}
                        >
                            Active
                        </button>

                        <button
                            onClick={() =>
                                setStatus("overdue")
                            }
                            style={styles.filterButton}
                        >
                            Overdue
                        </button>

                        <button
                            onClick={() =>
                                setStatus("returned")
                            }
                            style={styles.filterButton}
                        >
                            Returned
                        </button>

                    </div>


                    {/* LOAN TABLE */}

                    {loading ? (

                        <p style={styles.normalText}>
                            Loading loans...
                        </p>

                    ) : loans.length === 0 ? (

                        <p style={styles.normalText}>
                            No loans found.
                        </p>

                    ) : (

                        <div style={styles.tableContainer}>

                            <table style={styles.table}>

                                <thead>

                                    <tr>

                                        <th style={styles.th}>
                                            Member
                                        </th>

                                        <th style={styles.th}>
                                            Book
                                        </th>

                                        <th style={styles.th}>
                                            Copy
                                        </th>

                                        <th style={styles.th}>
                                            Borrowed
                                        </th>

                                        <th style={styles.th}>
                                            Due
                                        </th>

                                        <th style={styles.th}>
                                            Returned
                                        </th>

                                        <th style={styles.th}>
                                            Status
                                        </th>

                                        <th style={styles.th}>
                                            Fine
                                        </th>

                                        <th style={styles.th}>
                                            Action
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {loans.map(
                                        (loan) => (

                                            <tr
                                                key={
                                                    loan.id
                                                }
                                            >

                                                <td style={styles.td}>

                                                    <strong>
                                                        {
                                                            loan.member_name
                                                        }
                                                    </strong>

                                                    <br />

                                                    <small>
                                                        {
                                                            loan.member_email
                                                        }
                                                    </small>

                                                </td>

                                                <td style={styles.td}>
                                                    {
                                                        loan.title
                                                    }
                                                </td>

                                                <td style={styles.td}>
                                                    {
                                                        loan.copy_code
                                                    }
                                                </td>

                                                <td style={styles.td}>
                                                    {formatDate(
                                                        loan.borrowed_at
                                                    )}
                                                </td>

                                                <td style={styles.td}>
                                                    {formatDate(
                                                        loan.due_date
                                                    )}
                                                </td>

                                                <td style={styles.td}>
                                                    {formatDate(
                                                        loan.returned_at
                                                    )}
                                                </td>

                                                <td style={styles.td}>

                                                    <span
                                                        style={
                                                            loan.status ===
                                                            "returned"
                                                                ? styles.returnedStatus
                                                                : loan.status ===
                                                                  "overdue"
                                                                ? styles.overdueStatus
                                                                : styles.activeStatus
                                                        }
                                                    >
                                                        {
                                                            loan.status
                                                        }
                                                    </span>

                                                </td>

                                                <td style={styles.td}>
                                                    ₹{loan.fine}
                                                </td>

                                                <td style={styles.td}>

                                                    {loan.status !==
                                                        "returned" && (
                                                        <button
                                                            onClick={() =>
                                                                handleReturn(
                                                                    loan.id
                                                                )
                                                            }
                                                            style={
                                                                styles.returnButton
                                                            }
                                                        >
                                                            Return
                                                        </button>
                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
};


// =========================
// STYLES
// =========================

const styles = {

    container: {
        minHeight: "100vh",
        background: "#ffffff",
        color: "#222"
    },

    navbar: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "15px 30px",
        background: "#ffffff",
        borderBottom: "1px solid #dddddd"
    },

    navTitle: {
        color: "#222222",
        margin: 0
    },

    main: {
        padding: "30px",
        background: "#ffffff"
    },

    section: {
        background: "#ffffff",
        color: "#222222",
        padding: "25px",
        marginBottom: "30px",
        borderRadius: "10px",
        border: "1px solid #eeeeee",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)"
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "20px"
    },

    heading: {
        color: "#222222",
        marginTop: 0
    },

    normalText: {
        color: "#222222"
    },

    form: {
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        marginBottom: "25px",
        padding: "20px",
        background: "#f7f7f7",
        borderRadius: "8px"
    },

    input: {
        padding: "10px",
        border: "1px solid #cccccc",
        borderRadius: "5px",
        minWidth: "200px",
        color: "#222222",
        background: "#ffffff"
    },

    primaryButton: {
        padding: "10px 16px",
        background: "#2563eb",
        color: "#ffffff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },

    logoutButton: {
        padding: "8px 15px",
        cursor: "pointer",
        borderRadius: "5px",
        border: "1px solid #cccccc",
        background: "#ffffff",
        color: "#222222"
    },

    filters: {
        display: "flex",
        gap: "10px",
        marginBottom: "20px",
        flexWrap: "wrap"
    },

    filterButton: {
        padding: "8px 15px",
        cursor: "pointer",
        border: "1px solid #cccccc",
        borderRadius: "5px",
        background: "#ffffff",
        color: "#222222"
    },

    tableContainer: {
        overflowX: "auto",
        width: "100%"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse",
        background: "#ffffff",
        color: "#222222"
    },

    th: {
        padding: "12px",
        borderBottom: "2px solid #cccccc",
        textAlign: "left",
        background: "#f1f1f1",
        color: "#222222",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },

    td: {
        padding: "12px",
        borderBottom: "1px solid #dddddd",
        color: "#222222",
        background: "#ffffff",
        verticalAlign: "middle"
    },

    copyButton: {
        padding: "7px 12px",
        cursor: "pointer",
        background: "#0d6efd",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        marginRight: "5px",
        marginBottom: "5px"
    },

    viewButton: {
        padding: "7px 12px",
        cursor: "pointer",
        background: "#6f42c1",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        marginRight: "5px",
        marginBottom: "5px"
    },

    deleteButton: {
        padding: "7px 12px",
        cursor: "pointer",
        background: "#dc3545",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px",
        marginBottom: "5px"
    },

    returnButton: {
        padding: "7px 12px",
        cursor: "pointer",
        background: "#198754",
        color: "#ffffff",
        border: "none",
        borderRadius: "4px"
    },

    select: {
        padding: "7px",
        border: "1px solid #cccccc",
        borderRadius: "4px",
        cursor: "pointer",
        color: "#222222",
        background: "#ffffff"
    },

    activeStatus: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "4px",
        background: "#cff4fc",
        color: "#055160",
        fontWeight: "600"
    },

    overdueStatus: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "4px",
        background: "#f8d7da",
        color: "#842029",
        fontWeight: "600"
    },

    returnedStatus: {
        display: "inline-block",
        padding: "5px 9px",
        borderRadius: "4px",
        background: "#d1e7dd",
        color: "#0f5132",
        fontWeight: "600"
    },

    success: {
        padding: "12px",
        marginBottom: "20px",
        background: "#d1e7dd",
        color: "#0f5132",
        borderRadius: "5px"
    },

    error: {
        padding: "12px",
        marginBottom: "20px",
        background: "#f8d7da",
        color: "#842029",
        borderRadius: "5px"
    }
};

export default LibrarianDashboard;