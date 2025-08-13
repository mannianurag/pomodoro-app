import { useState, useEffect, useRef } from "react";
import SettingsModal from "./components/SettingsModal";
import CompletionPopup from "./components/CompletionPopup";
import confetti from "canvas-confetti";
import "./styles/App.css";
import tickSfx from "./sounds/each-tick.mp3";
import focusRingSfx from "./sounds/focus-complete-ring.mp3";
import breakRingSfx from "./sounds/break-complete-ring.mp3";

export default function App() {
  // Collections of alternate verbiage for different UI texts
  const taskInputPlaceholders = [
    "Enter the task you want to focus on.",
    "What would you like to complete?",
    "What's your next priority?",
    "Set the task you'll work on now.",
    "What’s the goal for this session?",
    "Focus time! What’s on your list?",
    "Time to be productive — what’s the target?",
    "What’s the task you’re tackling?",
    "Eat that frog.",
    "What task would you like to achieve?",
    "What do you want to get done?",
    "Which task will you work on?",
    "What’s the next thing to complete?",
    "Name the task for this session.",
    "What’s your current focus?",
    "What needs your attention?",
  ];
  const startButtonLabels = ["Start"];
  const pauseButtonLabels = ["Pause"];
  const resetButtonLabels = ["Reset timer"];
  const skipButtonLabels = ["Skip break"];
  const breakStateLabels = {
    short: ["S H O R T  B R E A K"],
    long: ["L O N G  B R E A K"],
  };
  const modeLabels = { focus: ["F O C U S"] };

  const completionMessages = {
    focus: [
      "Focus complete! Time for a break.",
      "Well done! Break time now.",
      "Session finished — enjoy your break.",
      "You did it! Take a breather.",
      "Great work! Take a moment to rest.",
      "Task done. Recharge during your break.",
      "Focus session complete. Relax for a bit.",
      "You stayed on track. Enjoy your pause.",
      "Task finished — enjoy your downtime.",
      "Nicely done! Time to unwind a little.",
    ],
    break: [
      "Break over! Back to focus.",
      "Time to get back to work.",
      "Break's up — let's go!",
      "Break’s done. Let’s dive back in.",
      "Rest is over, time to refocus.",
      "Hope you refreshed—let’s get back to it.",
      "Break finished. Let’s keep the momentum going.",
      "Back to business. You’ve got this."
    ],
  };

  
  // Helper to pick a random element from an array
  const getRandomText = (arr) => arr[Math.floor(Math.random() * arr.length)];
  // Note: all text collections are defined once near the top of the component
  const tickAudioRef = useRef(null);
  const focusRingRef = useRef(null);
  const breakRingRef = useRef(null);
  const previewFadeIntervalRef = useRef(null);
  const previewTimeoutRef = useRef(null);
  // Stable UI strings for this session (do not change each re-render)
  const placeholderRef = useRef(getRandomText(taskInputPlaceholders));
  const startLabelRef = useRef(getRandomText(startButtonLabels));
  const pauseLabelRef = useRef(getRandomText(pauseButtonLabels));
  const resetLabelRef = useRef(getRandomText(resetButtonLabels));
  const skipLabelRef = useRef(getRandomText(skipButtonLabels));
  const focusLabelRef = useRef(getRandomText(modeLabels.focus));
  const shortBreakLabelRef = useRef(getRandomText(breakStateLabels.short));
  const longBreakLabelRef = useRef(getRandomText(breakStateLabels.long));

  // Robust LS number reader that doesn't treat 0 as falsy
  function readNumberFromLocalStorage(key, fallback) {
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return fallback;
      const n = Number(stored);
      return Number.isFinite(n) ? n : fallback;
    } catch {
      return fallback;
    }
  }
  

  // State variables
  const [task, setTask] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [defaultMinutes, setDefaultMinutes] = useState(
    () => readNumberFromLocalStorage("defaultMinutes", 25)
  );
  const [defaultSeconds, setDefaultSeconds] = useState(
    () => readNumberFromLocalStorage("defaultSeconds", 0)
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState(
    () => readNumberFromLocalStorage("shortBreakMinutes", 5)
  );
  const [shortBreakSeconds, setShortBreakSeconds] = useState(
    () => readNumberFromLocalStorage("shortBreakSeconds", 0)
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(
    () => readNumberFromLocalStorage("longBreakMinutes", 15)
  );
  const [longBreakSeconds, setLongBreakSeconds] = useState(
    () => readNumberFromLocalStorage("longBreakSeconds", 0)
  );
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [completedTasks, setCompletedTasks] = useState(
    () => JSON.parse(localStorage.getItem("completedTasks")) || []
  );
  const [showPopup, setShowPopup] = useState(false);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [breakType, setBreakType] = useState("short"); // 'short' | 'long'
  const [lastCompletedType, setLastCompletedType] = useState(null); // 'focus' | 'break'
  const [popupMessage, setPopupMessage] = useState("");
  const [soundsEnabled, setSoundsEnabled] = useState(
    () => JSON.parse(localStorage.getItem("soundsEnabled")) ?? true
  );
  const [masterVolumePct, setMasterVolumePct] = useState(
    () => readNumberFromLocalStorage("masterVolumePct", 100)
  );
  const [autoStartNext, setAutoStartNext] = useState(
    () => JSON.parse(localStorage.getItem("autoStartNext")) ?? false
  );
  const [cyclesBeforeLong, setCyclesBeforeLong] = useState(
    () => readNumberFromLocalStorage("cyclesBeforeLong", 3)
  );

  const masterVolume = Math.max(0, Math.min(1, masterVolumePct / 100));
  const isMuted = !soundsEnabled || masterVolumePct === 0;

  // On mount or when defaults change, set timer to default work time
  useEffect(() => {
    setMinutes(defaultMinutes);
    setSeconds(defaultSeconds);
  }, [defaultMinutes, defaultSeconds]);

  // Initialize audio on mount
  useEffect(() => {
    tickAudioRef.current = new Audio(tickSfx);
    focusRingRef.current = new Audio(focusRingSfx);
    breakRingRef.current = new Audio(breakRingSfx);
    if (tickAudioRef.current) tickAudioRef.current.volume = masterVolume;
    if (focusRingRef.current) focusRingRef.current.volume = masterVolume;
    if (breakRingRef.current) breakRingRef.current.volume = masterVolume;
  }, []);

  // Update volumes when master changes
  useEffect(() => {
    if (tickAudioRef.current) tickAudioRef.current.volume = masterVolume;
    if (focusRingRef.current) focusRingRef.current.volume = masterVolume;
    if (breakRingRef.current) breakRingRef.current.volume = masterVolume;
  }, [masterVolume]);

  // Stop any preview when settings modal closes
  useEffect(() => {
    if (!isSettingsOpen) {
      // stop preview
      if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
      if (previewFadeIntervalRef.current) clearInterval(previewFadeIntervalRef.current);
      if (focusRingRef.current) {
        try { focusRingRef.current.pause(); } catch {}
      }
    }
  }, [isSettingsOpen]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
          if (!isMuted && tickAudioRef.current) {
            try { tickAudioRef.current.currentTime = 0; tickAudioRef.current.play(); } catch {}
          }
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
          if (!isMuted && tickAudioRef.current) {
            try { tickAudioRef.current.currentTime = 0; tickAudioRef.current.play(); } catch {}
          }
        } else {
          clearInterval(timer);
          setIsRunning(false);
          handleCompletion();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds, soundsEnabled]);

  const handleStart = () => {
    if (!task.trim() && !isBreak) {
      const nextSessionNumber = (completedTasks?.length || 0) + 1;
      setTask(`Focus Session #${nextSessionNumber}`);
    }
    setIsRunning(true);
  };

  const handleReset = () => {
    setIsRunning(false);
    setMinutes(defaultMinutes);
    setSeconds(defaultSeconds);
    if (!isBreak) setTask("");
  };

  const handleClearCompleted = () => {
    setCompletedTasks([]);
    localStorage.setItem("completedTasks", JSON.stringify([]));
  };

  const handleSkipBreak = () => {
    setIsBreak(false);
    setMinutes(defaultMinutes);
    setSeconds(defaultSeconds);
    setTask("");
  };

  const handleSaveSettings = (
    newWorkMin,
    newWorkSec,
    newShortMin,
    newShortSec,
    newLongMin,
    newLongSec,
    newMasterVolumePct,
    newAutoStartNext,
    newCyclesBeforeLong
  ) => {
    setDefaultMinutes(newWorkMin);
    setDefaultSeconds(newWorkSec);
    setShortBreakMinutes(newShortMin);
    setShortBreakSeconds(newShortSec);
    setLongBreakMinutes(newLongMin);
    setLongBreakSeconds(newLongSec);
    setMasterVolumePct(Number(newMasterVolumePct));
    setAutoStartNext(Boolean(newAutoStartNext));
    setCyclesBeforeLong(Number(newCyclesBeforeLong));

    localStorage.setItem("defaultMinutes", newWorkMin);
    localStorage.setItem("defaultSeconds", newWorkSec);
    localStorage.setItem("shortBreakMinutes", newShortMin);
    localStorage.setItem("shortBreakSeconds", newShortSec);
    localStorage.setItem("longBreakMinutes", newLongMin);
    localStorage.setItem("longBreakSeconds", newLongSec);
    localStorage.setItem("masterVolumePct", String(newMasterVolumePct));
    localStorage.setItem("autoStartNext", JSON.stringify(Boolean(newAutoStartNext)));
    localStorage.setItem("cyclesBeforeLong", String(newCyclesBeforeLong));

    setMinutes(newWorkMin);
    setSeconds(newWorkSec);
  };

  const handleCompletion = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setShowPopup(!autoStartNext);

    if (!isBreak) {
      setLastCompletedType("focus");
      if (!isMuted && focusRingRef.current) {
        try { focusRingRef.current.currentTime = 0; focusRingRef.current.play(); } catch {}
      }
      const updatedTasks = [...completedTasks, task];
      setCompletedTasks(updatedTasks);
      localStorage.setItem("completedTasks", JSON.stringify(updatedTasks));

      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      if (newCount % cyclesBeforeLong === 0) {
        startBreak(longBreakMinutes, longBreakSeconds, "long");
      } else {
        startBreak(shortBreakMinutes, shortBreakSeconds, "short");
      }
      if (!autoStartNext) {
        setPopupMessage(getRandomText(completionMessages.focus));
      }
    } else {
      setLastCompletedType("break");
      if (!isMuted && breakRingRef.current) {
        try { breakRingRef.current.currentTime = 0; breakRingRef.current.play(); } catch {}
      }
      setIsBreak(false);
      setMinutes(defaultMinutes);
      setSeconds(defaultSeconds);
      setTask("");
      if (autoStartNext) {
        const nextSessionNumber = (completedTasks?.length || 0) + 1;
        setTask(`Focus Session #${nextSessionNumber}`);
        setTimeout(() => {
          setIsRunning(true);
        }, 3000);
      } else {
        setPopupMessage(getRandomText(completionMessages.break));
      }
    }
  };

  const startBreak = (breakMinutes, breakSeconds, type) => {
    setIsBreak(true);
    setBreakType(type);
    setMinutes(breakMinutes);
    setSeconds(breakSeconds);
    setTask(`Break (${String(breakMinutes).padStart(2, "0")}:${String(breakSeconds).padStart(2, "0")})`);
    if (autoStartNext) {
      setTimeout(() => {
        setIsRunning(true);
      }, 3000);
    }
  };

  return (
    <div className={`app-container ${isBreak ? "break-mode" : "task-mode"}`}>
      
      <h1 className="app-title">🍅 Pomodoras</h1>

      <div className="time-display">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        
        <div className="state-label">
          {isBreak
            ? (breakType === "long" ? longBreakLabelRef.current : shortBreakLabelRef.current)
            : focusLabelRef.current}
        </div>
      </div>

      <input
        className="task-input"
        type="text"
        placeholder={placeholderRef.current}
        value={task}
        onChange={(e) => setTask(e.target.value)}
        disabled={isBreak}
      />

      <div className="controls">
        <button
          className={`btn btn-muted settings-btn`}
          onClick={() => {
            const next = !(soundsEnabled && masterVolumePct > 0);
            setSoundsEnabled(next);
            localStorage.setItem("soundsEnabled", JSON.stringify(next));
            if (!next) {
              try { if (tickAudioRef.current) tickAudioRef.current.pause(); } catch {}
              try { if (focusRingRef.current) focusRingRef.current.pause(); } catch {}
              try { if (breakRingRef.current) breakRingRef.current.pause(); } catch {}
            }
          }}
          aria-label={isMuted ? "Unmute" : "Mute"}
          title={isMuted ? "Unmute" : "Mute"}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M4 9v6h3l5 4V5L7 9H4Z" stroke="currentColor" strokeWidth="1.6"/>
            {isMuted ? (
              <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.6"/>
            ) : (
              <path d="M16.5 8.5a5 5 0 010 7m2.5-9a8 8 0 010 11" stroke="currentColor" strokeWidth="1.6"/>
            )}
          </svg>
        </button>
        {!isRunning ? (
          <button className="btn btn-primary" onClick={handleStart}>
            {startLabelRef.current}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsRunning(false)}>
            {pauseLabelRef.current}
          </button>
        )}
        {isBreak ? (
          <button className="btn btn-muted" onClick={handleSkipBreak}>
            {skipLabelRef.current}
          </button>
        ) : (
          <button className="btn btn-muted" onClick={handleReset}>
            {resetLabelRef.current}
          </button>
        )}
        <button
          className="btn btn-muted settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Settings"
          title="Settings"
        >
          {/* SVG unchanged */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6"/>
            <path d="M20.2 12.94c.05-.3.08-.61.08-.94 0-.33-.03-.64-.08-.94l2.02-1.58a.5.5 0 0 0 .12-.64l-1.91-3.3a.5.5 0 0 0-.61-.22l-2.38.96a7.26 7.26 0 0 0-1.63-.94l-.36-2.53A.5.5 0 0 0 14 1h-4a.5.5 0 0 0-.49.41l-.36 2.53c-.58.23-1.12.53-1.63.94l-2.38-.96a.5.5 0 0 0-.61.22l-1.91 3.3a.5.5 0 0 0 .12.64L4.76 11c-.05.3-.08.61-.08.94 0 .33.03.64.08.94l-2.02 1.58a.5.5 0 0 0-.12.64l1.91 3.3c.13.22.4.31.61.22l2.38-.96c.51.41 1.06.72 1.63.94l.36 2.53c.03.24.25.41.49.41h4c.24 0 .46-.17.49-.41l.36-2.53c.58-.23 1.12-.53 1.63-.94l2.38.96c.21.09.48 0 .61-.22l1.91-3.3a.5.5 0 0 0-.12-.64L20.2 12.94Z" stroke="currentColor" strokeWidth="1.6"/>
          </svg>
        </button>
      </div>

      {task && isRunning && (
        <p className="current-task">
          {isBreak ? "🛋️ Break time!" : `⏳ Working on: ${task}`}
        </p>
      )}

      {completedTasks.length > 0 && (
        <div className="task-history">
          <div className="task-history-header">
            <h3>Completed Tasks</h3>
            <button className="btn btn-muted btn-clear" onClick={handleClearCompleted} aria-label="Clear completed tasks">
              Clear Tasks
            </button>
          </div>
          <ul>
            {completedTasks.map((t, idx) => (
              <li key={idx} className="completed">{t}</li>
            ))}
          </ul>
        </div>
      )}

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onSave={handleSaveSettings}
        onVolumePreview={(pct) => {
          if (isMuted) return;
          const vol = Math.max(0, Math.min(1, Number(pct) / 100));
          if (!focusRingRef.current) return;
          // Stop any previous preview
          if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
          if (previewFadeIntervalRef.current) clearInterval(previewFadeIntervalRef.current);
          try {
            focusRingRef.current.currentTime = 0;
            focusRingRef.current.volume = vol;
            focusRingRef.current.play();
          } catch {}
          const durationMs = 3000;
          const steps = 10;
          const stepMs = durationMs / steps;
          let currentStep = 0;
          previewFadeIntervalRef.current = setInterval(() => {
            currentStep += 1;
            const remaining = Math.max(0, steps - currentStep);
            const nextVol = (vol * remaining) / steps;
            if (focusRingRef.current) focusRingRef.current.volume = nextVol;
            if (currentStep >= steps) {
              clearInterval(previewFadeIntervalRef.current);
            }
          }, stepMs);
          previewTimeoutRef.current = setTimeout(() => {
            try { if (focusRingRef.current) focusRingRef.current.pause(); } catch {}
            if (focusRingRef.current) focusRingRef.current.volume = masterVolume;
          }, durationMs + 50);
        }}
        defaultMinutes={defaultMinutes}
        defaultSeconds={defaultSeconds}
        shortBreakMinutes={shortBreakMinutes}
        shortBreakSeconds={shortBreakSeconds}
        longBreakMinutes={longBreakMinutes}
        longBreakSeconds={longBreakSeconds}
        soundsEnabled={soundsEnabled}
        masterVolumePct={masterVolumePct}
        autoStartNext={autoStartNext}
        cyclesBeforeLong={cyclesBeforeLong}
      />

      {showPopup && (
        <CompletionPopup
          message={popupMessage}
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
