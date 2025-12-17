import { useEffect, useState, useRef } from "react";

interface ChatMessage {
    username: string;
    content: string;
    timestamp: number;
}

export default function PulseChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState("");
    const [username] = useState("User_" + Math.floor(Math.random() * 1000));
    const wsRef = useRef<WebSocket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Chat Service WebSocket
        const ws = new WebSocket("ws://localhost:8082/ws");
        wsRef.current = ws;

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                setMessages((prev) => [...prev, data]);
            } catch (err) {
                console.error("Chat parse error", err);
            }
        };

        return () => {
            ws.close();
        };
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (!input.trim() || !wsRef.current) return;

        const msg: ChatMessage = {
            username,
            content: input,
            timestamp: Date.now()
        };

        wsRef.current.send(JSON.stringify(msg));
        setInput("");
    };

    return (
        <div className="pulse-chat-container" style={{
            position: "absolute",
            bottom: "20px",
            right: "20px",
            width: "300px",
            height: "400px",
            backgroundColor: "white",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            display: "flex",
            flexDirection: "column",
            zIndex: 2000,
            fontFamily: "Inter, sans-serif"
        }}>
            <div className="chat-header" style={{
                padding: "12px",
                borderBottom: "1px solid #eee",
                fontWeight: "bold",
                backgroundColor: "#0ea5e9",
                color: "white",
                borderTopLeftRadius: "12px",
                borderTopRightRadius: "12px"
            }}>
                Pulse Chat 💬
            </div>

            <div className="chat-messages" style={{
                flex: 1,
                overflowY: "auto",
                padding: "12px",
                display: "flex",
                flexDirection: "column",
                gap: "8px"
            }}>
                {messages.map((m, i) => (
                    <div key={i} style={{
                        alignSelf: m.username === username ? "flex-end" : "flex-start",
                        maxWidth: "80%",
                        backgroundColor: m.username === username ? "#0ea5e9" : "#f3f4f6",
                        color: m.username === username ? "white" : "black",
                        padding: "8px 12px",
                        borderRadius: "12px",
                        fontSize: "14px"
                    }}>
                        <div style={{ fontSize: "10px", opacity: 0.8, marginBottom: "2px" }}>{m.username}</div>
                        {m.content}
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <div className="chat-input" style={{
                padding: "12px",
                borderTop: "1px solid #eee",
                display: "flex",
                gap: "8px"
            }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Mesaj yaz..."
                    style={{
                        flex: 1,
                        padding: "8px",
                        borderRadius: "6px",
                        border: "1px solid #ddd",
                        outline: "none"
                    }}
                />
                <button onClick={sendMessage} style={{
                    backgroundColor: "#0ea5e9",
                    color: "white",
                    border: "none",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}>➤</button>
            </div>
        </div>
    );
}
