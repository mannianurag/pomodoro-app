export default function TaskHistory({ tasks, onClear }) {
  if (!tasks || tasks.length === 0) return null
  return (
    <div className="task-history">
      <div className="task-history-header">
        <h3>Completed Tasks</h3>
        <button className="btn btn-muted btn-clear" onClick={onClear} aria-label="Clear completed tasks">Clear Tasks</button>
      </div>
      <ul>
        {tasks.map((t, idx) => (
          <li key={idx} className="completed">{t}</li>
        ))}
      </ul>
    </div>
  )
}


