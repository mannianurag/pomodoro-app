import { useState, useEffect } from "react";
import SettingsModal from "./components/SettingsModal";
import CompletionPopup from "./components/CompletionPopup";
import confetti from "canvas-confetti";
import "./styles/App.css";

export default function App() {
  // Helper to pick a random element from an array
  const getRandomText = (arr) => arr[Math.floor(Math.random() * arr.length)];

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

  const modeLabels = {
    focus: ["F O C U S"],
  };

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
  

  // State variables
  const [task, setTask] = useState("");
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [defaultMinutes, setDefaultMinutes] = useState(
    () => Number(localStorage.getItem("defaultMinutes")) || 25
  );
  const [defaultSeconds, setDefaultSeconds] = useState(
    () => Number(localStorage.getItem("defaultSeconds")) || 0
  );
  const [shortBreakMinutes, setShortBreakMinutes] = useState(
    () => Number(localStorage.getItem("shortBreakMinutes")) || 5
  );
  const [shortBreakSeconds, setShortBreakSeconds] = useState(
    () => Number(localStorage.getItem("shortBreakSeconds")) || 0
  );
  const [longBreakMinutes, setLongBreakMinutes] = useState(
    () => Number(localStorage.getItem("longBreakMinutes")) || 15
  );
  const [longBreakSeconds, setLongBreakSeconds] = useState(
    () => Number(localStorage.getItem("longBreakSeconds")) || 0
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

  // On mount or when defaults change, set timer to default work time
  useEffect(() => {
    setMinutes(defaultMinutes);
    setSeconds(defaultSeconds);
  }, [defaultMinutes, defaultSeconds]);

  // Timer effect
  useEffect(() => {
    let timer;
    if (isRunning) {
      timer = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          clearInterval(timer);
          setIsRunning(false);
          handleCompletion();
        }
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, minutes, seconds]);

  const handleStart = () => {
    if (!task.trim() && !isBreak) {
      const nextSessionNumber = pomodoroCount + 1;
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
    newLongSec
  ) => {
    setDefaultMinutes(newWorkMin);
    setDefaultSeconds(newWorkSec);
    setShortBreakMinutes(newShortMin);
    setShortBreakSeconds(newShortSec);
    setLongBreakMinutes(newLongMin);
    setLongBreakSeconds(newLongSec);

    localStorage.setItem("defaultMinutes", newWorkMin);
    localStorage.setItem("defaultSeconds", newWorkSec);
    localStorage.setItem("shortBreakMinutes", newShortMin);
    localStorage.setItem("shortBreakSeconds", newShortSec);
    localStorage.setItem("longBreakMinutes", newLongMin);
    localStorage.setItem("longBreakSeconds", newLongSec);

    setMinutes(newWorkMin);
    setSeconds(newWorkSec);
  };

  const handleCompletion = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
    setShowPopup(true);

    if (!isBreak) {
      setLastCompletedType("focus");
      const updatedTasks = [...completedTasks, task];
      setCompletedTasks(updatedTasks);
      localStorage.setItem("completedTasks", JSON.stringify(updatedTasks));

      const newCount = pomodoroCount + 1;
      setPomodoroCount(newCount);

      if (newCount % 3 === 0) {
        startBreak(longBreakMinutes, longBreakSeconds, "long");
      } else {
        startBreak(shortBreakMinutes, shortBreakSeconds, "short");
      }
    } else {
      setLastCompletedType("break");
      setIsBreak(false);
      setMinutes(defaultMinutes);
      setSeconds(defaultSeconds);
      setTask("");
    }
  };

  const startBreak = (breakMinutes, breakSeconds, type) => {
    setIsBreak(true);
    setBreakType(type);
    setMinutes(breakMinutes);
    setSeconds(breakSeconds);
    setTask(`Break (${String(breakMinutes).padStart(2, "0")}:${String(breakSeconds).padStart(2, "0")})`);
  };

  return (
    <div className={`app-container ${isBreak ? "break-mode" : "task-mode"}`}>
      
      <h1 className="app-title">🍅 Pomodoro</h1>

      <div className="time-display">
        {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        
        <div className="state-label">
          {isBreak
            ? getRandomText(breakStateLabels[breakType])
            : getRandomText(modeLabels.focus)}
        </div>
      </div>

      <input
        className="task-input"
        type="text"
        placeholder={getRandomText(taskInputPlaceholders)}
        value={task}
        onChange={(e) => setTask(e.target.value)}
        disabled={isBreak}
      />

      <div className="controls">
        {!isRunning ? (
          <button className="btn btn-primary" onClick={handleStart}>
            {getRandomText(startButtonLabels)}
          </button>
        ) : (
          <button className="btn btn-primary" onClick={() => setIsRunning(false)}>
            {getRandomText(pauseButtonLabels)}
          </button>
        )}
        {isBreak ? (
          <button className="btn btn-muted" onClick={handleSkipBreak}>
            {getRandomText(skipButtonLabels)}
          </button>
        ) : (
          <button className="btn btn-muted" onClick={handleReset}>
            {getRandomText(resetButtonLabels)}
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
        defaultMinutes={defaultMinutes}
        defaultSeconds={defaultSeconds}
        shortBreakMinutes={shortBreakMinutes}
        shortBreakSeconds={shortBreakSeconds}
        longBreakMinutes={longBreakMinutes}
        longBreakSeconds={longBreakSeconds}
      />

      {showPopup && (
        <CompletionPopup
          message={
            lastCompletedType === "focus"
              ? getRandomText(completionMessages.focus)
              : getRandomText(completionMessages.break)
          }
          onClose={() => setShowPopup(false)}
        />
      )}
    </div>
  );
}
