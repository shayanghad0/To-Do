
import './style.css'

// Application State
class TaskApp {
  constructor() {
    this.currentUser = null;
    this.tasks = [];
    this.currentFilter = 'all';
    this.currentSearchTerm = '';
    this.editingTask = null;
    this.init();
  }

  init() {
    this.loadFromStorage();
    this.render();
    this.bindEvents();
  }

  loadFromStorage() {
    const userData = localStorage.getItem('taskapp_user');
    const tasksData = localStorage.getItem('taskapp_tasks');
    
    if (userData) {
      this.currentUser = JSON.parse(userData);
    }
    
    if (tasksData) {
      this.tasks = JSON.parse(tasksData);
    }
  }

  saveToStorage() {
    if (this.currentUser) {
      localStorage.setItem('taskapp_user', JSON.stringify(this.currentUser));
    }
    localStorage.setItem('taskapp_tasks', JSON.stringify(this.tasks));
  }

  render() {
    const app = document.querySelector('#app');
    
    if (!this.currentUser) {
      app.innerHTML = this.renderAuth();
    } else {
      app.innerHTML = this.renderDashboard();
      this.updateStats();
    }
  }

  renderAuth() {
    return `
      <div class="app-container fade-in">
        <div class="auth-container">
          <div class="auth-header">
            <i class="fas fa-tasks" style="font-size: 48px; color: #667eea; margin-bottom: 20px;"></i>
            <h2>Welcome to TaskMaster Pro</h2>
            <p style="color: var(--text-secondary);">Your complete task management solution</p>
          </div>
          
          <form id="auth-form">
            <div class="form-group">
              <label for="username">Username</label>
              <input type="text" id="username" class="form-control" placeholder="Enter your username" required>
            </div>
            
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" class="form-control" placeholder="Enter your email" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" class="form-control" placeholder="Enter your password" required>
            </div>
            
            <button type="submit" class="btn btn-primary">
              <i class="fas fa-sign-in-alt"></i>
              Get Started
            </button>
          </form>
        </div>
      </div>
    `;
  }

  renderDashboard() {
    return `
      <div class="app-container fade-in">
        <header class="header">
          <nav class="nav">
            <a href="#" class="logo">
              <i class="fas fa-tasks"></i>
              TaskMaster Pro
            </a>
            <div class="auth-section">
              <div class="user-info">
                <div class="avatar">${this.currentUser.username.charAt(0).toUpperCase()}</div>
                <span>Hello, ${this.currentUser.username}!</span>
                <button id="logout-btn" class="btn btn-secondary" style="margin-left: 15px; padding: 8px 15px;">
                  <i class="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          </nav>
        </header>
        
        <main class="main-content">
          <div class="dashboard">
            <div class="stats-grid">
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-list-check"></i>
                </div>
                <div class="stat-number" id="total-tasks">0</div>
                <div class="stat-label">Total Tasks</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-check-circle"></i>
                </div>
                <div class="stat-number" id="completed-tasks">0</div>
                <div class="stat-label">Completed</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="stat-number" id="pending-tasks">0</div>
                <div class="stat-label">Pending</div>
              </div>
              
              <div class="stat-card">
                <div class="stat-icon">
                  <i class="fas fa-fire"></i>
                </div>
                <div class="stat-number" id="completion-rate">0%</div>
                <div class="stat-label">Completion Rate</div>
              </div>
            </div>
            
            <div class="task-section">
              <div class="section-header">
                <h2 class="section-title">
                  <i class="fas fa-tasks"></i>
                  Task Management
                </h2>
                <button id="export-btn" class="btn btn-secondary">
                  <i class="fas fa-download"></i>
                  Export Tasks
                </button>
              </div>
              
              <div class="search-bar">
                <input type="text" id="search-input" class="search-input" placeholder="Search tasks...">
                <i class="fas fa-search search-icon"></i>
              </div>
              
              <div class="filter-tabs">
                <button class="filter-tab active" data-filter="all">
                  <i class="fas fa-list"></i>
                  All Tasks
                </button>
                <button class="filter-tab" data-filter="pending">
                  <i class="fas fa-clock"></i>
                  Pending
                </button>
                <button class="filter-tab" data-filter="completed">
                  <i class="fas fa-check"></i>
                  Completed
                </button>
                <button class="filter-tab" data-filter="high">
                  <i class="fas fa-exclamation"></i>
                  High Priority
                </button>
              </div>
              
              <form id="task-form" class="task-form">
                <div class="form-group task-input">
                  <input type="text" id="task-text" class="form-control" placeholder="Add a new task..." required>
                </div>
                <div class="form-group task-priority">
                  <select id="task-priority" class="form-control">
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-plus"></i>
                  Add Task
                </button>
              </form>
              
              <div id="task-list" class="task-list">
                ${this.renderTasks()}
              </div>
            </div>
          </div>
        </main>
      </div>
      
      <div id="modal-overlay" class="modal" style="display: none;">
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Edit Task</h3>
            <button class="close-btn" id="close-modal">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form id="edit-form">
            <div class="form-group">
              <label for="edit-task-text">Task Description</label>
              <input type="text" id="edit-task-text" class="form-control" required>
            </div>
            <div class="form-group">
              <label for="edit-task-priority">Priority</label>
              <select id="edit-task-priority" class="form-control">
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px;">
              <button type="submit" class="btn btn-primary" style="flex: 1;">
                <i class="fas fa-save"></i>
                Save Changes
              </button>
              <button type="button" class="btn btn-secondary" id="cancel-edit" style="flex: 1;">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    `;
  }

  renderTasks() {
    const filteredTasks = this.getFilteredTasks();
    
    if (filteredTasks.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">
            <i class="fas fa-clipboard-list"></i>
          </div>
          <h3>No tasks found</h3>
          <p>Add your first task to get started with TaskMaster Pro!</p>
        </div>
      `;
    }
    
    return filteredTasks.map(task => `
      <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
        <div class="task-checkbox ${task.completed ? 'checked' : ''}" data-task-id="${task.id}">
          ${task.completed ? '<i class="fas fa-check"></i>' : ''}
        </div>
        <div class="task-content">
          <div class="task-text ${task.completed ? 'completed' : ''}">${task.text}</div>
          <div class="task-meta">
            <span class="task-priority-badge priority-${task.priority}">
              <i class="fas fa-flag"></i>
              ${task.priority.toUpperCase()}
            </span>
            <span>
              <i class="fas fa-calendar-alt"></i>
              ${new Date(task.createdAt).toLocaleDateString()}
            </span>
            <span>
              <i class="fas fa-clock"></i>
              ${new Date(task.createdAt).toLocaleTimeString()}
            </span>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-icon btn-edit" data-task-id="${task.id}" title="Edit Task">
            <i class="fas fa-edit"></i>
          </button>
          <button class="btn-icon btn-delete" data-task-id="${task.id}" title="Delete Task">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  }

  getFilteredTasks() {
    let filtered = [...this.tasks];
    
    // Apply search filter
    if (this.currentSearchTerm) {
      filtered = filtered.filter(task => 
        task.text.toLowerCase().includes(this.currentSearchTerm.toLowerCase())
      );
    }
    
    // Apply status/priority filter
    switch (this.currentFilter) {
      case 'pending':
        filtered = filtered.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = filtered.filter(task => task.completed);
        break;
      case 'high':
        filtered = filtered.filter(task => task.priority === 'high');
        break;
    }
    
    // Sort by priority and creation date
    return filtered.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      // Auth form
      if (e.target.closest('#auth-form')) {
        e.preventDefault();
        this.handleAuth();
      }
      
      // Logout
      if (e.target.closest('#logout-btn')) {
        this.logout();
      }
      
      // Task form
      if (e.target.closest('#task-form')) {
        e.preventDefault();
        this.addTask();
      }
      
      // Task checkbox
      if (e.target.closest('.task-checkbox')) {
        const taskId = parseInt(e.target.closest('.task-checkbox').dataset.taskId);
        this.toggleTask(taskId);
      }
      
      // Edit task
      if (e.target.closest('.btn-edit')) {
        const taskId = parseInt(e.target.closest('.btn-edit').dataset.taskId);
        this.editTask(taskId);
      }
      
      // Delete task
      if (e.target.closest('.btn-delete')) {
        const taskId = parseInt(e.target.closest('.btn-delete').dataset.taskId);
        this.deleteTask(taskId);
      }
      
      // Filter tabs
      if (e.target.closest('.filter-tab')) {
        const filter = e.target.closest('.filter-tab').dataset.filter;
        this.setFilter(filter);
      }
      
      // Modal controls
      if (e.target.closest('#close-modal') || e.target.closest('#cancel-edit')) {
        this.closeModal();
      }
      
      if (e.target.closest('#edit-form')) {
        e.preventDefault();
        this.saveEdit();
      }
      
      // Export tasks
      if (e.target.closest('#export-btn')) {
        this.exportTasks();
      }
      
      // Close modal on overlay click
      if (e.target.id === 'modal-overlay') {
        this.closeModal();
      }
    });
    
    // Search input
    document.addEventListener('input', (e) => {
      if (e.target.id === 'search-input') {
        this.currentSearchTerm = e.target.value;
        this.updateTaskList();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        const taskInput = document.getElementById('task-text');
        if (taskInput) taskInput.focus();
      }
      
      if (e.key === 'Escape') {
        this.closeModal();
      }
    });
  }

  handleAuth() {
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    if (!username || !email || !password) {
      this.showNotification('Please fill in all fields', 'error');
      return;
    }
    
    if (password.length < 6) {
      this.showNotification('Password must be at least 6 characters', 'error');
      return;
    }
    
    this.currentUser = {
      username,
      email,
      createdAt: new Date().toISOString()
    };
    
    this.saveToStorage();
    this.showNotification(`Welcome to TaskMaster Pro, ${username}!`, 'success');
    this.render();
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.currentUser = null;
      localStorage.removeItem('taskapp_user');
      this.showNotification('Successfully logged out', 'success');
      this.render();
    }
  }

  addTask() {
    const taskText = document.getElementById('task-text').value.trim();
    const taskPriority = document.getElementById('task-priority').value;
    
    if (!taskText) {
      this.showNotification('Please enter a task description', 'error');
      return;
    }
    
    const newTask = {
      id: Date.now(),
      text: taskText,
      priority: taskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
      userId: this.currentUser.email
    };
    
    this.tasks.unshift(newTask);
    this.saveToStorage();
    this.updateTaskList();
    this.updateStats();
    
    // Reset form
    document.getElementById('task-text').value = '';
    document.getElementById('task-priority').value = 'low';
    
    this.showNotification('Task added successfully!', 'success');
    
    // Auto-focus for continuous adding
    setTimeout(() => {
      document.getElementById('task-text').focus();
    }, 100);
  }

  toggleTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this.saveToStorage();
      this.updateTaskList();
      this.updateStats();
      
      const action = task.completed ? 'completed' : 'marked as pending';
      this.showNotification(`Task ${action}!`, 'success');
    }
  }

  editTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      this.editingTask = task;
      document.getElementById('edit-task-text').value = task.text;
      document.getElementById('edit-task-priority').value = task.priority;
      document.getElementById('modal-overlay').style.display = 'flex';
      document.getElementById('edit-task-text').focus();
    }
  }

  saveEdit() {
    if (!this.editingTask) return;
    
    const newText = document.getElementById('edit-task-text').value.trim();
    const newPriority = document.getElementById('edit-task-priority').value;
    
    if (!newText) {
      this.showNotification('Please enter a task description', 'error');
      return;
    }
    
    this.editingTask.text = newText;
    this.editingTask.priority = newPriority;
    this.editingTask.updatedAt = new Date().toISOString();
    
    this.saveToStorage();
    this.updateTaskList();
    this.closeModal();
    this.showNotification('Task updated successfully!', 'success');
  }

  deleteTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && confirm(`Are you sure you want to delete "${task.text}"?`)) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      this.saveToStorage();
      this.updateTaskList();
      this.updateStats();
      this.showNotification('Task deleted successfully!', 'success');
    }
  }

  setFilter(filter) {
    this.currentFilter = filter;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
      tab.classList.remove('active');
    });
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    this.updateTaskList();
  }

  updateTaskList() {
    const taskList = document.getElementById('task-list');
    if (taskList) {
      taskList.innerHTML = this.renderTasks();
    }
  }

  updateStats() {
    const totalTasks = this.tasks.length;
    const completedTasks = this.tasks.filter(t => t.completed).length;
    const pendingTasks = totalTasks - completedTasks;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    const totalEl = document.getElementById('total-tasks');
    const completedEl = document.getElementById('completed-tasks');
    const pendingEl = document.getElementById('pending-tasks');
    const rateEl = document.getElementById('completion-rate');
    
    if (totalEl) totalEl.textContent = totalTasks;
    if (completedEl) completedEl.textContent = completedTasks;
    if (pendingEl) pendingEl.textContent = pendingTasks;
    if (rateEl) rateEl.textContent = `${completionRate}%`;
  }

  closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    this.editingTask = null;
  }

  exportTasks() {
    const dataStr = JSON.stringify(this.tasks, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskmaster-pro-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    this.showNotification('Tasks exported successfully!', 'success');
  }

  showNotification(message, type = 'success') {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-triangle' : 'info-circle'}"></i>
      ${message}
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
  new TaskApp();
});

// Service Worker Registration (for PWA capabilities)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Add some sample data for demo purposes
setTimeout(() => {
  const app = window.taskApp;
  if (app && app.currentUser && app.tasks.length === 0) {
    const sampleTasks = [
      {
        id: 1,
        text: "Welcome to TaskMaster Pro! This is your first sample task.",
        priority: "high",
        completed: false,
        createdAt: new Date().toISOString(),
        userId: app.currentUser.email
      },
      {
        id: 2,
        text: "Try editing this task by clicking the edit button",
        priority: "medium",
        completed: false,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        userId: app.currentUser.email
      },
      {
        id: 3,
        text: "Mark this task as completed by clicking the checkbox",
        priority: "low",
        completed: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        completedAt: new Date().toISOString(),
        userId: app.currentUser.email
      }
    ];
    
    app.tasks = sampleTasks;
    app.saveToStorage();
    app.updateTaskList();
    app.updateStats();
  }
}, 1000);

// Make app globally accessible
window.taskApp = null;
document.addEventListener('DOMContentLoaded', () => {
  window.taskApp = new TaskApp();
});
