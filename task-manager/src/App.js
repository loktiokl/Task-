import React, { useState, useEffect } from 'react';
import './App.css';

// Task Categories
const CATEGORIES = {
  WORK: { name: 'Work', color: '#3B82F6', icon: '💼' },
  PERSONAL: { name: 'Personal', color: '#10B981', icon: '🏠' },
  SHOPPING: { name: 'Shopping', color: '#F59E0B', icon: '🛒' },
  HEALTH: { name: 'Health', color: '#EF4444', icon: '🏥' },
  LEARNING: { name: 'Learning', color: '#8B5CF6', icon: '📚' }
};

// Priority Levels
const PRIORITIES = {
  LOW: { name: 'Low', color: '#6B7280', value: 1 },
  MEDIUM: { name: 'Medium', color: '#F59E0B', value: 2 },
  HIGH: { name: 'High', color: '#EF4444', value: 3 }
};

// Task Status
const STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    category: 'WORK',
    priority: 'MEDIUM',
    dueDate: '',
    status: STATUS.TODO
  });
  const [filter, setFilter] = useState({ category: 'ALL', status: 'ALL', priority: 'ALL' });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Load tasks from localStorage on component mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('taskManagerTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    localStorage.setItem('taskManagerTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Check for reminders
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      tasks.forEach(task => {
        if (task.dueDate && task.status !== STATUS.COMPLETED) {
          const dueDate = new Date(task.dueDate);
          const timeDiff = dueDate.getTime() - now.getTime();
          const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
          
          // Show reminder for tasks due within 24 hours
          if (daysDiff <= 1 && daysDiff >= 0) {
            if (Notification.permission === 'granted') {
              new Notification(`Task Reminder: ${task.title}`, {
                body: `Due ${daysDiff === 0 ? 'today' : 'tomorrow'}`,
                icon: '📅'
              });
            }
          }
        }
      });
    };

    // Request notification permission
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const interval = setInterval(checkReminders, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [tasks]);

  const addTask = () => {
    if (newTask.title.trim()) {
      const task = {
        id: Date.now(),
        ...newTask,
        createdAt: new Date().toISOString()
      };
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        category: 'WORK',
        priority: 'MEDIUM',
        dueDate: '',
        status: STATUS.TODO
      });
      setShowAddForm(false);
    }
  };

  const updateTask = (id, updates) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const toggleTaskStatus = (id) => {
    const task = tasks.find(t => t.id === id);
    let newStatus;
    if (task.status === STATUS.TODO) newStatus = STATUS.IN_PROGRESS;
    else if (task.status === STATUS.IN_PROGRESS) newStatus = STATUS.COMPLETED;
    else newStatus = STATUS.TODO;
    
    updateTask(id, { status: newStatus });
  };

  const filteredTasks = tasks.filter(task => {
    const matchesCategory = filter.category === 'ALL' || task.category === filter.category;
    const matchesStatus = filter.status === 'ALL' || task.status === filter.status;
    const matchesPriority = filter.priority === 'ALL' || task.priority === filter.priority;
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesStatus && matchesPriority && matchesSearch;
  });

  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === STATUS.COMPLETED).length;
    const inProgress = tasks.filter(t => t.status === STATUS.IN_PROGRESS).length;
    const todo = tasks.filter(t => t.status === STATUS.TODO).length;
    
    return { total, completed, inProgress, todo };
  };

  const stats = getTaskStats();

  const getStatusColor = (status) => {
    switch (status) {
      case STATUS.TODO: return '#6B7280';
      case STATUS.IN_PROGRESS: return '#F59E0B';
      case STATUS.COMPLETED: return '#10B981';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case STATUS.TODO: return '📝';
      case STATUS.IN_PROGRESS: return '⏳';
      case STATUS.COMPLETED: return '✅';
      default: return '📝';
    }
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
  };

  const isDueToday = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate).toDateString() === new Date().toDateString();
  };

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>Task Manager</h1>
          <p>Stay organized and productive</p>
        </div>
      </header>

      <div className="container">
        {/* Statistics Dashboard */}
        <div className="stats-dashboard">
          <div className="stat-card">
            <div className="stat-number">{stats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#6B7280' }}>{stats.todo}</div>
            <div className="stat-label">To Do</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#F59E0B' }}>{stats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
          <div className="stat-card">
            <div className="stat-number" style={{ color: '#10B981' }}>{stats.completed}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>

        {/* Controls */}
        <div className="controls">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters">
            <select 
              value={filter.category} 
              onChange={(e) => setFilter({...filter, category: e.target.value})}
              className="filter-select"
            >
              <option value="ALL">All Categories</option>
              {Object.entries(CATEGORIES).map(([key, cat]) => (
                <option key={key} value={key}>{cat.icon} {cat.name}</option>
              ))}
            </select>

            <select 
              value={filter.status} 
              onChange={(e) => setFilter({...filter, status: e.target.value})}
              className="filter-select"
            >
              <option value="ALL">All Status</option>
              <option value={STATUS.TODO}>📝 To Do</option>
              <option value={STATUS.IN_PROGRESS}>⏳ In Progress</option>
              <option value={STATUS.COMPLETED}>✅ Completed</option>
            </select>

            <select 
              value={filter.priority} 
              onChange={(e) => setFilter({...filter, priority: e.target.value})}
              className="filter-select"
            >
              <option value="ALL">All Priorities</option>
              {Object.entries(PRIORITIES).map(([key, priority]) => (
                <option key={key} value={key}>{priority.name}</option>
              ))}
            </select>
          </div>

          <button 
            className="add-task-btn"
            onClick={() => setShowAddForm(true)}
          >
            + Add Task
          </button>
        </div>

        {/* Add Task Form */}
        {showAddForm && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Task</h3>
                <button className="close-btn" onClick={() => setShowAddForm(false)}>×</button>
              </div>
              
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  placeholder="Enter task title..."
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  placeholder="Enter task description..."
                  className="form-textarea"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    value={newTask.category}
                    onChange={(e) => setNewTask({...newTask, category: e.target.value})}
                    className="form-select"
                  >
                    {Object.entries(CATEGORIES).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.icon} {cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                    className="form-select"
                  >
                    {Object.entries(PRIORITIES).map(([key, priority]) => (
                      <option key={key} value={key}>{priority.name}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Due Date</label>
                  <input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={addTask}>
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task List */}
        <div className="task-list">
          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3>No tasks found</h3>
              <p>Create your first task to get started!</p>
            </div>
          ) : (
            filteredTasks
              .sort((a, b) => {
                // Sort by priority first, then by due date
                const priorityDiff = PRIORITIES[b.priority].value - PRIORITIES[a.priority].value;
                if (priorityDiff !== 0) return priorityDiff;
                
                if (a.dueDate && b.dueDate) {
                  return new Date(a.dueDate) - new Date(b.dueDate);
                }
                if (a.dueDate) return -1;
                if (b.dueDate) return 1;
                return 0;
              })
              .map(task => (
                <div 
                  key={task.id} 
                  className={`task-card ${task.status === STATUS.COMPLETED ? 'completed' : ''}`}
                >
                  <div className="task-header">
                    <div className="task-left">
                      <button 
                        className="status-btn"
                        onClick={() => toggleTaskStatus(task.id)}
                        style={{ color: getStatusColor(task.status) }}
                      >
                        {getStatusIcon(task.status)}
                      </button>
                      <div className="task-info">
                        <h4 className="task-title">{task.title}</h4>
                        {task.description && (
                          <p className="task-description">{task.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="task-right">
                      <button 
                        className="delete-btn"
                        onClick={() => deleteTask(task.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>

                  <div className="task-meta">
                    <div className="task-tags">
                      <span 
                        className="category-tag"
                        style={{ backgroundColor: CATEGORIES[task.category].color }}
                      >
                        {CATEGORIES[task.category].icon} {CATEGORIES[task.category].name}
                      </span>
                      <span 
                        className="priority-tag"
                        style={{ backgroundColor: PRIORITIES[task.priority].color }}
                      >
                        {PRIORITIES[task.priority].name}
                      </span>
                      {task.dueDate && (
                        <span 
                          className={`due-date-tag ${isOverdue(task.dueDate) ? 'overdue' : isDueToday(task.dueDate) ? 'due-today' : ''}`}
                        >
                          📅 {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
