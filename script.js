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

  list.innerHTML = "";

  getContacts()
    .filter(c =>
      c.first.toLowerCase().includes(search) ||
      c.last.toLowerCase().includes(search)
    )
    .forEach(c => {
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
  if (!text) return;

  const tasks = getTasks();

  tasks.push({
    id: Date.now(),
    text,
    priority: document.getElementById("taskPriority")?.value || "medium",
    dueDate: document.getElementById("taskDueDate")?.value || "",
    assignedTo: document.getElementById("taskAssignee")?.value || "",
    done: false
  });

  saveTasks(tasks);
  renderTasks();

  document.getElementById("taskInput").value = "";
}

function toggleTask(id) {
  saveTasks(
    getTasks().map(t => (t.id === id ? { ...t, done: !t.done } : t))
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
   MESSAGING SYSTEM (FIXED + CLEAN UI)
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

function initializeDemoData() {
  const defaultUser = "tourguide";

  if (!localStorage.getItem("activeUser")) {
    localStorage.setItem("activeUser", defaultUser);
  }

  let users = getUsers();
  if (!users.length) {
    users = [
      { id: 1, name: "Matt Klein", username: "matt" },
      { id: 2, name: "Sidney Castillo", username: "sarah" },
      { id: 3, name: "Jonah Payne", username: "jordan" }
    ];
    saveUsers(users);
  }

  const chats = getChats();
  const me = localStorage.getItem("activeUser");

  const demoConversations = {
    [getChatId(me, "matt")]: [
      { from: "matt", text: "Hey, are we still meeting?", time: "9:04 AM" },
      { from: me, text: "Yes — 2pm at the museum entrance.", time: "9:06 AM" }
    ],
    [getChatId(me, "sarah")]: [
      { from: "sarah", text: "Got the schedule 👍", time: "8:12 AM" },
      { from: me, text: "Perfect, I added the new venue.", time: "8:15 AM" }
    ],
    [getChatId(me, "jordan")]: [
      { from: "jordan", text: "I'll check it out", time: "7:58 AM" },
      { from: me, text: "Cool — let me know if anything changes.", time: "8:05 AM" }
    ]
  };

  Object.keys(demoConversations).forEach(id => {
    if (!chats[id] || !chats[id].length) {
      chats[id] = demoConversations[id];
    }
  });

  saveChats(chats);
}

/* CREATE USER (ONLY DEMO) */
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

/* GET LAST MESSAGE */
function getLastMessage(me, other) {
  const chats = getChats();
  const id = getChatId(me, other);
  const msgs = chats[id] || [];

  if (!msgs.length) return "No messages yet";

  const last = msgs[msgs.length - 1];
  return `${last.from}: ${last.text}`;
}

/* RENDER CHAT LIST (LIKE YOUR SCREENSHOT) */
function renderUsers(search = "") {
  const list = document.getElementById("userList");
  if (!list) return;

  const me = localStorage.getItem("activeUser") || "";

  list.innerHTML = "";

  getUsers()
    .filter(u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
    )
    .forEach(u => {
      const li = document.createElement("li");

      const preview = getLastMessage(me, u.username);

      li.className = "chat-preview";

      li.innerHTML = `
        <strong>${u.name}</strong>
        <small>${preview}</small>
      `;

      li.onclick = () => openChat(u.username);

      list.appendChild(li);
    });
}

/* OPEN CHAT */
function openChat(username) {
  currentChatUser = username;
  document.getElementById("chatTitle").innerText = "Chat with " + username;
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
  renderUsers(); // update previews
}

/* RENDER MESSAGES (FIXED SPACING LIKE MESSENGER) */
function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  const me = localStorage.getItem("activeUser");

  if (!currentChatUser) {
    list.innerHTML = `<li class="msg them">Select a conversation</li>`;
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
  initializeDemoData();
  renderContacts();
  renderTasks();
  renderUsers();

  const users = getUsers();
  if (users.length) {
    openChat(users[0].username);
  }
});