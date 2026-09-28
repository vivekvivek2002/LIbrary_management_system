import { useEffect, useState } from "react";
import api from "../utils/api";
import { useNavigate } from "react-router-dom";

const MemberDashboard = () => {
  const [books, setBooks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/books");
      setBooks(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load books");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleBorrow = async (bookId) => {
    try {
      setMessage("");
      setError("");

      const response = await api.post(`/loans/borrow/${bookId}`);
      setMessage(response.data.message);
      fetchBooks();
    } catch (error) {
      setError(error.response?.data?.message || "Failed to borrow book");
    }
  };

  const filteredBooks = books.filter((book) => {
    const searchText = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(searchText) ||
      book.author.toLowerCase().includes(searchText) ||
      book.isbn.toLowerCase().includes(searchText)
    );
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <div>
          <div style={styles.brand}>📚 Library Hub</div>
        </div>

        <div style={styles.navActions}>
          <button onClick={() => navigate("/my-loans")} style={styles.navButton}>
            My Loans
          </button>

          <button onClick={handleLogout} style={styles.logout}>
            Logout
          </button>
        </div>
      </nav>

      <main style={styles.main}>
        <div style={styles.headerRow}>
          <div>
            <p style={styles.eyebrow}>Member dashboard</p>
            <h1 style={styles.heading}>Available Books</h1>
          </div>
        </div>

        <input
          type="text"
          placeholder="Search by title, author or ISBN..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        {message && <p style={styles.success}>{message}</p>}
        {error && <p style={styles.error}>{error}</p>}

        {loading ? (
          <p style={styles.statusText}>Loading books...</p>
        ) : filteredBooks.length === 0 ? (
          <p style={styles.statusText}>No books found.</p>
        ) : (
          <div style={styles.grid}>
            {filteredBooks.map((book) => (
              <div key={book.id} style={styles.card}>
                <div style={styles.cardTop}>
                  <span style={styles.category}>Collection</span>
                  <span style={book.available_copies > 0 ? styles.availableBadge : styles.unavailableBadge}>
                    {book.available_copies > 0 ? `${book.available_copies} available` : "Unavailable"}
                  </span>
                </div>

                <h3 style={styles.bookTitle}>{book.title}</h3>

                <div style={styles.metaList}>
                  <p><strong>Author:</strong> {book.author}</p>
                  <p><strong>ISBN:</strong> {book.isbn}</p>
                  <p><strong>Total copies:</strong> {book.total_copies}</p>
                </div>

                <button
                  onClick={() => handleBorrow(book.id)}
                  disabled={book.available_copies === 0}
                  style={book.available_copies > 0 ? styles.borrowButton : styles.borrowButtonDisabled}
                >
                  {book.available_copies > 0 ? "Borrow" : "Not Available"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f5f7ff 0%, #eef4ff 100%)",
    color: "#0f172a",
  },

  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "18px 32px",
    background: "rgba(15, 23, 42, 0.92)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.15)",
    boxShadow: "0 12px 35px rgba(15, 23, 42, 0.12)",
    position: "sticky",
    top: 0,
    zIndex: 10,
    backdropFilter: "blur(10px)",
  },

  brand: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#f8fafc",
    letterSpacing: "0.02em",
  },

  navActions: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },

  navButton: {
    padding: "10px 16px",
    cursor: "pointer",
    background: "rgba(99, 102, 241, 0.18)",
    color: "#e2e8f0",
    border: "1px solid rgba(129, 140, 248, 0.35)",
    borderRadius: "10px",
    fontWeight: "600",
  },

  logout: {
    padding: "10px 16px",
    cursor: "pointer",
    background: "#fff",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
  },

  main: {
    padding: "30px 24px 48px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  headerRow: {
    marginBottom: "22px",
  },

  eyebrow: {
    margin: 0,
    color: "#6366f1",
    fontSize: "12px",
    letterSpacing: "0.12em",
    fontWeight: "700",
    textTransform: "uppercase",
  },

  heading: {
    margin: "10px 0 0",
    fontSize: "2.1rem",
    color: "#0f172a",
  },

  search: {
    width: "100%",
    maxWidth: "560px",
    padding: "14px 16px",
    marginBottom: "20px",
    fontSize: "16px",
    borderRadius: "14px",
    border: "1px solid #dfe7f5",
    background: "rgba(255,255,255,0.82)",
    color: "#0f172a",
    boxShadow: "0 12px 25px rgba(148, 163, 184, 0.12)",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "22px",
  },

  card: {
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 18px 36px rgba(15, 23, 42, 0.08)",
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  category: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#e0e7ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: "700",
  },

  availableBadge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontSize: "12px",
    fontWeight: "700",
  },

  unavailableBadge: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontSize: "12px",
    fontWeight: "700",
  },

  bookTitle: {
    margin: 0,
    fontSize: "1.35rem",
    color: "#111827",
    lineHeight: 1.3,
  },

  metaList: {
    display: "grid",
    gap: "8px",
    color: "#475569",
  },

  metaListP: {
    margin: 0,
  },

  borrowButton: {
    marginTop: "6px",
    padding: "12px 18px",
    cursor: "pointer",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "#fff",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
    boxShadow: "0 15px 25px rgba(79, 70, 229, 0.2)",
  },

  borrowButtonDisabled: {
    marginTop: "6px",
    padding: "12px 18px",
    cursor: "not-allowed",
    background: "#e2e8f0",
    color: "#64748b",
    border: "none",
    borderRadius: "12px",
    fontSize: "15px",
    fontWeight: "700",
  },

  success: {
    margin: "0 0 16px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#dcfce7",
    color: "#166534",
  },

  error: {
    margin: "0 0 16px",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#fee2e2",
    color: "#b91c1c",
  },

  statusText: {
    color: "#475569",
    fontSize: "1rem",
  },
};

export default MemberDashboard;