import { useState } from "react";
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
  const [autoStart, setAutoStart] = useState(Boolean(autoStartNext));
  const [cycles, setCycles] = useState(Number(cyclesBeforeLong));

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

  // Helper for input change handler
  const handleInputChange = (setter, max) => (e) => {
    const digits = e.target.value.replace(/\D/g, "");
    const asNum = parseIntSafe(digits, 0);
    setter(clamp(asNum, 0, max));
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Settings</h2>

        {/* Durations */}
        <div className="duration-row-container">
          <label className="duration-label">Work duration</label>
          <div className="inputs-inline">
            <div className="input-group">
              <label>Minutes</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="600"
                value={workMin}
                onKeyDown={blockNonIntegerKeys}
                onChange={(e) => setWorkMin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="colon"> </div>
            <div className="input-group">
              <label>Seconds</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="59"
                value={workSec}
                onKeyDown={blockNonIntegerKeys}
                onChange={handleInputChange(setWorkSec, 59)}
              />
            </div>
          </div>
        </div>

        <div className="duration-row-container">
          <label className="duration-label">Short break</label>
          <div className="inputs-inline">
            <div className="input-group">
              <label>Minutes</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="600"
                value={shortMin}
                onKeyDown={blockNonIntegerKeys}
                onChange={(e) => setShortMin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="colon"> </div>
            <div className="input-group">
              <label>Seconds</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="59"
                value={shortSec}
                onKeyDown={blockNonIntegerKeys}
                onChange={handleInputChange(setShortSec, 59)}
              />
            </div>
          </div>
        </div>

        <div className="duration-row-container">
          <label className="duration-label">Long break</label>
          <div className="inputs-inline">
            <div className="input-group">
              <label>Minutes</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="600"
                value={longMin}
                onKeyDown={blockNonIntegerKeys}
                onChange={(e) => setLongMin(e.target.value.replace(/\D/g, ""))}
              />
            </div>
            <div className="colon"> </div>
            <div className="input-group">
              <label>Seconds</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="0"
                max="59"
                value={longSec}
                onKeyDown={blockNonIntegerKeys}
                onChange={handleInputChange(setLongSec, 59)}
              />
            </div>
          </div>
        </div>

        {/* Sounds */}
        <div className="duration-row-container">
          <label className="duration-label">Sounds</label>
          <div className="inputs-inline">
            <div className="input-group" style={{minWidth: '200px'}}>
              <label>Master volume: {volumePct}%</label>
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
            </div>
          </div>
        </div>

        {/* Automation */}
        <div className="duration-row-container">
          <label className="duration-label">Automation</label>
          <div className="inputs-inline">
            <div className="input-group">
              <label>Auto start next</label>
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
              />
            </div>
            <div className="input-group">
              <label>Cycles before long break</label>
              <input
                type="number"
                inputMode="numeric"
                step="1"
                min="2"
                max="10"
                value={cycles}
                onKeyDown={blockNonIntegerKeys}
                onChange={(e) => setCycles(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
        </div>

        <div className="modal-buttons">
          <button className="btn-primary" onClick={handleSave}>Save</button>
          <button className="btn-muted" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
