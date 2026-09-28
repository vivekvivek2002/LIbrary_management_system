import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      login(user, token);

      if (user.role === "librarian") {
        navigate("/librarian");
      } else {
        navigate("/member");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backgroundGlow} />

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.brandWrap}>
          <div style={styles.brandBadge}>📚</div>
          <div>
            <div style={styles.kicker}>Smart circulation</div>
            <h2 style={styles.title}>Library Hub</h2>
          </div>
        </div>

        <div style={styles.headingWrap}>
          <h3 style={styles.heading}>Welcome back</h3>
          <p style={styles.subtitle}>Login to manage books and loans</p>
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <label style={styles.label}>Email</label>
        <input
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={styles.input}
          required
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? "Logging in..." : "Login"}
        </button>

        <p style={styles.footerText}>
          Need an account? {" "}
          <a href="/register" style={styles.link}>
            Create one
          </a>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "24px",
    background: "linear-gradient(135deg, #edf6ff 0%, #e0e7ff 48%, #f5f3ff 100%)",
    overflow: "hidden",
  },

  backgroundGlow: {
    position: "absolute",
    width: "420px",
    height: "420px",
    borderRadius: "50%",
    background: "rgba(98, 108, 255, 0.18)",
    filter: "blur(30px)",
    transform: "translate(-200px, -130px)",
  },

  form: {
    position: "relative",
    zIndex: 1,
    width: "100%",
    maxWidth: "430px",
    padding: "34px 32px",
    background: "rgba(255, 255, 255, 0.82)",
    borderRadius: "24px",
    border: "1px solid rgba(148, 163, 184, 0.26)",
    boxShadow: "0 25px 60px rgba(30, 41, 59, 0.18)",
    backdropFilter: "blur(10px)",
    WebkitBackdropFilter: "blur(10px)",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },

  brandWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    marginBottom: "4px",
  },

  brandBadge: {
    width: "48px",
    height: "48px",
    borderRadius: "14px",
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #2563eb, #7c3aed)",
    fontSize: "24px",
    boxShadow: "0 15px 25px rgba(79, 70, 229, 0.3)",
  },

  kicker: {
    fontSize: "12px",
    fontWeight: "700",
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    color: "#6366f1",
  },

  title: {
    margin: "4px 0 0",
    fontSize: "28px",
    color: "#111827",
  },

  headingWrap: {
    marginBottom: "8px",
  },

  heading: {
    margin: 0,
    fontSize: "26px",
    color: "#111827",
  },

  subtitle: {
    margin: "6px 0 0",
    fontSize: "14px",
    color: "#64748b",
  },

  label: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#334155",
    marginTop: "6px",
  },

  input: {
    width: "100%",
    padding: "14px 14px",
    borderRadius: "12px",
    border: "1px solid #dbe2f0",
    background: "#f8fafc",
    fontSize: "15px",
    color: "#0f172a",
    outline: "none",
    boxSizing: "border-box",
  },

  button: {
    marginTop: "10px",
    padding: "14px 18px",
    border: "none",
    borderRadius: "12px",
    background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
    color: "#fff",
    fontWeight: "700",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 16px 26px rgba(79, 70, 229, 0.28)",
  },

  error: {
    margin: 0,
    padding: "10px 12px",
    borderRadius: "10px",
    background: "#fee2e2",
    color: "#b91c1c",
    fontSize: "14px",
    border: "1px solid rgba(239, 68, 68, 0.15)",
  },

  footerText: {
    margin: "10px 0 0",
    textAlign: "center",
    color: "#475569",
    fontSize: "14px",
  },

  link: {
    color: "#2563eb",
    fontWeight: "700",
    textDecoration: "none",
  },
};

export default Login;