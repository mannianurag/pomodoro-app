import { useState, useEffect, useRef } from "react";
import SettingsModal from "./components/SettingsModal";
import CompletionPopup from "./components/CompletionPopup";
import TimerDisplay from "./components/TimerDisplay";
import Controls from "./components/Controls";
import TaskHistory from "./components/TaskHistory";
import Footer from "./components/Footer";
import confetti from "canvas-confetti";
import "./styles/App.css";
import tickSfx from "./sounds/each-tick.mp3";
import focusRingSfx from "./sounds/focus-complete-ring.mp3";
import breakRingSfx from "./sounds/break-complete-ring.mp3";
import { readNumber, readBool, writeJSON } from "./utils/storage";
import {
  TASK_INPUT_PLACEHOLDERS,
  START_BUTTON_LABELS,
  PAUSE_BUTTON_LABELS,
  RESET_BUTTON_LABELS,
  SKIP_BUTTON_LABELS,
  BREAK_STATE_LABELS,
  MODE_LABELS,
  COMPLETION_MESSAGES,
  MOBILE_MESSAGES,
  pickRandom,
} from "./utils/texts";

export default function App() {
  // Helper to pick random once per mount
  const getRandomText = pickRandom;
  // Note: all text collections are defined once near the top of the component
  const tickAudioRef = useRef(null);
  const focusRingRef = useRef(null);
  const breakRingRef = useRef(null);
  const previewFadeIntervalRef = useRef(null);
  const previewTimeoutRef = useRef(null);
  const autoStartTimeoutRef = useRef(null);
  const autoStartIntervalRef = useRef(null);
  // Stable UI strings for this session (do not change each re-render)
  const placeholderRef = useRef(getRandomText(TASK_INPUT_PLACEHOLDERS));
  const startLabelRef = useRef(getRandomText(START_BUTTON_LABELS));
  const pauseLabelRef = useRef(getRandomText(PAUSE_BUTTON_LABELS));
  const resetLabelRef = useRef(getRandomText(RESET_BUTTON_LABELS));
  const skipLabelRef = useRef(getRandomText(SKIP_BUTTON_LABELS));
  const focusLabelRef = useRef(getRandomText(MODE_LABELS.focus));
  const shortBreakLabelRef = useRef(getRandomText(BREAK_STATE_LABELS.short));
  const longBreakLabelRef = useRef(getRandomText(BREAK_STATE_LABELS.long));

  // Robust LS number reader that doesn't treat 0 as falsy
  const readNumberFromLocalStorage = readNumber;
  

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
  const [nextStartCountdown, setNextStartCountdown] = useState(null); // number | null
  const [nextStartTarget, setNextStartTarget] = useState(null); // 'break' | 'focus' | null
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
  const [isMobileBlocked, setIsMobileBlocked] = useState(false);
  const [mobileMessage, setMobileMessage] = useState("");

  // On mount or when defaults change, set timer to default work time
  useEffect(() => {
    setMinutes(defaultMinutes);
    setSeconds(defaultSeconds);
  }, [defaultMinutes, defaultSeconds]);

  // Initialize audio on mount
  useEffect(() => {
    // Detect mobile (UA or small viewport) and show block message
    const detectAndSetMobile = () => {
      let isMobile = false;
      try {
        const ua = navigator.userAgent || navigator.vendor || window.opera;
        const uaMobile = /android|iphone|ipad|ipod|iemobile|blackberry|opera mini/i.test(String(ua).toLowerCase());
        const smallViewport = window.innerWidth <= 640; // treat narrow screens as mobile in devtools
        isMobile = uaMobile || smallViewport;
      } catch {
        isMobile = window.innerWidth <= 640;
      }
      setIsMobileBlocked(isMobile);
      if (isMobile && !mobileMessage) {
        setMobileMessage(getRandomText(MOBILE_MESSAGES));
      }
      if (!isMobile) {
        setNextStartCountdown(null);
      }
    };

    detectAndSetMobile();
    window.addEventListener('resize', detectAndSetMobile);

    tickAudioRef.current = new Audio(tickSfx);
    focusRingRef.current = new Audio(focusRingSfx);
    breakRingRef.current = new Audio(breakRingSfx);
    if (tickAudioRef.current) tickAudioRef.current.volume = masterVolume;
    if (focusRingRef.current) focusRingRef.current.volume = masterVolume;
    if (breakRingRef.current) breakRingRef.current.volume = masterVolume;
    return () => {
      window.removeEventListener('resize', detectAndSetMobile);
    };
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

  // Clear countdown when timer starts
  useEffect(() => {
    if (isRunning && autoStartIntervalRef.current) {
      clearInterval(autoStartIntervalRef.current);
      autoStartIntervalRef.current = null;
    }
    if (isRunning && autoStartTimeoutRef.current) {
      clearTimeout(autoStartTimeoutRef.current);
      autoStartTimeoutRef.current = null;
    }
    if (isRunning) {
      setNextStartCountdown(null);
      setNextStartTarget(null);
    }
  }, [isRunning]);

  const beginAutoStart = (target) => {
    // Clear existing
    if (autoStartIntervalRef.current) clearInterval(autoStartIntervalRef.current);
    if (autoStartTimeoutRef.current) clearTimeout(autoStartTimeoutRef.current);
    setNextStartTarget(target);
    setNextStartCountdown(3);
    autoStartIntervalRef.current = setInterval(() => {
      setNextStartCountdown((prev) => {
        if (prev === null) return null;
        const next = prev - 1;
        if (next <= 0) {
          clearInterval(autoStartIntervalRef.current);
          autoStartIntervalRef.current = null;
        }
        return next;
      });
    }, 1000);
    autoStartTimeoutRef.current = setTimeout(() => {
      setIsRunning(true);
      setNextStartCountdown(null);
      setNextStartTarget(null);
    }, 3000);
  };

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
    writeJSON("completedTasks", []);
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
        setPopupMessage(getRandomText(COMPLETION_MESSAGES.focus));
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
        beginAutoStart('focus');
      } else {
        setPopupMessage(getRandomText(COMPLETION_MESSAGES.break));
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
      beginAutoStart('break');
    }
  };

  if (isMobileBlocked) {
    return (
      <div className={`app-container ${isBreak ? "break-mode" : "task-mode"}`}>
        <h1 className="app-title">🍅 Pomodoras</h1>
        <div className="mobile-block">{mobileMessage}</div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isBreak ? "break-mode" : "task-mode"}`}>
      
      <h1 className="app-title">🍅 Pomodoras</h1>

      <TimerDisplay
        minutes={minutes}
        seconds={seconds}
        label={isBreak ? (breakType === "long" ? longBreakLabelRef.current : shortBreakLabelRef.current) : focusLabelRef.current}
      />

      {nextStartCountdown !== null && (
        <div className="autostart-hint">
          {nextStartTarget === 'break' ? 'Starting break in ' : 'Starting focus in '}
          {nextStartCountdown} sec
        </div>
      )}

      <input
        className="task-input"
        type="text"
        placeholder={placeholderRef.current}
        value={task}
        onChange={(e) => setTask(e.target.value)}
        disabled={isBreak}
      />

      <Controls
        isRunning={isRunning}
        onStart={handleStart}
        onPause={() => setIsRunning(false)}
        onRestart={handleReset}
        onSkip={() => {
          if (isBreak) {
            // skip break -> return to focus (do not auto-start when autoStartNext is off)
            setIsBreak(false);
            setMinutes(defaultMinutes);
            setSeconds(defaultSeconds);
            setTask("");
            if (autoStartNext) setTimeout(() => setIsRunning(true), 0);
          } else {
            // skip focus -> treat as completion to transition into break
            if (!autoStartNext) {
              const prevAutoStart = autoStartNext;
              // Temporarily disable autoStart for this one transition
              setShowPopup(false);
              const prevSet = setAutoStartNext;
              handleCompletion();
              // After completion, ensure we are not auto-starting break
              setIsRunning(false);
              // restore autoStartNext (no change actually needed as we didn't persist toggle)
              setAutoStartNext(prevAutoStart);
            } else {
              handleCompletion();
            }
          }
        }}
        startLabel={startLabelRef.current}
        pauseLabel={pauseLabelRef.current}
      />

      {task && isRunning && (
        <p className="current-task">
          {isBreak ? "🛋️ Break time!" : `⏳ Working on: ${task}`}
        </p>
      )}

      <TaskHistory tasks={completedTasks} onClear={handleClearCompleted} />


      {/* mute svg = 
        <svg class="w-[37px] h-[37px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
          <path d="M5.707 4.293a1 1 0 0 0-1.414 1.414l14 14a1 1 0 0 0 1.414-1.414l-.004-.005C21.57 16.498 22 13.938 22 12a9.972 9.972 0 0 0-2.929-7.071 1 1 0 1 0-1.414 1.414A7.972 7.972 0 0 1 20 12c0 1.752-.403 3.636-1.712 4.873l-1.433-1.433C17.616 14.37 18 13.107 18 12c0-1.678-.69-3.197-1.8-4.285a1 1 0 1 0-1.4 1.428A3.985 3.985 0 0 1 16 12c0 .606-.195 1.335-.59 1.996L13 11.586V6.135c0-1.696-1.978-2.622-3.28-1.536L7.698 6.284l-1.99-1.991ZM4 8h.586L13 16.414v1.451c0 1.696-1.978 2.622-3.28 1.536L5.638 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/>
        </svg>
      */}

      {/* unmute svg = 
        <svg class="w-[37px] h-[37px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.5 8.43A4.985 4.985 0 0 1 19 12a4.984 4.984 0 0 1-1.43 3.5M14 6.135v11.73a1 1 0 0 1-1.64.768L8 15H6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l4.36-3.633a1 1 0 0 1 1.64.768Z"/>
        </svg>
      */}

      {/* Top-right actions */}
      <div className="top-right-actions">
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
          {isMuted ? (
            <svg className="w-[37px] h-[37px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5.707 4.293a1 1 0 0 0-1.414 1.414l14 14a1 1 0 0 0 1.414-1.414l-.004-.005C21.57 16.498 22 13.938 22 12a9.972 9.972 0 0 0-2.929-7.071 1 1 0 1 0-1.414 1.414A7.972 7.972 0 0 1 20 12c0 1.752-.403 3.636-1.712 4.873l-1.433-1.433C17.616 14.37 18 13.107 18 12c0-1.678-.69-3.197-1.8-4.285a1 1 0 1 0-1.4 1.428A3.985 3.985 0 0 1 16 12c0 .606-.195 1.335-.59 1.996L13 11.586V6.135c0-1.696-1.978-2.622-3.28-1.536L7.698 6.284l-1.99-1.991ZM4 8h.586L13 16.414v1.451c0 1.696-1.978 2.622-3.28 1.536L5.638 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2Z"/>
            </svg>
          ) : (
            <svg className="w-[37px] h-[37px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.5 8.43A4.985 4.985 0 0 1 19 12a4.984 4.984 0 0 1-1.43 3.5M14 6.135v11.73a1 1 0 0 1-1.64.768L8 15H6a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1h2l4.36-3.633a1 1 0 0 1 1.64.768Z"/>
            </svg>
          )}
        </button>
        <button
          className="btn btn-muted settings-btn"
          onClick={() => setIsSettingsOpen(true)}
          aria-label="Settings"
          title="Settings"
        >
          <svg class="w-[37px] h-[37px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="M20 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6h-2m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4m16 6H10m0 0a2 2 0 1 0-4 0m4 0a2 2 0 1 1-4 0m0 0H4"/>
          </svg>

        </button>
      </div>

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

      <Footer />
    </div>
  );
}
