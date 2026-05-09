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

  list.innerHTML = "";

  const contacts = getContacts();

  if (contacts.length === 0) {
    list.innerHTML = `
      <li class="empty-state">No contacts yet. Add your first contact above.</li>
    `;
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

function openContact(contactId) {
  selectedContactId = contactId;

  const contact = getContacts().find(c => c.id === contactId);
  if (!contact) return;

  const details = document.getElementById("contactDetails");

  details.innerHTML = `
    <div class="card">

      <h3>${contact.first} ${contact.last}</h3>

      <p><strong>Phone:</strong> ${contact.phone || "N/A"}</p>
      <p><strong>Email:</strong> ${contact.email || "N/A"}</p>

      <hr style="margin: 10px 0; opacity: 0.3;">

      <label><strong>Notes</strong></label>

      <textarea id="contactNotes" class="input" rows="6"
        placeholder="Add notes...">${contact.notes || ""}</textarea>

      <div style="margin-top: 10px; display:flex; gap:10px;">

        <button class="btn btn-primary"
          onclick="saveContactNotes('${contact.id}')">
          Save Notes
        </button>

        <button class="btn btn-secondary"
          onclick="editContact('${contact.id}')">
          Edit Contact
        </button>

      </div>

    </div>
  `;

  renderContacts();
}
function saveContactNotes(id) {
  const contacts = getContacts();

  const notesEl = document.getElementById("contactNotes");

  const updated = contacts.map(c => {
    if (c.id === id) {
      return {
        ...c,
        notes: notesEl ? notesEl.value : ""
      };
    }
    return c;
  });

  saveContacts(updated);
  renderContacts();
}


function editContact(id) {
  const contacts = getContacts();

  const updated = contacts.map(c => {
    if (c.id !== id) return c;

    const first = prompt("Edit first name:", c.first) || c.first;
    const last = prompt("Edit last name:", c.last) || c.last;
    const phone = prompt("Edit phone:", c.phone) || c.phone;
    const email = prompt("Edit email:", c.email) || c.email;

    return {
      ...c,
      first,
      last,
      phone,
      email
    };
  });

  saveContacts(updated);
  renderContacts();
  openContact(id); // refresh panel
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
  saveTasks(getTasks().map(t => t.id === id ? { ...t, done: !t.done } : t));
  renderTasks();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  getTasks().forEach(t => {
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

    li.appendChild(checkbox);
    li.appendChild(text);
    li.appendChild(document.createElement("br"));
    li.appendChild(meta);

    list.appendChild(li);
  });
}

/* =========================
   MESSAGING SYSTEM (FIXED)
========================= */

let currentChatUser = null;

/* ---------- STORAGE ---------- */

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

/* ---------- CHAT KEY ---------- */

function getChatId(a, b) {
  return [a, b].sort().join("__");
}

/* ---------- DEMO DATA (HARD RESET SAFE) ---------- */

function initializeDemoData() {
  if (!getActiveUser()) {
    setActiveUser("me");
  }

  let users = getUsers();

  if (!Array.isArray(users) || users.length === 0) {
    users = [
      { id: "u1", name: "Matt Klein" },
      { id: "u2", name: "Sidney Castillo" },
      { id: "u3", name: "Jonah Payne" }
    ];
    saveUsers(users);
  }

  const me = getActiveUser();

  const chats = {};

  chats[getChatId(me, "u1")] = [
    { from: "u1", text: "Hey, are we still meeting?", time: "9:04 AM" },
    { from: me, text: "Yes — 2pm at the museum entrance.", time: "9:06 AM" }
  ];

  chats[getChatId(me, "u2")] = [
    { from: "u2", text: "Got the schedule 👍", time: "8:12 AM" },
    { from: me, text: "Perfect, I added the new venue.", time: "8:15 AM" }
  ];

  chats[getChatId(me, "u3")] = [
    { from: "u3", text: "I'll check it out", time: "7:58 AM" },
    { from: me, text: "Cool — let me know if anything changes.", time: "8:05 AM" }
  ];

  saveChats(chats);
}

/* ---------- SIDEBAR ---------- */

function getLastMessage(me, other) {
  const chats = getChats();
  const id = getChatId(me, other);
  const msgs = chats[id];

  if (!msgs || !msgs.length) return "No messages yet";

  const last = msgs[msgs.length - 1];
  return `${last.from}: ${last.text}`;
}

function renderUsers() {
  const list = document.getElementById("userList");
  if (!list) return;

  const users = getUsers();
  const me = getActiveUser();

  list.innerHTML = "";

  users.forEach(u => {
    const li = document.createElement("li");
    li.className = "chat-preview";

    const name = document.createElement("strong");
    name.textContent = u.name;

    const preview = document.createElement("small");
    preview.textContent = getLastMessage(me, u.id);

    li.appendChild(name);
    li.appendChild(document.createElement("br"));
    li.appendChild(preview);

    li.onclick = () => openChat(u.id);

    list.appendChild(li);
  });
}

/* ---------- CHAT ---------- */

function openChat(userId) {
  currentChatUser = userId;

  const user = getUsers().find(u => u.id === userId);

  const title = document.getElementById("chatTitle");
  if (title) title.textContent = "Chat with " + (user?.name || userId);

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
  renderUsers();
}

function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  const me = getActiveUser();

  if (!currentChatUser) {
    list.innerHTML = "<li>Select a conversation</li>";
    return;
  }

  const chats = getChats();
  const id = getChatId(me, currentChatUser);
  const messages = chats[id] || [];

  list.innerHTML = "";

  messages.forEach(m => {
    const li = document.createElement("li");
    li.className = `msg ${m.from === me ? "me" : "them"}`;

    const text = document.createElement("div");
    text.textContent = m.text;

    const meta = document.createElement("small");
    meta.textContent = `${m.from} • ${m.time}`;

    li.appendChild(text);
    li.appendChild(meta);

    list.appendChild(li);
  });

  list.scrollTop = list.scrollHeight;
}

/* =========================
   INIT (FINAL FIX)
========================= */
/* =========================
   DASHBOARD
========================= */

function renderDashboard() {

  const taskCount =
    document.getElementById("dashboardTaskCount");

  const contactCount =
    document.getElementById("dashboardContactCount");

  const messageCount =
    document.getElementById("dashboardMessageCount");

  if (taskCount) {

    const activeTasks =
      getTasks().filter(t => !t.done).length;

    taskCount.textContent =
      `${activeTasks} Active Tasks`;
  }

  if (contactCount) {

    contactCount.textContent =
      `${getContacts().length} Contacts`;
  }

  if (messageCount) {

    messageCount.textContent =
      `${getUsers().length} Conversations`;
  }
}

window.addEventListener("load", () => {

  initializeDemoData();

  renderDashboard();

  renderContacts();

  renderTasks();

  renderTaskStats?.();

  renderUsers();

  const users = getUsers();

  if (users.length) {
    openChat(users[0].id);
  }
});