export default function TaskHistory({ tasks = [], onClear }) {
  return (
    <div className="task-history">
      <div className="task-history-header">
        <h3>Completed Tasks</h3>
        {tasks.length > 0 && (
          <button className="btn btn-muted btn-clear" onClick={onClear} aria-label="Clear completed tasks">Clear Tasks</button>
        )}
      </div>
      <ul>
        {tasks.length === 0 ? (
          <li style={{ opacity: 0.6, listStyle: 'none' }}>No completed tasks yet</li>
        ) : (
          tasks.map((t, idx) => (
            <li key={idx} className="completed">{t}</li>
          ))
        )}
      </ul>
    </div>
  )
}


