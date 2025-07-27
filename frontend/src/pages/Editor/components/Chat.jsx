import "../styles/Chat.css"
import Button from '../../../components/Button'
import { useEffect, useRef, useState } from "react"
import { useAuth } from "../../../context/AuthContext";
import socket from "../../../socket/socket";
import { useParams } from "react-router-dom";


function Chat({ onClick, className }) {
  const { user } = useAuth();
  const [message, setMessage] = useState({
    userId: user._id,
    username: user.name,
    message: ""
  });
  const [chats, setChats] = useState([]);
  const [typingUser, setTypingUser] = useState(null)
  const chatEndRef = useRef();
  const { id } = useParams(); // editing document id

  const sendMessage = () => {
  if (message.message.trim() === "") return;
  setChats((prev) => [...prev, message]);
  socket.emit("send_chat", {
    documentId: id,
    ...message
  });
  setMessage({ ...message, message: "" });
};

// Recive Chat
useEffect(() => {
  socket.on("receive_chat", (msg) => {
    setChats(prev => [...prev, msg]);
  });

  return () => socket.off("receive_chat");
}, []);


  // Typing indicator
  useEffect(() => {
    socket.on("user_typing", (user) => {
      setTypingUser(user.name);
      setTimeout(() => setTypingUser(null), 2000);
    });

    return () => socket.off("user_typing");
  }, []);

  const handleKeyDown = () => {
    socket.emit("typing", { id, user });
  };

  useEffect(() => {
    if (chatEndRef.current)
      chatEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [chats])

  return (
    <div className={`${className} w-1/5 h-screen p-2 bg-black text-black`}>
      {/* Header */}
      <Button
        className='lg:text-lg text-sm bg-black text-white border-2 border-red-400 mb-2' name="Chat ❌"
        onClick={onClick}
      />

      {/* Chat Area */}
      <div className="chat-area h-5/6">
        {/* messages */}
        <div className="messages h-full border-2 border-yellow-300 rounded-xl p-2 m-1 text-white overflow-auto flex flex-col gap-2">
          {chats.map((chat, index) => {
            // const k = useId();
            if (chat.userId === user._id)
              return (
                <div key={chat.timestamp || `${chat.userId}-${index}`} className="list-none p-2 rounded-md bg-gray-400 self-end max-w-48 min-w-16">
                  <span className="text-xs italic underline block text-right">You</span>
                  {chat.message}
                </div>
              )
            else
              return (
                <div key={chat.timestamp || `${chat.userId}-${index}`} className="list-none p-2 rounded-md bg-sky-400 self-start max-w-48 min-w-16">
                  <span className="text-xs italic underline block text-right">{chat.username}</span>
                  {chat.message}
                </div>
              )
          })}

          {typingUser && (
            <div className="fixed bottom-4 left-4 text-sm text-gray-300">
              ✍️ {typingUser} is typing...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* send message */}
        <div className="send-message fixed bottom-1">
          <input type="text" placeholder='message' value={message.message}
            className='border-2 focus:border-orange-500 outline-none py-2 rounded-lg bg-slate-100 focus:bg-white'
            onChange={(e) => setMessage(prev => ({ ...prev, message: e.target.value }))}  
            onKeyDown={(e) => {
              if (e.key === 'Enter') sendMessage();
              handleKeyDown()
            }}
          />
          <button className={'text-white bg-orange-600 hover:bg-orange-500 p-2 rounded-lg'} onClick={() => { sendMessage() }}>Send</button>
        </div>
      </div>
    </div>
  )
}

export default Chat