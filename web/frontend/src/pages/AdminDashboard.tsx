import { useState, useEffect } from "react";

export default function AdminDashboard() {
    const [speedLimit, setSpeedLimit] = useState(120);
    const [tempLimit, setTempLimit] = useState(90);

    useEffect(() => {
        // Load from local storage or defaults
        const savedSpeed = localStorage.getItem("SPEED_LIMIT");
        const savedTemp = localStorage.getItem("TEMP_LIMIT");
        if (savedSpeed) setSpeedLimit(Number(savedSpeed));
        if (savedTemp) setTempLimit(Number(savedTemp));
    }, []);

    const saveSettings = () => {
        localStorage.setItem("SPEED_LIMIT", String(speedLimit));
        localStorage.setItem("TEMP_LIMIT", String(tempLimit));
        alert("Settings Saved! Updates will reflect on the Map.");
    };

    return (
        <div style={{ padding: "24px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ color: "#1f2937", marginBottom: "32px" }}>🔧 Admin Dashboard</h1>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                {/* Ayarlar Kartı */}
                <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <h2 style={{ fontSize: "20px", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                        ⚙️ System Thresholds
                    </h2>

                    <div style={{ marginBottom: "20px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                            Max Speed Limit (km/h)
                        </label>
                        <input
                            type="number"
                            value={speedLimit}
                            onChange={(e) => setSpeedLimit(Number(e.target.value))}
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                        />
                    </div>

                    <div style={{ marginBottom: "24px" }}>
                        <label style={{ display: "block", marginBottom: "8px", fontWeight: 500 }}>
                            Max Temperature Limit (°C)
                        </label>
                        <input
                            type="number"
                            value={tempLimit}
                            onChange={(e) => setTempLimit(Number(e.target.value))}
                            style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #d1d5db" }}
                        />
                    </div>

                    <button
                        onClick={saveSettings}
                        style={{
                            width: "100%",
                            padding: "16px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "bold",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Save Configuration
                    </button>
                </div>

                {/* Monitoring Kartı */}
                <div style={{ backgroundColor: "white", padding: "24px", borderRadius: "12px", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}>
                    <h2 style={{ fontSize: "20px", marginBottom: "20px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                        📊 Infrastructure Monitoring
                    </h2>

                    <p style={{ color: "#6b7280", marginBottom: "24px" }}>
                        Access real-time metrics for backend services (Ingestion, Processor) and infrastructure health.
                    </p>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <a
                            href="http://localhost:3001"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: "block",
                                padding: "20px",
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                textDecoration: "none",
                                color: "#0f172a",
                                fontWeight: 600,
                                textAlign: "center"
                            }}
                        >
                            📈 Open Grafana Dashboard
                        </a>

                        <a
                            href="http://localhost:9090"
                            target="_blank"
                            rel="noreferrer"
                            style={{
                                display: "block",
                                padding: "20px",
                                backgroundColor: "#f8fafc",
                                border: "1px solid #e2e8f0",
                                borderRadius: "8px",
                                textDecoration: "none",
                                color: "#0f172a",
                                fontWeight: 600,
                                textAlign: "center"
                            }}
                        >
                            🔥 Open Prometheus
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
