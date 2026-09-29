const STORAGE_KEY = "academic-planner-tasks";

const CHECK_ICON = '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

const starterTasks = [
  { id: 1, title: "Submit the COS 106 term project", due: "", priority: "high", done: false },
  { id: 2, title: "Revise the C programming lab exercises", due: "", priority: "medium", done: true },
  { id: 3, title: "Read about CSS Grid and Flexbox", due: "", priority: "low", done: false }
];

let tasks = loadTasks();
let activeFilter = "all";

const form = document.getElementById("task-form");
const titleInput = document.getElementById("task-title");
const dueInput = document.getElementById("task-due");
const priorityInput = document.getElementById("task-priority");
const titleError = document.getElementById("task-title-error");
const list = document.getElementById("task-list");
const summary = document.getElementById("task-summary");
const percentLabel = document.getElementById("task-percent");
const progressBar = document.getElementById("task-progress");
const filterButtons = document.querySelectorAll(".filter-btn");
const clearButton = document.getElementById("clear-completed");

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : starterTasks.slice();
  } catch (error) {
    return starterTasks.slice();
  }
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (error) {
    return;
  }
}

function formatDue(value) {
  if (!value) return "No due date";
  const date = new Date(value + "T00:00:00");
  return "Due " + date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

function capitalise(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function visibleTasks() {
  if (activeFilter === "active") return tasks.filter(function (task) { return !task.done; });
  if (activeFilter === "completed") return tasks.filter(function (task) { return task.done; });
  return tasks;
}

function buildTask(task) {
  const item = document.createElement("li");
  item.className = "task" + (task.done ? " is-done" : "");

  const check = document.createElement("button");
  check.type = "button";
  check.className = "task-check";
  check.innerHTML = CHECK_ICON;
  check.setAttribute("aria-pressed", String(task.done));
  check.setAttribute("aria-label", (task.done ? "Mark as not completed: " : "Mark as completed: ") + task.title);
  check.addEventListener("click", function () {
    toggleTask(task.id);
  });

  const body = document.createElement("div");
  body.className = "task-body";

  const title = document.createElement("p");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta type-label";

  const due = document.createElement("span");
  due.textContent = formatDue(task.due);

  const priority = document.createElement("span");
  priority.className = "priority priority-" + task.priority;
  priority.textContent = capitalise(task.priority) + " priority";

  meta.append(due, priority);
  body.append(title, meta);

  const remove = document.createElement("button");
  remove.type = "button";
  remove.className = "task-delete";
  remove.textContent = "Delete";
  remove.setAttribute("aria-label", "Delete: " + task.title);
  remove.addEventListener("click", function () {
    deleteTask(task.id);
  });

  item.append(check, body, remove);
  return item;
}

function render() {
  list.innerHTML = "";
  const shown = visibleTasks();

  if (shown.length === 0) {
    const empty = document.createElement("li");
    empty.className = "task-empty type-meta";
    empty.textContent = activeFilter === "completed" ? "Nothing completed yet. Tick a task off when you finish it." : "No tasks here. Add one above to get started.";
    list.appendChild(empty);
  } else {
    shown.forEach(function (task) {
      list.appendChild(buildTask(task));
    });
  }

  const completed = tasks.filter(function (task) { return task.done; }).length;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  summary.textContent = completed + " of " + tasks.length + " tasks completed";
  percentLabel.textContent = percent + "%";
  progressBar.style.width = percent + "%";
  clearButton.disabled = completed === 0;
}

function addTask(title, due, priority) {
  tasks.push({ id: Date.now(), title: title, due: due, priority: priority, done: false });
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(function (task) {
    return task.id === id ? Object.assign({}, task, { done: !task.done }) : task;
  });
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(function (task) { return task.id !== id; });
  saveTasks();
  render();
}

form.addEventListener("submit", function (event) {
  event.preventDefault();
  const title = titleInput.value.trim();
  const field = titleInput.closest(".field");

  if (title === "") {
    titleError.textContent = "Please describe the task before adding it.";
    field.classList.add("has-error");
    titleInput.setAttribute("aria-invalid", "true");
    titleInput.focus();
    return;
  }

  titleError.textContent = "";
  field.classList.remove("has-error");
  titleInput.removeAttribute("aria-invalid");
  addTask(title, dueInput.value, priorityInput.value);
  form.reset();
  priorityInput.value = "medium";
  titleInput.focus();
});

filterButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    activeFilter = button.dataset.filter;
    filterButtons.forEach(function (other) {
      const selected = other === button;
      other.classList.toggle("is-active", selected);
      other.setAttribute("aria-pressed", String(selected));
    });
    render();
  });
});

clearButton.addEventListener("click", function () {
  tasks = tasks.filter(function (task) { return !task.done; });
  saveTasks();
  render();
});

render();
