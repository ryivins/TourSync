/* =========================
   TOURSYNC APP - CLEAN BUILD
========================= */

/* =========================
   CONTACT SYSTEM
========================= */

let selectedContactId = null;

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(contacts) {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

function addContact() {
  const first = document.getElementById("firstName")?.value.trim();
  const last = document.getElementById("lastName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const email = document.getElementById("email")?.value.trim();

  if (!first || !last) return;

  const contacts = getContacts();

  contacts.push({
    id: crypto.randomUUID(),
    first,
    last,
    phone,
    email,
    notes: ""
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

  const contacts = getContacts();

  list.innerHTML = "";

  if (contacts.length === 0) {
    list.innerHTML = `<li class="empty-state">No contacts yet. Add your first contact above.</li>`;
    return;
  }

  contacts
    .filter(c =>
      c.first.toLowerCase().includes(search) ||
      c.last.toLowerCase().includes(search) ||
      (c.email || "").toLowerCase().includes(search) ||
      (c.phone || "").toLowerCase().includes(search)
    )
    .forEach(c => {
      const li = document.createElement("li");
      li.className = "contact-item";

      if (selectedContactId === c.id) {
        li.classList.add("active");
      }

      li.onclick = () => openContact(c.id);

      li.innerHTML = `
        <strong>${c.first} ${c.last}</strong>
        <small>${c.email || "No email"} • ${c.phone || "No phone"}</small>
      `;

      list.appendChild(li);
    });
}

function openContact(id) {
  selectedContactId = id;

  const contact = getContacts().find(c => c.id === id);
  if (!contact) return;

  const panel = document.getElementById("contactDetails");

  if (!panel) return;

  panel.innerHTML = `
    <div class="card">

      <h3>${contact.first} ${contact.last}</h3>

      <p><strong>Phone:</strong> ${contact.phone || "N/A"}</p>
      <p><strong>Email:</strong> ${contact.email || "N/A"}</p>

      <hr style="margin:10px 0; opacity:0.3;">

      <label><strong>Notes</strong></label>

      <textarea id="contactNotes" class="input" rows="6">${contact.notes || ""}</textarea>

      <div style="margin-top:10px; display:flex; gap:10px;">
        <button class="btn btn-primary" onclick="saveContactNotes('${contact.id}')">
          Save Notes
        </button>

        <button class="btn btn-secondary" onclick="editContact('${contact.id}')">
          Edit
        </button>
      </div>

    </div>
  `;

  renderContacts();
}

function saveContactNotes(id) {
  const notes = document.getElementById("contactNotes")?.value || "";

  const updated = getContacts().map(c =>
    c.id === id ? { ...c, notes } : c
  );

  saveContacts(updated);
  renderContacts();
  openContact(id);
}

function editContact(id) {
  const updated = getContacts().map(c => {
    if (c.id !== id) return c;

    return {
      ...c,
      first: prompt("First name:", c.first) || c.first,
      last: prompt("Last name:", c.last) || c.last,
      phone: prompt("Phone:", c.phone) || c.phone,
      email: prompt("Email:", c.email) || c.email
    };
  });

  saveContacts(updated);
  renderContacts();
  openContact(id);
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
  const text = document.getElementById("taskInput")?.value.trim();
  if (!text) return;

  const tasks = getTasks();

  tasks.push({
    id: crypto.randomUUID(),
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
    getTasks().map(t => t.id === id ? { ...t, done: !t.done } : t)
  );
  renderTasks();
}

function deleteTask(id) {
  saveTasks(getTasks().filter(t => t.id !== id));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  const tasks = getTasks();

  list.innerHTML = "";

  if (tasks.length === 0) {
    list.innerHTML = `<li class="empty-state">No tasks yet. Add your first task above.</li>`;
    return;
  }

  tasks.forEach(t => {
    const li = document.createElement("li");
    li.className = `task ${t.priority} ${t.done ? "done" : ""}`;

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = t.done;
    checkbox.onclick = () => toggleTask(t.id);

    const text = document.createElement("strong");
    text.textContent = t.text;

    const meta = document.createElement("small");
    meta.textContent = `${t.dueDate || "No due date"} | ${t.assignedTo || "Unassigned"}`;

    const del = document.createElement("button");
    del.textContent = "Delete";
    del.className = "btn btn-secondary";
    del.onclick = () => deleteTask(t.id);

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(document.createElement("br"));
    li.appendChild(meta);
    li.appendChild(del);

    list.appendChild(li);
  });
}

/* =========================
   MESSAGING SYSTEM
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

function getActiveUser() {
  return localStorage.getItem("activeUser");
}

function setActiveUser(id) {
  localStorage.setItem("activeUser", id);
}

function getChatId(a, b) {
  return [a, b].sort().join("__");
}

function initializeDemoData() {
  if (!getActiveUser()) setActiveUser("me");

  if (getUsers().length === 0) {
    saveUsers([
      { id: "u1", name: "Matt Klein" },
      { id: "u2", name: "Sidney Castillo" },
      { id: "u3", name: "Jonah Payne" }
    ]);
  }

  const me = getActiveUser();

  const chats = {};

  chats[getChatId(me, "u1")] = [
    { from: "u1", text: "Hey!", time: "9:00 AM" },
    { from: me, text: "Yo!", time: "9:01 AM" }
  ];

  saveChats(chats);
}

function renderUsers() {
  const list = document.getElementById("userList");
  if (!list) return;

  const me = getActiveUser();

  list.innerHTML = "";

  getUsers().forEach(u => {
    const li = document.createElement("li");
    li.className = "chat-preview";

    li.innerHTML = `<strong>${u.name}</strong>`;

    li.onclick = () => openChat(u.id);

    list.appendChild(li);
  });
}

function openChat(id) {
  currentChatUser = id;

  const user = getUsers().find(u => u.id === id);

  const title = document.getElementById("chatTitle");
  if (title) title.textContent = user ? user.name : "Chat";

  renderMessages();
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input?.value.trim();

  if (!text || !currentChatUser) return;

  const me = getActiveUser();

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
}

function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  const me = getActiveUser();

  if (!currentChatUser) {
    list.innerHTML = `<li class="empty-state">Select a conversation</li>`;
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
      <div class="bubble">${m.text}</div>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });

  list.scrollTop = list.scrollHeight;
}

/* =========================
   DASHBOARD + INIT
========================= */

function renderDashboard() {
  const taskCount = document.getElementById("dashboardTaskCount");
  const contactCount = document.getElementById("dashboardContactCount");
  const messageCount = document.getElementById("dashboardMessageCount");

  if (taskCount) taskCount.textContent = `${getTasks().length} Tasks`;
  if (contactCount) contactCount.textContent = `${getContacts().length} Contacts`;
  if (messageCount) messageCount.textContent = `${getUsers().length} Chats`;
}

function resetApp() {
  localStorage.clear();
  location.reload();
}

document.addEventListener("DOMContentLoaded", () => {
  initializeDemoData();

  renderContacts();
  renderTasks();
  renderUsers();
  renderDashboard();

  const users = getUsers();
  if (users.length) openChat(users[0].id);

  document.querySelectorAll("nav a").forEach(link => {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  });
});