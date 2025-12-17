import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const navigate = useNavigate();
    const [password, setPassword] = useState("");

    const handleLogin = (role: "admin" | "driver") => {
        if (role === "admin" && password !== "admin123") {
            alert("Invalid Admin Password! (Try: admin123)");
            return;
        }

        localStorage.setItem("userRole", role);

        if (role === "admin") {
            navigate("/admin");
        } else {
            navigate("/map");
        }
    };

    return (
        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            backgroundColor: "#f3f4f6",
            gap: "24px"
        }}>
            <div style={{
                backgroundColor: "white",
                padding: "32px",
                borderRadius: "16px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                width: "300px",
                textAlign: "center"
            }}>
                <h1 style={{ marginBottom: "24px", color: "#374151" }}>🚑 CareerBridge IoT</h1>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <button
                        onClick={() => handleLogin("driver")}
                        style={{
                            padding: "12px",
                            backgroundColor: "#3b82f6",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Login as DRIVER
                    </button>

                    <div style={{ borderTop: "1px solid #e5e7eb", margin: "12px 0" }}></div>

                    <input
                        type="password"
                        placeholder="Admin Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{
                            padding: "10px",
                            borderRadius: "6px",
                            border: "1px solid #d1d5db",
                            marginBottom: "8px",
                            width: "100%",
                            boxSizing: "border-box"
                        }}
                    />
                    <button
                        onClick={() => handleLogin("admin")}
                        style={{
                            padding: "12px",
                            backgroundColor: "#1f2937",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            cursor: "pointer"
                        }}
                    >
                        Login as ADMIN
                    </button>
                </div>
            </div>
        </div>
    );
}
