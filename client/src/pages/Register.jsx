import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

const Register = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError("");
        setSuccess("");

        if (!formData.name || !formData.email || !formData.password) {
            setError("All fields are required");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        try {
            setLoading(true);

            await api.post("/auth/register", {
                name: formData.name,
                email: formData.email,
                password: formData.password,
            });

            setSuccess("Registration successful! Redirecting to login...");

            setFormData({
                name: "",
                email: "",
                password: "",
            });

            setTimeout(() => {
                navigate("/login");
            }, 1500);
        } catch (error) {
            setError(error.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.backgroundGlow} />

            <div style={styles.card}>
                <div style={styles.brandWrap}>
                    <div style={styles.brandBadge}>📚</div>
                    <div>
                        <div style={styles.kicker}>Join the library</div>
                        <h1 style={styles.title}>Library Hub</h1>
                    </div>
                </div>

                <h2 style={styles.heading}>Create Account</h2>

                {error && <div style={styles.error}>{error}</div>}
                {success && <div style={styles.success}>{success}</div>}

                <form onSubmit={handleSubmit} style={styles.form}>
                    <div style={styles.formGroup}>
                        <label style={styles.label}>Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label style={styles.label}>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter password"
                            value={formData.password}
                            onChange={handleChange}
                            style={styles.input}
                        />
                    </div>

                    <button type="submit" disabled={loading} style={styles.button}>
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p style={styles.loginText}>
                    Already have an account? <Link to="/login" style={styles.link}>Login</Link>
                </p>
            </div>
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
        background: "rgba(96, 165, 250, 0.18)",
        filter: "blur(40px)",
        transform: "translate(220px, -160px)",
    },

    card: {
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth: "440px",
        background: "rgba(255, 255, 255, 0.8)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        padding: "30px 28px 28px",
        borderRadius: "24px",
        border: "1px solid rgba(148, 163, 184, 0.2)",
        boxShadow: "0 25px 55px rgba(15, 23, 42, 0.18)",
    },

    brandWrap: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "8px",
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
        textTransform: "uppercase",
        letterSpacing: "0.12em",
        fontWeight: "700",
        color: "#6366f1",
    },

    title: {
        margin: "4px 0 0",
        color: "#111827",
        fontSize: "28px",
    },

    heading: {
        margin: "16px 0 20px",
        color: "#111827",
        fontSize: "24px",
        textAlign: "center",
    },

    form: {
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },

    formGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "7px",
    },

    label: {
        fontSize: "13px",
        fontWeight: "600",
        color: "#334155",
    },

    input: {
        padding: "14px 14px",
        border: "1px solid #dbe2f0",
        borderRadius: "12px",
        fontSize: "15px",
        outline: "none",
        width: "100%",
        background: "#f8fafc",
        color: "#0f172a",
        boxSizing: "border-box",
    },

    button: {
        width: "100%",
        marginTop: "10px",
        padding: "14px",
        background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
        color: "#fff",
        border: "none",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        boxShadow: "0 16px 26px rgba(79, 70, 229, 0.28)",
    },

    error: {
        background: "#fee2e2",
        border: "1px solid rgba(239, 68, 68, 0.15)",
        color: "#b91c1c",
        padding: "10px 12px",
        borderRadius: "10px",
        marginBottom: "12px",
    },

    success: {
        background: "#dcfce7",
        border: "1px solid rgba(34, 197, 94, 0.15)",
        color: "#166534",
        padding: "10px 12px",
        borderRadius: "10px",
        marginBottom: "12px",
    },

    loginText: {
        margin: "18px 0 0",
        textAlign: "center",
        color: "#475569",
        fontSize: "14px",
    },

    link: {
        color: "#2563eb",
        textDecoration: "none",
        fontWeight: "700",
    },
};

export default Register;