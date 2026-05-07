/* =====================================================
   TOURSYNC CORE SCRIPT (CLEAN REWRITE)
===================================================== */

console.log("TourSync script loaded");

/* =====================================================
   SAFE STORAGE HELPERS
===================================================== */

function safeId() {
  return crypto?.randomUUID?.() || Date.now().toString();
}

function getLS(key) {
  return JSON.parse(localStorage.getItem(key)) || [];
}

function setLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/* =====================================================
   AUTH
===================================================== */

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("tourCurrentUser"));
}

function setCurrentUser(user) {
  localStorage.setItem("tourCurrentUser", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("tourCurrentUser");
  window.location.href = "login.html";
}

/* =====================================================
   LOGIN / REGISTER
===================================================== */

function loginUser() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) return alert("Enter login info");

  const users = getLS("tourUsers");

  const found = users.find(
    u => u.username === username && u.password === password
  );

  if (!found) return alert("Invalid login");

  setCurrentUser(found);
  window.location.href = "index.html";
}

function registerUser() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) return alert("Enter username + password");

  const users = getLS("tourUsers");

  if (users.find(u => u.username === username)) {
    return alert("User already exists");
  }

  users.push({ username, password });
  setLS("tourUsers", users);

  alert("Account created!");
}

/* =====================================================
   CONTACTS (UPDATED: EDIT + DELETE)
===================================================== */

let editingContactId = null;

function getContacts() {
  return getLS("contacts");
}

function saveContacts(data) {
  setLS("contacts", data);
}

function addContact() {
  const firstName = document.getElementById("firstName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const email = document.getElementById("email")?.value.trim();

  if (!firstName || !lastName) return alert("Enter name");

  const contacts = getContacts();

  if (editingContactId) {
    const index = contacts.findIndex(c => c.id === editingContactId);

    if (index !== -1) {
      contacts[index] = {
        ...contacts[index],
        firstName,
        lastName,
        phone: phone || "",
        email: email || ""
      };
    }

    editingContactId = null;
  } else {
    contacts.push({
      id: safeId(),
      firstName,
      lastName,
      phone: phone || "",
      email: email || ""
    });
  }

  saveContacts(contacts);

  clearContactForm();
  renderContacts();
  renderContactPicker();
}

function renderContacts() {
  const list = document.getElementById("contactList");
  if (!list) return;

  const contacts = getContacts();

  list.innerHTML = contacts.length ? "" : "<li>No contacts yet</li>";

  contacts.forEach(c => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${c.firstName} ${c.lastName}</strong><br>
        ${c.phone || ""}<br>
        ${c.email || ""}
      </div>

      <div style="margin-top:10px;">
        <button onclick="editContact('${c.id}')">Edit</button>
        <button onclick="deleteContact('${c.id}')" style="background:red;color:white;">
          Delete
        </button>
      </div>
    `;

    list.appendChild(li);
  });
}

function editContact(id) {
  const contact = getContacts().find(c => c.id === id);
  if (!contact) return;

  document.getElementById("firstName").value = contact.firstName;
  document.getElementById("lastName").value = contact.lastName;
  document.getElementById("phone").value = contact.phone;
  document.getElementById("email").value = contact.email;

  editingContactId = id;
}

function deleteContact(id) {
  if (!confirm("Delete this contact?")) return;

  let contacts = getContacts().filter(c => c.id !== id);
  saveContacts(contacts);

  if (editingContactId === id) {
    editingContactId = null;
    clearContactForm();
  }

  renderContacts();
  renderContactPicker();
}

function clearContactForm() {
  ["firstName", "lastName", "phone", "email"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

/* =====================================================
   CONTACT PICKER (MESSAGES)
===================================================== */

function renderContactPicker() {
  const input = document.getElementById("contactSearch");
  const list = document.getElementById("contactPicker");
  if (!input || !list) return;

  const search = input.value.toLowerCase();

  const contacts = getContacts().filter(c =>
    (c.firstName + " " + c.lastName).toLowerCase().includes(search)
  );

  list.innerHTML = "";

  contacts.forEach(c => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${c.firstName} ${c.lastName}</strong>
      <small>${c.phone || ""}</small>
    `;

    li.onclick = () => openChat(c.phone, `${c.firstName} ${c.lastName}`);

    list.appendChild(li);
  });
}

/* =====================================================
   MESSAGES
===================================================== */

let activeChatPhone = "";

function getMessages() {
  return getLS("messages");
}

function saveMessages(data) {
  setLS("messages", data);
}

function openChat(phone, name) {
  activeChatPhone = phone;

  const title = document.getElementById("chatTitle");
  if (title) title.textContent = name;

  const messages = getMessages().map(m => {
    if (m.recipientPhone === phone) m.read = true;
    return m;
  });

  saveMessages(messages);

  renderMessages();
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input?.value.trim();

  if (!text || !activeChatPhone) return;

  const messages = getMessages();

  messages.push({
    id: safeId(),
    text,
    recipientPhone: activeChatPhone,
    time: new Date().toLocaleTimeString(),
    read: true
  });

  saveMessages(messages);

  input.value = "";
  renderMessages();
}

function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  list.innerHTML = "";

  if (!activeChatPhone) {
    list.innerHTML = "<li>Select a contact</li>";
    return;
  }

  const messages = getMessages().filter(
    m => m.recipientPhone === activeChatPhone
  );

  if (!messages.length) {
    list.innerHTML = "<li>No messages yet</li>";
    return;
  }

  messages.forEach(m => {
    const li = document.createElement("li");

    li.className = "msg me";

    li.innerHTML = `
      <div>${m.text}</div>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   TASKS (UNCHANGED BUT CLEAN)
===================================================== */

function getTasks() {
  return getLS("tasks");
}

function saveTasks(tasks) {
  setLS("tasks", tasks);
}

function addTask() {
  const text = document.getElementById("taskInput")?.value.trim();
  const priority = document.getElementById("taskPriority")?.value;
  const dueDate = document.getElementById("taskDueDate")?.value;
  const assignee = document.getElementById("taskAssignee")?.value;

  if (!text) return;

  const tasks = getTasks();

  tasks.push({
    id: safeId(),
    text,
    priority,
    dueDate,
    assignee,
    done: false
  });

  saveTasks(tasks);

  document.getElementById("taskInput").value = "";

  renderTasks();
  updateTaskStats();
}

function toggleTask(id) {
  const tasks = getTasks().map(t => {
    if (t.id === id) t.done = !t.done;
    return t;
  });

  saveTasks(tasks);
  renderTasks();
  updateTaskStats();
}

function deleteTask(id) {
  const tasks = getTasks().filter(t => t.id !== id);
  saveTasks(tasks);

  renderTasks();
  updateTaskStats();
}

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  const tasks = getTasks();

  list.innerHTML = tasks.length ? "" : "<li>No tasks yet</li>";

  tasks.forEach(t => {
    const li = document.createElement("li");

    li.className = "task";

    li.innerHTML = `
      <div onclick="toggleTask('${t.id}')" style="cursor:pointer;">
        ${t.done ? "✅ " : ""}${t.text}
      </div>

      <small>
        ${t.priority || ""} |
        ${t.dueDate || ""} |
        ${t.assignee || ""}
      </small>

      <button onclick="deleteTask('${t.id}')">Delete</button>
    `;

    list.appendChild(li);
  });
}

function updateTaskStats() {
  const tasks = getTasks();

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  };

  set("statHigh", tasks.filter(t => t.priority === "high").length);
  set("statMedium", tasks.filter(t => t.priority === "medium").length);
  set("statLow", tasks.filter(t => t.priority === "low").length);
}

/* =====================================================
   INIT
===================================================== */

window.addEventListener("load", () => {
  renderContacts();
  renderContactPicker();
  renderMessages();
  renderTasks();
  updateTaskStats();
});