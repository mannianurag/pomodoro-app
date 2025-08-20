import { useState, useEffect } from "react";
import "../styles/SettingsModal.css";

export default function SettingsModal({
  isOpen,
  onClose,
  onSave,
  onVolumePreview,
  defaultMinutes,
  defaultSeconds,
  shortBreakMinutes,
  shortBreakSeconds,
  longBreakMinutes,
  longBreakSeconds,
  masterVolumePct,
  autoStartNext,
  cyclesBeforeLong,
}) {
  const [workMin, setWorkMin] = useState(defaultMinutes);
  const [workSec, setWorkSec] = useState(defaultSeconds);
  const [shortMin, setShortMin] = useState(shortBreakMinutes);
  const [shortSec, setShortSec] = useState(shortBreakSeconds);
  const [longMin, setLongMin] = useState(longBreakMinutes);
  const [longSec, setLongSec] = useState(longBreakSeconds);
  const [volumePct, setVolumePct] = useState(Number(masterVolumePct));
  const [autoStart, setAutoStart] = useState(autoStartNext ?? false);
  const [cycles, setCycles] = useState(Number(cyclesBeforeLong));
  const [activeTab, setActiveTab] = useState("duration"); // 'duration' | 'notifications'

  // Reset local state when modal opens with current prop values
  useEffect(() => {
    if (isOpen) {
      setWorkMin(defaultMinutes);
      setWorkSec(defaultSeconds);
      setShortMin(shortBreakMinutes);
      setShortSec(shortBreakSeconds);
      setLongMin(longBreakMinutes);
      setLongSec(longBreakSeconds);
      setVolumePct(Number(masterVolumePct));
      setAutoStart(autoStartNext ?? false);
      setCycles(Number(cyclesBeforeLong));
    }
  }, [isOpen, defaultMinutes, defaultSeconds, shortBreakMinutes, shortBreakSeconds, longBreakMinutes, longBreakSeconds, masterVolumePct, autoStartNext, cyclesBeforeLong]);

  if (!isOpen) return null;

  const blockNonIntegerKeys = (event) => {
    const blocked = [".", ",", "e", "E", "-", "+"];
    if (blocked.includes(event.key)) {
      event.preventDefault();
    }
  };

  const parseIntSafe = (value, fallback = 0) => {
    const parsed = parseInt(value, 10);
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

  const handleSave = () => {
    const wMin = clamp(parseIntSafe(workMin, 0), 0, 600);
    const wSec = clamp(parseIntSafe(workSec, 0), 0, 59);
    const sMin = clamp(parseIntSafe(shortMin, 0), 0, 600);
    const sSec = clamp(parseIntSafe(shortSec, 0), 0, 59);
    const lMin = clamp(parseIntSafe(longMin, 0), 0, 600);
    const lSec = clamp(parseIntSafe(longSec, 0), 0, 59);

    onSave(wMin, wSec, sMin, sSec, lMin, lSec, volumePct, autoStart, cycles);
    onClose();
  };

  const handleCancel = () => {
    // Reset local state to original values
    setWorkMin(defaultMinutes);
    setWorkSec(defaultSeconds);
    setShortMin(shortBreakMinutes);
    setShortSec(shortBreakSeconds);
    setLongMin(longBreakMinutes);
    setLongSec(longBreakSeconds);
    setVolumePct(Number(masterVolumePct));
    setAutoStart(autoStartNext ?? false);
    setCycles(Number(cyclesBeforeLong));
    onClose();
  };

  // Helper for input change handler
  const handleInputChange = (setter, max) => (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    const asNum = parseIntSafe(digits, 0);
    setter(clamp(asNum, 0, max));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="icon-btn" onClick={handleCancel} aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M8 8l8 8M16 8l-8 8" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </button>
        </div>

        <div className="segmented">
          <button className={`seg-btn ${activeTab === 'duration' ? 'active' : ''}`} onClick={() => setActiveTab('duration')}>Duration</button>
          <button className={`seg-btn ${activeTab === 'notifications' ? 'active' : ''}`} onClick={() => setActiveTab('notifications')}>Preferences</button>
        </div>
        <div className="tab-content">
          {activeTab === 'duration' && (
            <ul className="settings-list">
              <li className="settings-row">
                <span className="row-label">Focus Session</span>
                <span className="row-value">
                  <input className="mm" type="number" inputMode="numeric" min="0" max="600" value={workMin} onKeyDown={blockNonIntegerKeys} onChange={(e)=> setWorkMin(e.target.value.replace(/\D/g, ''))} />
                  <span className="unit">min</span>
                  <input className="ss" type="number" inputMode="numeric" min="0" max="59" value={workSec} onKeyDown={blockNonIntegerKeys} onChange={handleInputChange(setWorkSec,59)} />
                  <span className="unit">sec</span>
                </span>
              </li>

              <li className="settings-row">
                <span className="row-label">Short break</span>
                <span className="row-value">
                  <input className="mm" type="number" inputMode="numeric" min="0" max="600" value={shortMin} onKeyDown={blockNonIntegerKeys} onChange={(e)=> setShortMin(e.target.value.replace(/\D/g, ''))} />
                  <span className="unit">min</span>
                  <input className="ss" type="number" inputMode="numeric" min="0" max="59" value={shortSec} onKeyDown={blockNonIntegerKeys} onChange={handleInputChange(setShortSec,59)} />
                  <span className="unit">sec</span>
                </span>
              </li>

              <li className="settings-row">
                <span className="row-label">Long break</span>
                <span className="row-value">
                  <input className="mm" type="number" inputMode="numeric" min="0" max="600" value={longMin} onKeyDown={blockNonIntegerKeys} onChange={(e)=> setLongMin(e.target.value.replace(/\D/g, ''))} />
                  <span className="unit">min</span>
                  <input className="ss" type="number" inputMode="numeric" min="0" max="59" value={longSec} onKeyDown={blockNonIntegerKeys} onChange={handleInputChange(setLongSec,59)} />
                  <span className="unit">sec</span>
                </span>
              </li>

              <li className="settings-row">
                <span className="row-label">Long break after</span>
                <span className="row-value">
                  <input className="mm" type="number" inputMode="numeric" min="2" max="10" value={cycles} onKeyDown={blockNonIntegerKeys} onChange={(e)=> setCycles(e.target.value.replace(/\D/g, ''))} />
                  <span className="unit">Focus Sessions </span>
                </span>
              </li>
            </ul>
          )}

          {activeTab === 'notifications' && (
            <div className="notifications-pane">
              <div className="notif-row">
                <div className="notif-label">Master volume</div>
                <div className="notif-control">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volumePct}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setVolumePct(v);
                      if (onVolumePreview) onVolumePreview(v);
                    }}
                  />
                  <div className="volume-readout">{volumePct}%</div>
                </div>
              </div>
              <div className="notif-row">
                <div className="notif-label">Auto start next</div>
                <div className="notif-control">
                  <label className="switch">
                    <input type="checkbox" checked={autoStart} onChange={(e)=> setAutoStart(e.target.checked)} />
                    <span className="slider" />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleSave}>Save</button>
          <button className="btn-muted" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
