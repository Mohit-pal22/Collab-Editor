import "./css/Modal.css";

const Modal = ({ onClose, children }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button onClick={onClose} className="modal-close">✕</button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
