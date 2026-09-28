import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import "./App.css";

import Login from "./pages/Login";
import Register from "./pages/Register";
import MemberDashboard from "./pages/MemberDashboard";
import MyLoans from "./pages/MyLoans";
import LibrarianDashboard from "./pages/LibrarianDashboard";

import ProtectedRoute from "./components/ProtectedRoutes";


function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public Routes */}

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* Member Dashboard */}

                <Route
                    path="/member"
                    element={
                        <ProtectedRoute role="member">
                            <MemberDashboard />
                        </ProtectedRoute>
                    }
                />


                {/* Member Loan History */}

                <Route
                    path="/my-loans"
                    element={
                        <ProtectedRoute role="member">
                            <MyLoans />
                        </ProtectedRoute>
                    }
                />


                {/* Librarian Dashboard */}

                <Route
                    path="/librarian"
                    element={
                        <ProtectedRoute role="librarian">
                            <LibrarianDashboard />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;