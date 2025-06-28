// Updated script.js with enhanced task model and edit option

document.addEventListener("DOMContentLoaded", () => {
  const path = location.pathname;
  const users = JSON.parse(localStorage.getItem("users")) || {};
  const loggedInUser = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");

  if (path.includes("index.html")) {
    if (!loggedInUser || !users[loggedInUser]) {
      location.href = "login.html";
    } else {
      document.getElementById("userDisplay").textContent = loggedInUser;
      renderTasks();
    }
  } else if (path.includes("login.html")) {
    const form = document.getElementById("loginForm");
    form.onsubmit = (e) => {
      e.preventDefault();
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;
      const remember = document.getElementById("rememberMe").checked;

      if (users[username] && users[username].password === password) {
        remember ? localStorage.setItem("loggedInUser", username) : sessionStorage.setItem("loggedInUser", username);
        location.href = "index.html";
      } else {
        alert("Invalid credentials");
      }
    };
  } else if (path.includes("signup.html")) {
    const form = document.getElementById("signupForm");
    form.onsubmit = (e) => {
      e.preventDefault();
      const username = document.getElementById("signupUsername").value.trim();
      const password = document.getElementById("signupPassword").value;

      if (users[username]) {
        alert("Username already exists!");
      } else {
        users[username] = { password, tasks: [] };
        localStorage.setItem("users", JSON.stringify(users));
        alert("Account created!");
        location.href = "login.html";
      }
    };
  }
});

function logout() {
  sessionStorage.removeItem("loggedInUser");
  localStorage.removeItem("loggedInUser");
  location.href = "login.html";
}

function addTask() {
  const title = prompt("Enter task title:");
  if (!title) return;
  const description = prompt("Enter task description:");
  const priority = prompt("Enter priority (low, medium, high):").toLowerCase();
  const status = prompt("Enter status (to do, in progress, done):").toLowerCase();
  const dueDate = prompt("Enter due date (YYYY-MM-DD):");

  const task = {
    title,
    description,
    priority,
    status,
    dueDate,
    completed: false
  };

  const user = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));

  users[user].tasks.push(task);
  localStorage.setItem("users", JSON.stringify(users));
  renderTasks();
}

function renderTasks() {
  const user = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  const taskList = document.getElementById("taskList");
  const filter = document.getElementById("filterSelect")?.value || "all";
  const sort = document.getElementById("sortSelect")?.value || "asc";
  const today = new Date().toISOString().split("T")[0];

  let tasks = [...users[user].tasks].filter(task => !task.dueDate || task.dueDate >= today);

  if (filter === "completed") {
    tasks = tasks.filter(t => t.completed);
  } else if (filter === "pending") {
    tasks = tasks.filter(t => !t.completed);
  }

  tasks.sort((a, b) => sort === "asc" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title));

  taskList.innerHTML = "";

  tasks.forEach((task, i) => {
    const col = document.createElement("div");
    col.className = "col-md-4 mb-3";

    const card = document.createElement("div");
    card.className = "card shadow-sm";

    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    const title = document.createElement("h5");
    title.textContent = task.title;
    title.className = task.completed ? "completed" : "";

    const desc = document.createElement("p");
    desc.textContent = task.description;

    const meta = document.createElement("p");
    meta.className = "small text-muted mb-1";
    meta.textContent = `Priority: ${task.priority}, Status: ${task.status}`;

    const due = document.createElement("p");
    due.className = "small mb-2";
    due.textContent = `Due Date: ${task.dueDate}`;

    const btnGroup = document.createElement("div");
    btnGroup.className = "d-flex flex-wrap gap-2";

    const toggle = document.createElement("button");
    toggle.className = "btn btn-sm btn-outline-success";
    toggle.textContent = task.completed ? "Mark Incomplete" : "Mark Complete";
    toggle.onclick = () => toggleTask(i);

    const edit = document.createElement("button");
    edit.className = "btn btn-sm btn-outline-primary";
    edit.textContent = "Edit";
    edit.onclick = () => editTask(i);

    const del = document.createElement("button");
    del.className = "btn btn-sm btn-outline-danger";
    del.textContent = "Delete";
    del.onclick = () => deleteTask(i);

    btnGroup.append(toggle, edit, del);
    cardBody.append(title, desc, meta, due, btnGroup);
    card.appendChild(cardBody);
    col.appendChild(card);
    taskList.appendChild(col);
  });
}

function toggleTask(index) {
  const user = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  users[user].tasks[index].completed = !users[user].tasks[index].completed;
  localStorage.setItem("users", JSON.stringify(users));
  renderTasks();
}

function deleteTask(index) {
  const user = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  users[user].tasks.splice(index, 1);
  localStorage.setItem("users", JSON.stringify(users));
  renderTasks();
}

function editTask(index) {
  const user = sessionStorage.getItem("loggedInUser") || localStorage.getItem("loggedInUser");
  const users = JSON.parse(localStorage.getItem("users"));
  const task = users[user].tasks[index];

  const newTitle = prompt("Edit title:", task.title) || task.title;
  const newDescription = prompt("Edit description:", task.description) || task.description;
  const newPriority = prompt("Edit priority (low, medium, high):", task.priority) || task.priority;
  const newStatus = prompt("Edit status (to do, in progress, done):", task.status) || task.status;
  const newDueDate = prompt("Edit due date (YYYY-MM-DD):", task.dueDate) || task.dueDate;

  task.title = newTitle;
  task.description = newDescription;
  task.priority = newPriority;
  task.status = newStatus;
  task.dueDate = newDueDate;

  users[user].tasks[index] = task;
  localStorage.setItem("users", JSON.stringify(users));
  renderTasks();
}
