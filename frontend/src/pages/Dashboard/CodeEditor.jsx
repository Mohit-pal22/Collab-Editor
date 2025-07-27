import { useState, useEffect, useRef } from "react";
import Editor, { monaco }  from "@monaco-editor/react";
import { useParams } from "react-router-dom";
import API from "../../api";
import socket from "../../socket";
import Sidebar from "./Sidebar";
import Chat from "./Chat";
import ShareModal from "../../components/Modal/ShareModal";
import { useAuth } from "../../context/AuthContext";
import "../../styles/CodeEditor.css"; // 👈 Importing new stylesheet
import debounce from "lodash.debounce";
import { useNavigate } from "react-router-dom";



const supportedLanguages = [
  "javascript",
  "python",
  "java",
  "c",
  "cpp",
  "typescript",
  "html",
  "css",
  "json",
  "markdown",
];

const CodeEditor = () => {
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [collaborators, setCollaborators] = useState([]);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [chatVisible, setChatVisible] = useState(true);
  const [currentlyEditingUsers, setCurrentlyEditingUsers] = useState({});
  const [editingTimestamps, setEditingTimestamps] = useState({});
  const [isTyping, setIsTyping] = useState(false);


  const editorRef = useRef(null);
  const typingTimeout = useRef(null);

const { user, authLoading } = useAuth();
  const { id } = useParams();

const handleEditorDidMount = (editor) => {
  editorRef.current = editor;
};

useEffect(() => {
  if (editorRef.current && typeof editorRef.current.layout === "function") {
    editorRef.current.layout();
  }
}, [sidebarVisible, chatVisible]);


useEffect(() => {
  const handleResize = () => {
    if (editorRef.current) {
      editorRef.current.layout();
    }
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);



  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const res = await API.get(`/documents/${id}`);
        setCode(res.data.content || "");
        setLanguage(res.data.language || "javascript");
        setTitle(res.data.title || "Untitled");
        setCollaborators([res.data.owner, ...res.data.sharedWith]);

      } catch (err) {
        console.error("Error loading document:", err);
        setError("Document not found or access denied");
      } finally {
        setLoading(false);
      }
    };
    fetchDocument();
  }, [id, user]);

useEffect(() => {
  if (!user || !id) return;

  if (!socket.connected) {
    socket.connect();
  }

  socket.emit("join_room", {
    documentId: id,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar || null,
    },
  });

socket.on("user_editing_update", ({ userId, isEditing }) => {
  setCurrentlyEditingUsers((prev) => ({
    ...prev,
    [userId]: isEditing,
  }));

  // Store timestamp for local cleanup (if isEditing)
  if (isEditing) {
    setEditingTimestamps((prev) => ({
      ...prev,
      [userId]: Date.now(),
    }));
  }
});

  // Listen for updates
socket.on("receive_code", (newCode) => {
  if (!isTyping && editorRef.current) {
    const editor = editorRef.current;
    const model = editor.getModel();
    const current = model.getValue();

    if (newCode !== current) {
      const pos = editor.getPosition();
      model.pushEditOperations(
        [],
        [{ range: model.getFullModelRange(), text: newCode }],
        () => null
      );
      editor.setPosition(pos);
    }
  }
});



  socket.on("user_list", (users) => {
    setCollaborators(users);
  });

  // Cleanup on unmount
  return () => {
    socket.off("user_editing_update");
    socket.emit("leave_room", id);
    socket.off("receive_code");
    socket.off("user_list");
  };
}, [user?._id, id]); // 👈 Depend on user._id safely



const handleChange = (value) => {
  setIsTyping(true);
  socket.emit("send_code", { code: value, room: id });
  socket.emit("user_editing", { room: id, user: { id: user._id, name: user.name, avatar: user.avatar } });

  // Debounce clearing typing state
  clearTimeout(typingTimeout.current);
  typingTimeout.current = setTimeout(() => {
    setIsTyping(false);
  }, 1000);
};



const handleEditorChange = (value) => {
  // Trigger editing status immediately

  handleChange(value); // Still debounce the actual code send
};


  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    try {
      await API.put(`/documents/${id}`, { language: newLang });
    } catch (err) {
      console.error("Failed to update language", err);
    }
  };

  const handleTitleChange = async (e) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    try {
      await API.put(`/documents/${id}`, { title: newTitle });
    } catch (err) {
      console.error("Failed to update title", err);
    }
  };

useEffect(() => {
  const interval = setInterval(() => {
    const now = Date.now();

    setCurrentlyEditingUsers((prev) => {
      const updated = { ...prev };

      Object.entries(editingTimestamps).forEach(([userId, lastEdit]) => {
        if (updated[userId] && now - lastEdit > 3500) {
          updated[userId] = false;
        }
      });

      return updated;
    });
  }, 1000);

  return () => clearInterval(interval);
}, [editingTimestamps]);



useEffect(() => {
  const interval = setInterval(() => {
    if (editorRef.current) {
      const content = editorRef.current.getValue();
      if (content.trim()) {
        API.put(`/documents/${id}`, { content });
      }
    }
  }, 5000); // autosave every 5s

  return () => clearInterval(interval);
}, [id]);

useEffect(() => {
  return () => clearTimeout(typingTimeout.current);
}, []);


  if (loading) return <div className="editor-loading">Loading document...</div>;
  if (error) return <div className="editor-error">{error}</div>;

return (
    <div className="editor-layout-wrapper" style={{ height: "100vh", position: "relative", display: "flex" }}>
  {showShareModal && (
    <ShareModal documentId={id} onClose={() => setShowShareModal(false)} />
  )}

  <div className="editor-layout">
    {/* SIDEBAR */}
    <div className={`editor-sidebar ${sidebarVisible ? "visible" : "collapsed"}`}>
      {sidebarVisible && (
        <Sidebar
  collaborators={collaborators}
  currentUser={user}
  currentlyEditingUsers={currentlyEditingUsers}
/>

      )}
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarVisible(!sidebarVisible)}
      >
        {sidebarVisible ? "←" : "→"}
      </button>
    </div>

    {/* MAIN */}
    <div className="editor-center">
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="editor-title"
          placeholder="Document Title"
        />
        <select
          value={language}
          onChange={handleLanguageChange}
          className="editor-language"
        >
          {supportedLanguages.map((lang) => (
            <option key={lang} value={lang}>
              {lang}
            </option>
          ))}
        </select>
        <button className="dashboard-btn" onClick={() => navigate("/dashboard")}>
  Back to Dashboard
</button>

        <button className="share-btn" onClick={() => setShowShareModal(true)}>
          Share
        </button>
      </div>

      <div className="monaco-wrapper">
        <Editor
  height="100%"
  theme="vs-dark"
  language={language}
  defaultValue={code}
  onMount={handleEditorDidMount}
  onChange={handleChange}
/>

      </div>
    </div>

    {/* CHAT */}
    <div className={`editor-chat ${chatVisible ? "visible" : "collapsed"}`}>
      {chatVisible && <Chat id={id} />}
      <button
        className="chat-toggle"
        onClick={() => setChatVisible(!chatVisible)}
      >
        {chatVisible ? "→" : "←"}
      </button>
    </div>
  </div>
</div>

  );
};

export default CodeEditor;