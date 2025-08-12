import "../styles/CompletionPopup.css";

export default function CompletionPopup({ message, onClose }) {
  return (
    <div className="popup-overlay">
      <div className="popup">
        <h2>{message}</h2>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
}
