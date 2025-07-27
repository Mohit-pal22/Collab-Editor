import "../css/Dashboard.css"
import { useEffect, useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import { useAuth } from "../../context/AuthContext";
import Button from "../../components/Button"

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
  "markdown"
];

const Dashboard = () => {

  const { logout } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [docName, setDocName] = useState("");
  const [docLang, setDocLang] = useState("javascript");

  const openDocument = (id) => {
    navigate(`/documents/${id}`);
  };

  const deleteDocument = async (id) => {
    try {
      const res = await API.delete(`/documents/${id}`);
      setDocuments((prev) => prev.filter(doc => doc._id !== id));
      console.log(res.data.message);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  }

  const fetchDocuments = async () => {
    try {
      const res = await API.get("/documents");
      const { ownedDocuments, sharedDocuments } = res.data;
      const allDocuments = [...ownedDocuments, ...sharedDocuments];
      setDocuments(allDocuments);
    } catch (err) {
      console.error("Error fetching documents:", err);
    }
  };


  const handleCreateDocument = async () => {
    setIsCreating(true); // show loading spinner or dialog

    try {
      const res = await API.post("/documents", {
        title: docName,
        language: docLang,
        content: ""
      });

      if (res.status === 201 || res.data._id) {
        navigate(`/documents/${res.data._id}`);
      } else {
        alert("Failed to create document");
      }
    } catch (err) {
      console.error("Create doc error:", err);
      alert("An error occurred while creating document");
    } finally {
      setIsCreating(false); // hide loading
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="p-5 h-screen">
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Button onClick={() => setShowForm(true)}
          className="py-1 px-3 bg-gray-600 hover:bg-gray-800 border-none rounded-md cursor-pointer"
          name="New Document"
        />
        <h2 className="font-bold text-2xl">Your Documents</h2>
        <Button onClick={logout}
          className="py-1 px-3 bg-red-500 hover:bg-red-700 border-none rounded-md cursor-pointer"
          name="Logout"
        />
      </div>

      {showForm && (
        <Modal onClose={() => setShowForm(false)}>
          <h3 className="text-lg font-bold mb-3">Create New Document</h3>
          <input
            placeholder="Document Name"
            value={docName}
            onChange={(e) => setDocName(e.target.value)}
            className="border-2 border-black rounded"
          />


          <select value={docLang} onChange={(e) => setDocLang(e.target.value)}
            className="focus:outline-none">
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>{lang}</option>
            ))}
          </select>
          <button onClick={handleCreateDocument} className="text-white block bg-blue-500 p-1 rounded-lg mx-auto relative top-3"
          >Create</button>
        </Modal>
      )}

      <ul className="mt-6">
        {documents.map((doc) => (
          <li key={doc._id}
            className="mt-1 flex border border-white px-3 py-2 rounded-md items-center"
          >
            <strong>{doc.title}</strong>
            <div className="flex items-center ml-auto gap-2">
              <Button
                className="cursor-pointer"
                name={doc.language}
              />
              <Button
                onClick={() => deleteDocument(doc._id)}
                className="cursor-pointer text-rose-600 hover:text-red-800"
                name="Delete"
              />
              <Button
                onClick={() => openDocument(doc._id)}
                className="cursor-pointer hover:text-blue-400"
                name="Edit"
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
