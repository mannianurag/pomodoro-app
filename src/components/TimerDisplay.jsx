export default function TimerDisplay({ minutes, seconds, label }) {
  return (
    <div className="time-display">
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
      <div className="state-label">{label}</div>
    </div>
  )
}


