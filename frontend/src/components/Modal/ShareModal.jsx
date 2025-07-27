import { useState } from "react";
import axios from "../../api";

const ShareModal = ({ onClose, documentId }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleShare = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`/documents/share/${documentId}`, { email });
      setSuccess("Document shared successfully!");
      setError(null);
      setEmail("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to share document.");
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Share Document</h3>
        <input
          type="email"
          placeholder="Enter user email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button onClick={handleShare} disabled={loading || !email}>
          {loading ? "Sharing..." : "Share"}
        </button>
        {success && <p style={{ color: "lightgreen" }}>{success}</p>}
        {error && <p style={{ color: "salmon" }}>{error}</p>}
        <button onClick={onClose} style={{ marginTop: "10px", background: "#555" }}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ShareModal;
