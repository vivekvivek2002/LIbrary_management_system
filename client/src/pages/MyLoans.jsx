import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";

const MyLoans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const fetchLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/loans/my");
      setLoans(response.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to load loans");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <h2 style={styles.heading}>My Loans</h2>

        <button onClick={() => navigate("/member")} style={styles.button}>
          Back to Books
        </button>
      </nav>

      <main style={styles.main}>
        {loading && <p style={styles.status}>Loading loans...</p>}
        {error && <p style={styles.error}>{error}</p>}
        {!loading && !error && loans.length === 0 && <p style={styles.status}>You have no loans.</p>}

        {!loading && !error && loans.length > 0 && (
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Book</th>
                  <th style={styles.th}>Copy</th>
                  <th style={styles.th}>Borrowed</th>
                  <th style={styles.th}>Due Date</th>
                  <th style={styles.th}>Returned</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Fine</th>
                </tr>
              </thead>

              <tbody>
                {loans.map((loan) => (
                  <tr key={loan.id}>
                    <td style={styles.td}>{loan.title}</td>
                    <td style={styles.td}>{loan.copy_code}</td>
                    <td style={styles.td}>{formatDate(loan.borrowed_at)}</td>
                    <td style={styles.td}>{formatDate(loan.due_date)}</td>
                    <td style={styles.td}>{formatDate(loan.returned_at)}</td>
                    <td style={styles.td}>
                      {loan.returned_at ? (
                        <span style={styles.returned}>Returned</span>
                      ) : loan.overdue ? (
                        <span style={styles.overdue}>Overdue</span>
                      ) : (
                        <span style={styles.active}>Active</span>
                      )}
                    </td>
                    <td style={styles.td}>₹{loan.fine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    boxShadow: "0 12px 35px rgba(15, 23, 42, 0.12)",
    color: "#f8fafc",
  },

  heading: {
    margin: 0,
    fontSize: "1.5rem",
  },

  main: {
    padding: "30px 24px 48px",
    maxWidth: "1200px",
    margin: "0 auto",
  },

  button: {
    padding: "10px 16px",
    cursor: "pointer",
    background: "#fff",
    color: "#0f172a",
    border: "none",
    borderRadius: "10px",
    fontWeight: "700",
  },

  status: {
    color: "#475569",
    fontSize: "1rem",
  },

  tableContainer: {
    overflowX: "auto",
    background: "rgba(255,255,255,0.85)",
    border: "1px solid rgba(148, 163, 184, 0.24)",
    borderRadius: "20px",
    padding: "12px",
    boxShadow: "0 16px 35px rgba(15, 23, 42, 0.08)",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "760px",
  },

  th: {
    padding: "14px 12px",
    borderBottom: "2px solid #e2e8f0",
    textAlign: "left",
    background: "#f8fafc",
    color: "#334155",
    fontWeight: "700",
  },

  td: {
    padding: "14px 12px",
    borderBottom: "1px solid #e2e8f0",
    color: "#334155",
    background: "#fff",
  },

  error: {
    color: "#b91c1c",
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#fee2e2",
  },

  active: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dcfce7",
    color: "#166534",
    fontWeight: "700",
    fontSize: "12px",
  },

  overdue: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontWeight: "700",
    fontSize: "12px",
  },

  returned: {
    display: "inline-flex",
    padding: "6px 10px",
    borderRadius: "999px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontWeight: "700",
    fontSize: "12px",
  },
};

export default MyLoans;