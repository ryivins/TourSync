/* =========================
   CONTACT SYSTEM
========================= */

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

  const search =
    document.getElementById("searchInput")?.value.toLowerCase() || "";

  const contacts = getContacts().filter(c =>
    c.first.toLowerCase().includes(search) ||
    c.last.toLowerCase().includes(search) ||
    c.phone.toLowerCase().includes(search) ||
    c.email.toLowerCase().includes(search)
  );

  list.innerHTML = "";

  contacts.forEach(c => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${c.last}, ${c.first}</strong><br>
      <small>${c.phone}</small>
    `;

    list.appendChild(li);
  });
}

function deleteContact(id) {
  saveContacts(getContacts().filter(c => c.id !== id));
  renderContacts();
}

function editContact(id) {
  const c = getContacts().find(x => x.id === id);
  if (!c) return;

  document.getElementById("firstName").value = c.first;
  document.getElementById("lastName").value = c.last;
  document.getElementById("phone").value = c.phone;
  document.getElementById("email").value = c.email;

  deleteContact(id);
}

/* =========================
   TASK SYSTEM
========================= */

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
  saveTasks(
    getTasks().map(t => t.id === id ? { ...t, done: !t.done } : t)
  );
  renderTasks();
}

function deleteTask(id) {
  saveTasks(getTasks().filter(t => t.id !== id));
  renderTasks();
}

function isOverdue(task) {
  return task.dueDate && !task.done && new Date(task.dueDate) < new Date();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  getTasks().forEach(t => {
    const li = document.createElement("li");

    li.className = `task ${t.priority} ${t.done ? "done" : ""} ${isOverdue(t) ? "overdue" : ""}`;

    li.innerHTML = `
      <input type="checkbox" onclick="toggleTask(${t.id})" ${t.done ? "checked" : ""}>
      <strong>${t.text}</strong><br>
      <small>${t.dueDate || "No due date"} | ${t.assignedTo || "Unassigned"}</small>
    `;

    list.appendChild(li);
  });
}

/* =========================
   MESSAGING SYSTEM (FIXED UI + PREVIEWS)
========================= */

let currentChatUser = null;

function getUsers() {
  return JSON.parse(localStorage.getItem("users")) || [];
}

function saveUsers(users) {
  localStorage.setItem("users", JSON.stringify(users));
}

function getChats() {
  return JSON.parse(localStorage.getItem("chats")) || {};
}

function saveChats(chats) {
  localStorage.setItem("chats", JSON.stringify(chats));
}

function getChatId(a, b) {
  return [a, b].sort().join("-");
}

/* CREATE USER */
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

/* GET LAST MESSAGE FOR PREVIEW */
function getLastMessage(userA, userB) {
  const chats = getChats();
  const id = getChatId(userA, userB);
  const msgs = chats[id] || [];
  return msgs.length ? msgs[msgs.length - 1].text : "No messages yet";
}

/* RENDER USERS WITH PREVIEW */
function renderUsers(search = "") {
  const list = document.getElementById("userList");
  if (!list) return;

  const me = localStorage.getItem("activeUser") || "";

  let users = getUsers().filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  list.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");

    li.className = "chat-preview";

    li.innerHTML = `
      <strong>${u.name}</strong><br>
      <small>${getLastMessage(me, u.username)}</small>
    `;

    li.onclick = () => openChat(u.username);

    list.appendChild(li);
  });
}

/* OPEN CHAT */
function openChat(username) {
  currentChatUser = username;
  document.getElementById("chatTitle").innerText = "Chat with @" + username;
  renderMessages();
}

/* SEND MESSAGE */
function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();

  if (!text || !currentChatUser) return;

  const me = localStorage.getItem("activeUser");

  const chats = getChats();
  const id = getChatId(me, currentChatUser);

  if (!chats[id]) chats[id] = [];

  chats[id].push({
    from: me,
    text,
    time: new Date().toLocaleTimeString()
  });

  saveChats(chats);

  input.value = "";
  renderMessages();
  renderUsers(); // updates previews instantly
}

/* RENDER MESSAGES (FIXED SPACING) */
function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  const me = localStorage.getItem("activeUser");

  if (!currentChatUser) {
    list.innerHTML = `<li class="msg them">Select a chat</li>`;
    return;
  }

  const chats = getChats();
  const id = getChatId(me, currentChatUser);
  const messages = chats[id] || [];

  list.innerHTML = "";

  messages.forEach(m => {
    const li = document.createElement("li");

    li.className = `msg ${m.from === me ? "me" : "them"}`;

    li.innerHTML = `
      <div>${m.text}</div>
      <small>${m.from} • ${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =========================
   INIT
========================= */

window.addEventListener("load", () => {
  renderContacts();
  renderTasks();
  renderUsers();
});