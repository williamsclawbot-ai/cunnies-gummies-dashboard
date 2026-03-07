import React, { useState, useEffect } from 'react';

const STORAGE_KEY = 'johnos-kanban-tasks';

const DEFAULT_COLUMNS = {
  backlog: { title: 'Backlog', color: '#6b7280' },
  todo: { title: 'To Do', color: '#f59e0b' },
  'in-progress': { title: 'In Progress', color: '#667eea' },
  done: { title: 'Done', color: '#22c55e' },
};

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* ignore */ }
  return {
    backlog: [
      { id: '1', text: 'Research competitor pricing', created: Date.now() },
      { id: '2', text: 'Design logo variations', created: Date.now() },
    ],
    todo: [
      { id: '3', text: 'Set up email marketing flow', created: Date.now() },
    ],
    'in-progress': [
      { id: '4', text: 'Build landing page', created: Date.now() },
    ],
    done: [
      { id: '5', text: 'Register domain name', created: Date.now() },
    ],
  };
}

export default function KanbanPage() {
  const [tasks, setTasks] = useState(loadTasks);
  const [newTaskText, setNewTaskText] = useState('');
  const [addingTo, setAddingTo] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const addTask = (columnId) => {
    if (!newTaskText.trim()) return;
    const task = { id: Date.now().toString(), text: newTaskText.trim(), created: Date.now() };
    setTasks(prev => ({
      ...prev,
      [columnId]: [...prev[columnId], task],
    }));
    setNewTaskText('');
    setAddingTo(null);
  };

  const deleteTask = (columnId, taskId) => {
    setTasks(prev => ({
      ...prev,
      [columnId]: prev[columnId].filter(t => t.id !== taskId),
    }));
  };

  const moveTask = (fromCol, taskId, toCol) => {
    if (fromCol === toCol) return;
    const task = tasks[fromCol].find(t => t.id === taskId);
    if (!task) return;
    setTasks(prev => ({
      ...prev,
      [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
      [toCol]: [...prev[toCol], task],
    }));
  };

  const handleDragStart = (columnId, taskId) => {
    setDragItem({ columnId, taskId });
  };

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverCol(columnId);
  };

  const handleDrop = (e, toCol) => {
    e.preventDefault();
    if (dragItem) {
      moveTask(dragItem.columnId, dragItem.taskId, toCol);
    }
    setDragItem(null);
    setDragOverCol(null);
  };

  const handleDragEnd = () => {
    setDragItem(null);
    setDragOverCol(null);
  };

  const columnIds = Object.keys(DEFAULT_COLUMNS);

  return (
    <div className="kanban-page">
      <div className="kanban-header">
        <h2>Tasks</h2>
        <p className="kanban-subtitle">Drag and drop to organize your work</p>
      </div>

      <div className="kanban-board">
        {columnIds.map(colId => {
          const col = DEFAULT_COLUMNS[colId];
          const colTasks = tasks[colId] || [];
          const isOver = dragOverCol === colId;

          return (
            <div
              key={colId}
              className={`kanban-column ${isOver ? 'kanban-column-dragover' : ''}`}
              onDragOver={(e) => handleDragOver(e, colId)}
              onDrop={(e) => handleDrop(e, colId)}
              onDragLeave={() => setDragOverCol(null)}
            >
              <div className="kanban-column-header">
                <span className="kanban-column-dot" style={{ background: col.color }} />
                <span className="kanban-column-title">{col.title}</span>
                <span className="kanban-column-count">{colTasks.length}</span>
              </div>

              <div className="kanban-task-list">
                {colTasks.map(task => (
                  <div
                    key={task.id}
                    className="kanban-task-card"
                    draggable
                    onDragStart={() => handleDragStart(colId, task.id)}
                    onDragEnd={handleDragEnd}
                  >
                    <span className="kanban-task-text">{task.text}</span>
                    <div className="kanban-task-actions">
                      {colId !== 'done' && (
                        <button
                          className="kanban-move-btn"
                          title={`Move to ${DEFAULT_COLUMNS[columnIds[columnIds.indexOf(colId) + 1]]?.title || 'next'}`}
                          onClick={() => {
                            const nextIdx = columnIds.indexOf(colId) + 1;
                            if (nextIdx < columnIds.length) {
                              moveTask(colId, task.id, columnIds[nextIdx]);
                            }
                          }}
                        >
                          &rarr;
                        </button>
                      )}
                      <button
                        className="kanban-delete-btn"
                        onClick={() => deleteTask(colId, task.id)}
                        title="Delete task"
                      >
                        &times;
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {addingTo === colId ? (
                <div className="kanban-add-form">
                  <input
                    className="kanban-add-input"
                    type="text"
                    placeholder="Task description..."
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') addTask(colId); if (e.key === 'Escape') { setAddingTo(null); setNewTaskText(''); } }}
                    autoFocus
                  />
                  <div className="kanban-add-actions">
                    <button className="kanban-save-btn" onClick={() => addTask(colId)}>Add</button>
                    <button className="kanban-cancel-btn" onClick={() => { setAddingTo(null); setNewTaskText(''); }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <button className="kanban-add-btn" onClick={() => { setAddingTo(colId); setNewTaskText(''); }}>
                  + Add task
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
