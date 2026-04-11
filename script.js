// =========================
// CONTACT SYSTEM
// =========================

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(contacts) {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

function addContact() {
  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!first || !last) return;

  const contacts = getContacts();

  contacts.push({
    id: Date.now(),
    first,
    last,
    phone,
    email
  });

  contacts.sort((a, b) => a.last.localeCompare(b.last));

  saveContacts(contacts);
  renderContacts();

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
}

function renderContacts() {
  const list = document.getElementById("contactList");
  if (!list) return;

  const searchEl = document.getElementById("searchInput");
  const search = searchEl ? searchEl.value.toLowerCase() : "";

  let contacts = getContacts();

  contacts = contacts.filter(c =>
    c.first.toLowerCase().includes(search) ||
    c.last.toLowerCase().includes(search) ||
    c.phone.toLowerCase().includes(search) ||
    c.email.toLowerCase().includes(search)
  );

  list.innerHTML = "";

  contacts.forEach(c => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${c.last}, ${c.first}</strong><br>
        <a href="tel:${c.phone}">${c.phone}</a><br>
        <a href="mailto:${c.email}">${c.email}</a>
      </div>

      <div class="actions">
        <button onclick="editContact(${c.id})">Edit</button>
        <span class="delete" onclick="deleteContact(${c.id})">✕</span>
      </div>
    `;

    list.appendChild(li);
  });
}

function deleteContact(id) {
  let contacts = getContacts().filter(c => c.id !== id);
  saveContacts(contacts);
  renderContacts();
}

function editContact(id) {
  let contacts = getContacts();
  const c = contacts.find(x => x.id === id);

  document.getElementById("firstName").value = c.first;
  document.getElementById("lastName").value = c.last;
  document.getElementById("phone").value = c.phone;
  document.getElementById("email").value = c.email;

  deleteContact(id);
}

// =========================
// TASK SYSTEM
// =========================

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}

function sortTasks(tasks) {
  const order = { high: 1, medium: 2, low: 3 };
  return tasks.sort((a, b) => order[a.priority] - order[b.priority]);
}

function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const priority = document.getElementById("taskPriority")?.value || "medium";
  const dueDate = document.getElementById("taskDueDate")?.value || "";
  const assignedTo = document.getElementById("taskAssignee")?.value || "";

  if (!text) return;

  let tasks = getTasks();

  tasks.push({
    id: Date.now(),
    text,
    priority,
    dueDate,
    assignedTo,
    done: false
  });

  tasks = sortTasks(tasks);

  saveTasks(tasks);
  renderTasks();

  document.getElementById("taskInput").value = "";
}

function toggleTask(id) {
  let tasks = getTasks();

  tasks = tasks.map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );

  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  let tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function isOverdue(task) {
  if (!task.dueDate || task.done) return false;
  return new Date(task.dueDate) < new Date();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  let tasks = sortTasks(getTasks());

  list.innerHTML = "";

  tasks.forEach(t => {
    const li = document.createElement("li");

    li.className = `task ${t.priority} ${t.done ? "done" : ""} ${isOverdue(t) ? "overdue" : ""}`;

    li.innerHTML = `
      <div class="task-left">
        <input type="checkbox" onclick="toggleTask(${t.id})" ${t.done ? "checked" : ""}>

        <div>
          <strong>${t.text}</strong><br>
          <small>📅 ${t.dueDate || "No due date"} | 👤 ${t.assignedTo || "Unassigned"}</small>
        </div>
      </div>

      <span class="delete" onclick="deleteTask(${t.id})">✕</span>
    `;

    list.appendChild(li);
  });

  updateStats(tasks);
}

function updateStats(tasks) {
  const stats = { high: 0, medium: 0, low: 0, overdue: 0 };

  tasks.forEach(t => {
    stats[t.priority]++;
    if (isOverdue(t)) stats.overdue++;
  });

  if (document.getElementById("statHigh")) {
    document.getElementById("statHigh").innerText = `High: ${stats.high}`;
    document.getElementById("statMedium").innerText = `Medium: ${stats.medium}`;
    document.getElementById("statLow").innerText = `Low: ${stats.low}`;
    document.getElementById("statOverdue").innerText = `Overdue: ${stats.overdue}`;
  }
}

// =========================
// MESSAGES SYSTEM
// =========================

function loadMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  list.innerHTML = "";

  const messages = JSON.parse(localStorage.getItem("messages")) || [];

  messages.forEach((msg, index) => {
    const li = document.createElement("li");
    li.className = "message";

    li.innerHTML = `
      <span>${msg}</span>
      <button onclick="deleteMessage(${index})">✕</button>
    `;

    list.appendChild(li);
  });
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text) return;

  const messages = JSON.parse(localStorage.getItem("messages")) || [];

  messages.push(text);

  localStorage.setItem("messages", JSON.stringify(messages));

  input.value = "";
  loadMessages();
}

function deleteMessage(index) {
  const messages = JSON.parse(localStorage.getItem("messages")) || [];

  messages.splice(index, 1);

  localStorage.setItem("messages", JSON.stringify(messages));
  loadMessages();
}

// =========================
// SINGLE UNIFIED LOAD SYSTEM
// =========================

window.addEventListener("load", () => {
  renderContacts();
  renderTasks();
  loadMessages();
});