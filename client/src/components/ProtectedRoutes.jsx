import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    // User is not logged in
    if (!token || !savedUser) {
        return <Navigate to="/login" replace />;
    }

    let user;

    try {
        user = JSON.parse(savedUser);
    } catch (error) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        return <Navigate to="/login" replace />;
    }

    // Check user's role
    if (role && user.role !== role) {
        if (user.role === "librarian") {
            return <Navigate to="/librarian" replace />;
        }

        return <Navigate to="/member" replace />;
    }

    return children;
};

export default ProtectedRoute;