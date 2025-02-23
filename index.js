// State Management
let tasks = JSON.parse(localStorage.getItem('tasks')) || []
let darkMode = localStorage.getItem('darkMode') === 'true'

// DOM Elements
const newTaskInput = document.getElementById('new-task')
const taskPrioritySelect = document.getElementById('task-priority')
const searchInput = document.getElementById('search')
const filterPrioritySelect = document.getElementById('filter-priority')
const addBtn = document.getElementById('add-task-btn')
const toggleModeBtn = document.querySelector('.toggle-mode')
const taskListSection = document.querySelector('.task-list')

// Initial Setup
document.body.classList.toggle('dark-mode', darkMode)
updateUI()

// Event Listeners
addBtn.addEventListener('click', addTask)
taskListSection.addEventListener('click', handleTaskActions)
searchInput.addEventListener('input', () => updateUI())
filterPrioritySelect.addEventListener('change', () => updateUI())
toggleModeBtn.addEventListener('click', toggleDarkMode)

// Core Functions
function addTask() {
    const taskName = newTaskInput.value.trim()
    if (!taskName) return alert('Please enter a task name')

    const newTask = {
        id: Date.now(),
        name: taskName,
        priority: taskPrioritySelect.value,
        completed: false,
        createdAt: new Date()
    }

    tasks = [...tasks, newTask]
    newTaskInput.value = ''
    updateUI()
    saveToLocalStorage()
}

function handleTaskActions(e) {
    const taskElement = e.target.closest('.task')
    if (!taskElement) return

    const taskId = Number(taskElement.dataset.id)

    if (e.target.classList.contains('complete-btn')) {
        toggleComplete(taskId)
    } else if (e.target.classList.contains('delete-btn')) {
        deleteTask(taskId)
    }
}

function toggleComplete(taskId) {
    tasks = tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
    )
    updateUI()
    saveToLocalStorage()
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId)
    updateUI()
    saveToLocalStorage()
}

// UI Updates
function updateUI() {
    const filteredTasks = filterTasks()
    const groupedTasks = groupTasks(filteredTasks)

    taskListSection.innerHTML = `
        ${renderTaskGroup('high', groupedTasks)}
        ${renderTaskGroup('medium', groupedTasks)}
        ${renderTaskGroup('low', groupedTasks)}
        <div class="completed-section">
            <h3>Completed Tasks</h3>
            ${groupedTasks.completed.map(renderTask).join('')}
        </div>
    `

    updateTaskCount()
}

function renderTaskGroup(priority, groups) {
    return groups[priority].length > 0 ? `
        <div class="priority-group ${priority}">
            <h3>${priority.toUpperCase()} PRIORITY</h3>
            ${groups[priority].map(renderTask).join('')}
        </div>
    ` : ''
}

function renderTask(task) {
    return `
        <div class="task ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" ${task.completed ? 'checked' : ''} class="complete-btn">
            <span>${task.name}</span>
            <span class="priority-tag ${task.priority}">${task.priority}</span>
            <button class="delete-btn">🗑️</button>
        </div>
    `
}

// Helper Functions
function filterTasks() {
    const searchTerm = searchInput.value.toLowerCase()
    const priorityFilter = filterPrioritySelect.value

    return tasks.filter(task => {
        const matchesSearch = task.name.toLowerCase().includes(searchTerm)
        const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter
        return matchesSearch && matchesPriority
    })
}

function groupTasks(tasks) {
    return tasks.reduce((groups, task) => {
        const key = task.completed ? 'completed' : task.priority
        groups[key].push(task)
        return groups
    }, { high: [], medium: [], low: [], completed: [] })
}

function updateTaskCount() {
    const incompleteCount = tasks.reduce((count, task) => !task.completed ? count + 1 : count, 0)

    document.querySelector('.incomplete-task').textContent =
        `Incomplete (${incompleteCount})`
}

// Bonus Features
function toggleDarkMode() {
    darkMode = !darkMode
    document.body.classList.toggle('dark-mode', darkMode)
    localStorage.setItem('darkMode', darkMode)
}

function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks))
}