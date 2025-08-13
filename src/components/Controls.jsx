export default function Controls({
  isRunning,
  onStart,
  onPause,
  onReset,
  onSkip,
  onOpenSettings,
  onToggleMute,
  muted,
  startLabel,
  pauseLabel,
  resetLabel,
  skipLabel,
}) {
  return (
    <div className="controls">
      <button
        className={`btn btn-muted settings-btn`}
        onClick={onToggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        title={muted ? "Unmute" : "Mute"}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M4 9v6h3l5 4V5L7 9H4Z" stroke="currentColor" strokeWidth="1.6"/>
          {muted ? (
            <path d="M16 9l5 5m0-5l-5 5" stroke="currentColor" strokeWidth="1.6"/>
          ) : (
            <path d="M16.5 8.5a5 5 0 010 7m2.5-9a8 8 0 010 11" stroke="currentColor" strokeWidth="1.6"/>
          )}
        </svg>
      </button>
      {!isRunning ? (
        <button className="btn btn-primary" onClick={onStart}>{startLabel}</button>
      ) : (
        <button className="btn btn-primary" onClick={onPause}>{pauseLabel}</button>
      )}
      <button className="btn btn-muted" onClick={onReset}>{resetLabel}</button>
      <button className="btn btn-muted" onClick={onSkip}>{skipLabel}</button>
      <button
        className="btn btn-muted settings-btn"
        onClick={onOpenSettings}
        aria-label="Settings"
        title="Settings"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" stroke="currentColor" strokeWidth="1.6"/>
          <path d="M20.2 12.94c.05-.3.08-.61.08-.94 0-.33-.03-.64-.08-.94l2.02-1.58a.5.5 0 0 0 .12-.64l-1.91-3.3a.5.5 0 0 0-.61-.22l-2.38.96a7.26 7.26 0 0 0-1.63-.94l-.36-2.53A.5.5 0 0 0 14 1h-4a.5.5 0 0 0-.49.41l-.36 2.53c-.58.23-1.12.53-1.63.94l-2.38-.96a.5.5 0 0 0-.61.22l-1.91 3.3a.5.5 0 0 0 .12.64L4.76 11c-.05.3-.08.61-.08.94 0 .33.03.64.08.94l-2.02 1.58a.5.5 0 0 0-.12.64l1.91 3.3c.13.22.4.31.61.22l2.38-.96c.51.41 1.06.72 1.63.94l.36 2.53c.03.24.25.41.49.41h4c.24 0 .46-.17.49-.41l.36-2.53c.58-.23 1.12-.53 1.63-.94l2.38.96c.21.09.48 0 .61-.22l1.91-3.3a.5.5 0 0 0-.12-.64L20.2 12.94Z" stroke="currentColor" strokeWidth="1.6"/>
        </svg>
      </button>
    </div>
  )
}


