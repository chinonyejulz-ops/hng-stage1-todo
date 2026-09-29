import { useEffect, useMemo, useState } from 'react';
import {
  ArrowUpRight, Check, CheckCheck, ChevronDown, Circle, ClipboardList,
  Clock3, FileText, LayoutDashboard, ListTodo, MoreHorizontal, Plus,
  Search, Sparkles, StickyNote, Trash2, X,
} from 'lucide-react';

const starterTasks = [
  { id: 'task-1', title: 'Plan the week ahead', priority: 'High', completed: false, createdAt: Date.now() - 300000 },
  { id: 'task-2', title: 'Review project notes', priority: 'Medium', completed: false, createdAt: Date.now() - 200000 },
  { id: 'task-3', title: 'Take a proper lunch break', priority: 'Low', completed: true, createdAt: Date.now() - 100000 },
];

const starterNotes = [
  { id: 'note-1', title: 'A little reminder', body: 'Make room for the work that matters, and take things one step at a time.', updatedAt: Date.now() - 500000 },
];

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
}

function App() {
  const [tasks, setTasks] = useState(() => readStorage('daymark-tasks', starterTasks));
  const [notes, setNotes] = useState(() => readStorage('daymark-notes', starterNotes));
  const [filter, setFilter] = useState('All');
  const [activeView, setActiveView] = useState('Tasks');
  const [query, setQuery] = useState('');
  const [taskInput, setTaskInput] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [editingTask, setEditingTask] = useState(null);
  const [noteEditor, setNoteEditor] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);

  useEffect(() => localStorage.setItem('daymark-tasks', JSON.stringify(tasks)), [tasks]);
  useEffect(() => localStorage.setItem('daymark-notes', JSON.stringify(notes)), [notes]);

  const pendingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - pendingCount;
  const visibleTasks = useMemo(() => tasks
    .filter((task) => filter === 'All' || (filter === 'Pending' ? !task.completed : task.completed))
    .filter((task) => task.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => Number(a.completed) - Number(b.completed) || b.createdAt - a.createdAt), [tasks, filter, query]);

  function addTask(event) {
    event.preventDefault();
    const title = taskInput.trim();
    if (!title) return;
    if (editingTask) {
      setTasks((current) => current.map((task) => task.id === editingTask ? { ...task, title, priority } : task));
      setEditingTask(null);
    } else {
      setTasks((current) => [{ id: crypto.randomUUID(), title, priority, completed: false, createdAt: Date.now() }, ...current]);
    }
    setTaskInput('');
    setPriority('Medium');
  }

  function startEdit(task) {
    setEditingTask(task.id);
    setTaskInput(task.title);
    setPriority(task.priority);
    document.querySelector('#task-input')?.focus();
  }

  function saveNote(event) {
    event.preventDefault();
    const title = noteEditor.title.trim();
    const body = noteEditor.body.trim();
    if (!title && !body) { setNoteEditor(null); return; }
    if (noteEditor.id) {
      setNotes((current) => current.map((note) => note.id === noteEditor.id ? { ...note, title: title || 'Untitled note', body, updatedAt: Date.now() } : note));
    } else {
      setNotes((current) => [{ ...noteEditor, id: crypto.randomUUID(), title: title || 'Untitled note', body, updatedAt: Date.now() }, ...current]);
    }
    setNoteEditor(null);
  }

  const greeting = new Intl.DateTimeFormat('en', { weekday: 'long', month: 'long', day: 'numeric' }).format(new Date());

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="#home" onClick={() => setActiveView('Tasks')}>
          <span className="brand-mark"><CheckCheck size={20} strokeWidth={2.4} /></span>
          <span>daymark<span className="brand-period">.</span></span>
        </a>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="side-nav" aria-label="Main navigation">
          <button className={activeView === 'Tasks' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView('Tasks')}>
            <LayoutDashboard size={18} /> <span>My tasks</span><span className="nav-count">{pendingCount}</span>
          </button>
          <button className={activeView === 'Notes' ? 'nav-link active' : 'nav-link'} onClick={() => setActiveView('Notes')}>
            <StickyNote size={18} /> <span>My notes</span><span className="nav-count">{notes.length}</span>
          </button>
        </nav>
        <div className="sidebar-label list-label">YOUR DAY</div>
        <div className="day-card">
          <div className="day-card-top"><span className="day-dot" /> Today</div>
          <p>{pendingCount === 0 ? 'Nothing pending. Enjoy the space.' : `${pendingCount} ${pendingCount === 1 ? 'thing' : 'things'} to focus on`}</p>
          <div className="day-progress"><span style={{ width: `${tasks.length ? (completedCount / tasks.length) * 100 : 0}%` }} /></div>
          <small>{completedCount} of {tasks.length} completed</small>
        </div>
        <div className="sidebar-bottom"><div className="avatar">Y</div><div className="profile-copy"><strong>Your workspace</strong><span>Personal planner</span></div><MoreHorizontal size={18} className="profile-more" /></div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div className="breadcrumb"><span>Workspace</span><span className="crumb-slash">/</span><strong>{activeView}</strong></div>
          <div className="topbar-right"><span className="today-date"><Clock3 size={15} /> {greeting}</span><span className="top-avatar">Y</span></div>
        </header>

        <div className="content-wrap">
          <section className="welcome-row">
            <div><div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL SPACE</div><h1>{activeView === 'Tasks' ? 'Make today count.' : 'Thoughts, saved.'}</h1><p className="welcome-subtitle">{activeView === 'Tasks' ? 'A little progress each day adds up to big results.' : 'Keep the ideas and reminders you want to come back to.'}</p></div>
            <div className="date-badge"><span>{new Date().toLocaleDateString('en', { month: 'short' }).toUpperCase()}</span><strong>{new Date().getDate()}</strong></div>
          </section>

          {activeView === 'Tasks' ? <>
            <section className="stats-row" aria-label="Task summary">
              <div className="stat-card"><div className="stat-icon purple"><ListTodo size={18} /></div><div><span>All tasks</span><strong>{tasks.length}</strong></div><span className="stat-caption">in your list</span></div>
              <div className="stat-card"><div className="stat-icon amber"><Circle size={18} /></div><div><span>To do</span><strong>{pendingCount}</strong></div><span className="stat-caption">left to focus on</span></div>
              <div className="stat-card"><div className="stat-icon green"><Check size={18} /></div><div><span>Completed</span><strong>{completedCount}</strong></div><span className="stat-caption">nicely done</span></div>
            </section>

            <section className="tasks-panel">
              <div className="panel-heading"><div><h2>My tasks <span className="heading-count">{tasks.length}</span></h2><p>Keep your next steps close.</p></div><div className="search-box"><Search size={16} /><input aria-label="Search tasks" placeholder="Search tasks" value={query} onChange={(event) => setQuery(event.target.value)} /></div></div>
              <form className="task-form" onSubmit={addTask}>
                <div className="input-wrap"><Plus size={19} /><input id="task-input" placeholder="What needs to get done?" value={taskInput} onChange={(event) => setTaskInput(event.target.value)} aria-label="Task title" /><label className="priority-select"><span className={`priority-dot ${priority.toLowerCase()}`} /><select aria-label="Task priority" value={priority} onChange={(event) => setPriority(event.target.value)}><option>Low</option><option>Medium</option><option>High</option></select><ChevronDown size={14} /></label></div>
                <button className="add-button" type="submit">{editingTask ? 'Save task' : 'Add task'} <ArrowUpRight size={16} /></button>
                {editingTask && <button className="cancel-edit" type="button" aria-label="Cancel editing" onClick={() => { setEditingTask(null); setTaskInput(''); setPriority('Medium'); }}><X size={17} /></button>}
              </form>
              <div className="filter-row"><div className="filter-tabs">{['All', 'Pending', 'Completed'].map((item) => <button key={item} onClick={() => setFilter(item)} className={filter === item ? 'filter-tab selected' : 'filter-tab'}>{item}<span>{item === 'All' ? tasks.length : item === 'Pending' ? pendingCount : completedCount}</span></button>)}</div><span className="sort-label">Recently added <ChevronDown size={14} /></span></div>
              <div className="task-list">
                {visibleTasks.map((task) => <article className={`task-row ${task.completed ? 'is-complete' : ''}`} key={task.id}>
                  <button className={`check-button ${task.completed ? 'checked' : ''}`} aria-label={task.completed ? `Mark ${task.title} pending` : `Complete ${task.title}`} onClick={() => setTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))}>{task.completed && <Check size={14} strokeWidth={3} />}</button>
                  <div className="task-copy"><span className="task-title">{task.title}</span><span className="task-meta">Added {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(task.createdAt)}</span></div>
                  <span className={`priority-pill ${task.priority.toLowerCase()}`}><span className={`priority-dot ${task.priority.toLowerCase()}`} />{task.priority}</span>
                  <div className="task-actions"><button aria-label={`Edit ${task.title}`} onClick={() => startEdit(task)}><FileText size={16} /></button><button aria-label={`Delete ${task.title}`} onClick={() => setTasks((current) => current.filter((item) => item.id !== task.id))}><Trash2 size={16} /></button></div>
                </article>)}
                {visibleTasks.length === 0 && <div className="empty-state"><div className="empty-icon"><ClipboardList size={22} /></div><strong>{query ? 'No matching tasks' : filter === 'Completed' ? 'No completed tasks yet' : 'Your list is clear'}</strong><span>{query ? 'Try another search term.' : 'Add a task above and give your day some direction.'}</span></div>}
              </div>
              <div className="list-footer"><span><span className="footer-dot" /> Your progress is saved automatically</span><span>{pendingCount} {pendingCount === 1 ? 'task' : 'tasks'} remaining</span></div>
            </section>
          </> : <section className="notes-panel">
            <div className="panel-heading"><div><h2>My notes <span className="heading-count">{notes.length}</span></h2><p>A safe spot for the things on your mind.</p></div><button className="add-button note-add" onClick={() => setNoteEditor({ title: '', body: '' })}><Plus size={17} /> New note</button></div>
            {notes.length ? <div className="notes-grid">{notes.map((note, index) => <article className={`note-card note-color-${index % 4}`} key={note.id}><div className="note-card-top"><span className="note-icon"><StickyNote size={17} /></span><button aria-label={`More options for ${note.title}`} className="note-menu-trigger" onClick={() => setMenuOpen(menuOpen === note.id ? null : note.id)}><MoreHorizontal size={19} /></button>{menuOpen === note.id && <div className="note-menu"><button onClick={() => { setNoteEditor(note); setMenuOpen(null); }}>Edit note</button><button className="delete-option" onClick={() => { setNotes((current) => current.filter((item) => item.id !== note.id)); setMenuOpen(null); }}>Delete note</button></div>}</div><button className="note-content" onClick={() => setNoteEditor(note)}><strong>{note.title || 'Untitled note'}</strong><span>{note.body || 'No additional details.'}</span></button><div className="note-footer"><span>Updated {new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric' }).format(note.updatedAt)}</span><button onClick={() => setNoteEditor(note)}>Open note <ArrowUpRight size={14} /></button></div></article>)}</div> : <div className="empty-state notes-empty"><div className="empty-icon"><StickyNote size={22} /></div><strong>No notes yet</strong><span>Save a thought or reminder to find it here later.</span><button className="add-button" onClick={() => setNoteEditor({ title: '', body: '' })}><Plus size={16} /> Write your first note</button></div>}
            <div className="list-footer"><span><span className="footer-dot" /> Notes are saved automatically</span><span>{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span></div>
          </section>}

          <footer className="page-footer"><span>Made for a more mindful day <span className="footer-heart">✳</span></span><span>Take it one step at a time.</span></footer>
        </div>
      </main>

      {noteEditor && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setNoteEditor(null); }}><form className="note-modal" onSubmit={saveNote} aria-label="Note editor"><div className="modal-head"><span className="note-icon"><StickyNote size={18} /></span><button type="button" className="modal-close" aria-label="Close note editor" onClick={() => setNoteEditor(null)}><X size={19} /></button></div><label htmlFor="note-title">Note title</label><input id="note-title" className="note-title-input" placeholder="Give this note a title" value={noteEditor.title} onChange={(event) => setNoteEditor({ ...noteEditor, title: event.target.value })} /><label htmlFor="note-body">Your note</label><textarea id="note-body" placeholder="Write down a thought, a reminder, or an idea..." value={noteEditor.body} onChange={(event) => setNoteEditor({ ...noteEditor, body: event.target.value })} rows={6} /><div className="modal-actions"><button type="button" className="modal-cancel" onClick={() => setNoteEditor(null)}>Cancel</button><button type="submit" className="add-button">Save note</button></div></form></div>}
    </div>
  );
}

export default App;
