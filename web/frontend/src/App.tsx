import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import MapView from "./pages/MapView";
import LoginPage from "./pages/LoginPage";
import AdminDashboard from "./pages/AdminDashboard";

function Navigation() {
  const location = useLocation();
  const role = localStorage.getItem("userRole");

  // Don't show nav on login page
  if (location.pathname === "/") return null;

  return (
    <nav style={{
      backgroundColor: "white",
      padding: "0 24px",
      height: "64px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottom: "1px solid #e5e7eb",
      boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
        <h1 style={{ fontSize: "20px", fontWeight: "bold", color: "#3b82f6" }}>🚀 CareerBridge IoT</h1>

        <div style={{ display: "flex", gap: "8px" }}>
          <Link to="/map" style={{
            textDecoration: "none",
            padding: "8px 16px",
            borderRadius: "6px",
            backgroundColor: location.pathname === "/map" ? "#eff6ff" : "transparent",
            color: location.pathname === "/map" ? "#2563eb" : "#4b5563",
            fontWeight: 500
          }}>
            🗺️ Live Map
          </Link>
          {role === "admin" && (
            <Link to="/admin" style={{
              textDecoration: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              backgroundColor: location.pathname === "/admin" ? "#eff6ff" : "transparent",
              color: location.pathname === "/admin" ? "#2563eb" : "#4b5563",
              fontWeight: 500
            }}>
              ⚙️ Admin Dashboard
            </Link>
          )}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <span style={{ fontSize: "14px", color: "#6b7280" }}>
          Logged in as <b>{role?.toUpperCase()}</b>
        </span>
        <button
          onClick={() => window.location.href = "/"}
          style={{
            padding: "8px 16px",
            backgroundColor: "#fee2e2",
            color: "#991b1b",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
            fontSize: "14px"
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const role = localStorage.getItem("userRole");
  if (!role) return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
        <Navigation />
        <div style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <Routes>
            <Route path="/" element={<LoginPage />} />
            <Route path="/map" element={
              <ProtectedRoute>
                <MapView />
              </ProtectedRoute>
            } />
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
