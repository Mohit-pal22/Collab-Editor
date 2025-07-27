// collab-code-editor/frontend/components/Chat.jsx

import { useState, useEffect, useRef } from "react";
import socket from "../../socket";
import { useAuth } from "../../context/AuthContext";

const Chat = ({id}) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef();
  const { user } = useAuth();

  // Scroll to bottom on new message
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Receive message
  useEffect(() => {
    socket.on("receive_chat", (message) => {
      setMessages((prev) => [...prev, message]);
    });
    return () => {
      socket.off("receive_chat");
    };
  }, []);


  const handleSend = () => {
    if (!input.trim()) return;
    console.log(user);
    const message = {
  sender: user?.name || "You",
  senderId: user?._id, 
  text: input,
  timestamp: new Date().toISOString(),
};


    socket.emit("send_chat", { documentId: id, ...message });
    setMessages((prev) => [...prev, message]);
    setInput("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

 return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
      background: "#f5f5f5"
    }}>
      <div style={{
        padding: "10px",
        borderBottom: "1px solid #ccc",
        fontWeight: "bold"
      }}>
        💬 Chat
      </div>

      <div style={{
        flex: 1,
        overflowY: "auto",
        padding: "10px",
        background: "#fafafa"
      }}>
        {messages.map((msg) => {
  const isSelf = msg.senderId === user?._id;
  return (
    <div
      key={msg.timestamp}
      style={{
        display: "flex",
        justifyContent: isSelf ? "flex-end" : "flex-start",
        marginBottom: "8px",
      }}
    >
      <div
        style={{
          background: isSelf ? "#007bff" : "#e2e3e5",
          color: isSelf ? "#fff" : "#000",
          padding: "6px 12px",
          borderRadius: "12px",
          maxWidth: "70%",
          wordBreak: "break-word",
        }}
      >
        <strong style={{ fontSize: "0.8rem" }}>{msg.sender}</strong>
        <br />
        <span>{msg.text}</span>
      </div>
    </div>
  );
})}

        <div ref={chatEndRef}></div>
      </div>

      <div style={{
        padding: "10px",
        borderTop: "1px solid #ccc",
        display: "flex",
        gap: "10px"
      }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          style={{ flex: 1, padding: "8px" }}
        />
        <button onClick={handleSend} style={{ padding: "8px 16px" }}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;