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

  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";

  let contacts = getContacts().filter(c =>
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
  const contacts = getContacts().filter(c => c.id !== id);
  saveContacts(contacts);
  renderContacts();
}

function editContact(id) {
  const contacts = getContacts();
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

function addTask() {
  const text = document.getElementById("taskInput").value.trim();
  const priority = document.getElementById("taskPriority")?.value || "medium";
  const dueDate = document.getElementById("taskDueDate")?.value || "";
  const assignedTo = document.getElementById("taskAssignee")?.value || "";

  if (!text) return;

  const tasks = getTasks();

  tasks.push({
    id: Date.now(),
    text,
    priority,
    dueDate,
    assignedTo,
    done: false
  });

  saveTasks(tasks);
  renderTasks();

  document.getElementById("taskInput").value = "";
}

function toggleTask(id) {
  const tasks = getTasks().map(t =>
    t.id === id ? { ...t, done: !t.done } : t
  );

  saveTasks(tasks);
  renderTasks();
}

function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);
  renderTasks();
}

function isOverdue(task) {
  return task.dueDate && !task.done && new Date(task.dueDate) < new Date();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  const tasks = getTasks();

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
}


// =========================
// MESSAGING SYSTEM (CLEAN FACEBOOK STYLE)
// =========================

let currentChatUser = null;

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function createUser() {
  const name = document.getElementById("name").value.trim();
  const username = document.getElementById("username").value.trim();

  if (!name || !username) return;

  let users = getUsers();

  if (!users.find(u => u.username === username)) {
    users.push({ id: Date.now(), name, username });
  }

  localStorage.setItem("activeUser", username);
  saveUsers(users);

  renderUsers();
}

function renderUsers(search = "") {
  const list = document.getElementById("userList");
  if (!list) return;

  const active = localStorage.getItem("activeUser");

  let users = getUsers().filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  list.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");

    if (u.username === active) li.style.border = "1px solid #38bdf8";

    li.innerHTML = `
      <strong>${u.name}</strong><br>
      <small>@${u.username}</small>
    `;

    li.onclick = () => openChat(u.username);

    list.appendChild(li);
  });
}


// CHATS
function getChats() {
  return JSON.parse(localStorage.getItem("chats")) || {};
}

function saveChats(chats) {
  localStorage.setItem("chats", JSON.stringify(chats));
}

function getChatId(a, b) {
  return [a, b].sort().join("-");
}


// OPEN CHAT
function openChat(username) {
  currentChatUser = username;
  document.getElementById("chatTitle").innerText = "Chat with @" + username;
  renderMessages();
}


// SEND MESSAGE
function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text || !currentChatUser) return;

  const me = localStorage.getItem("activeUser");

  const chats = getChats();
  const chatId = getChatId(me, currentChatUser);

  if (!chats[chatId]) chats[chatId] = [];

  chats[chatId].push({
    from: me,
    text,
    time: new Date().toLocaleTimeString()
  });

  saveChats(chats);

  input.value = "";
  renderMessages();
}


// RENDER MESSAGES (MESSENGER STYLE)
function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list || !currentChatUser) return;

  const me = localStorage.getItem("activeUser");

  const chats = getChats();
  const chatId = getChatId(me, currentChatUser);

  const messages = chats[chatId] || [];

  list.innerHTML = "";

  messages.forEach(m => {
    const li = document.createElement("li");

    li.className = `msg ${m.from === me ? "me" : "them"}`;

    li.innerHTML = `
      <div>${m.text}</div>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}


// =========================
// INIT
// =========================

window.addEventListener("load", () => {
  renderContacts();
  renderTasks();
  renderUsers();
});