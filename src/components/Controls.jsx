export default function Controls({
  isRunning,
  onStart,
  onPause,
  onRestart,
  onSkip,
  startLabel,
  pauseLabel,
}) {
  return (
    <div className="controls">
      <button className="btn btn-muted settings-btn" onClick={onRestart} aria-label="Restart session" title="Restart">
        <svg className="w-[37px] h-[37px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.651 7.65a7.131 7.131 0 0 0-12.68 3.15M18.001 4v4h-4m-7.652 8.35a7.13 7.13 0 0 0 12.68-3.15M6 20v-4h4"/>
        </svg>
      </button>

      {!isRunning ? (
        <button className="btn btn-primary" onClick={onStart}>{startLabel}</button>
      ) : (
        <button className="btn btn-primary" onClick={onPause}>{pauseLabel}</button>
      )}

      <button className="btn btn-muted settings-btn" onClick={onSkip} aria-label="Skip session" title="Skip">
        <svg className="w-[37px] h-[37px] text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 6v12M8 6v12l8-6-8-6Z"/>
        </svg>

      </button>
    </div>
  )
}


