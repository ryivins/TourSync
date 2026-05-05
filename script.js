/* =====================================================
   AUTH (Firebase kept but isolated)
===================================================== */

function signUp() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.createUserWithEmailAndPassword(email, password)
    .then(() => alert("Account created!"))
    .catch(err => alert(err.message));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  auth.signInWithEmailAndPassword(email, password)
    .then(() => alert("Logged in!"))
    .catch(err => alert(err.message));
}

/* =====================================================
   CONTACTS (STANDARDIZED)
===================================================== */

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(data) {
  localStorage.setItem("contacts", JSON.stringify(data));
}

function addContact() {
  const firstName = document.getElementById("firstName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const email = document.getElementById("email")?.value.trim();

  if (!firstName || !lastName) return;

  const contacts = getContacts();

  contacts.push({
    id: Date.now().toString(),
    firstName,
    lastName,
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
  const contacts = getContacts();

  list.innerHTML = "";

  contacts
    .filter(c =>
      (c.firstName + " " + c.lastName).toLowerCase().includes(search)
    )
    .forEach((c, index) => {
      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${c.firstName} ${c.lastName}</strong><br>
        ${c.phone || ""}<br>
        ${c.email || ""}<br><br>
        <button onclick="deleteContact(${index})">Delete</button>
      `;

      list.appendChild(li);
    });
}

function deleteContact(index) {
  const contacts = getContacts();
  contacts.splice(index, 1);
  saveContacts(contacts);
  renderContacts();
}

/* =====================================================
   TASKS (STANDARDIZED)
===================================================== */

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(data) {
  localStorage.setItem("tasks", JSON.stringify(data));
}

function addTask() {
  const text = document.getElementById("taskInput")?.value.trim();
  if (!text) return;

  const tasks = getTasks();

  tasks.push({
    id: Date.now().toString(),
    text,
    priority: document.getElementById("taskPriority")?.value || "medium",
    dueDate: document.getElementById("taskDueDate")?.value || "",
    assignedTo: document.getElementById("taskAssignee")?.value || "",
    done: false
  });

  saveTasks(tasks);
  renderTasks();

  document.getElementById("taskInput").value = "";
  document.getElementById("taskDueDate").value = "";
  document.getElementById("taskAssignee").value = "";
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

function renderTasks() {
  const list = document.getElementById("taskList");
  if (!list) return;

  list.innerHTML = "";

  getTasks().forEach(t => {
    const li = document.createElement("li");

    li.className = `task ${t.priority} ${t.done ? "done" : ""}`;

    li.innerHTML = `
      <input type="checkbox" ${t.done ? "checked" : ""} onclick="toggleTask('${t.id}')">
      <strong>${t.text}</strong><br>
      ${t.dueDate || "No due date"} | ${t.assignedTo || "Unassigned"}
      <br><br>
      <button onclick="deleteTask('${t.id}')">Delete</button>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   MESSAGES (SIMPLIFIED FOR OPTION A)
===================================================== */

function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(data) {
  localStorage.setItem("messages", JSON.stringify(data));
}

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input?.value.trim();

  if (!text) return;

  const messages = getMessages();

  messages.push({
    id: Date.now().toString(),
    text,
    time: new Date().toLocaleTimeString()
  });

  saveMessages(messages);
  renderMessages();

  input.value = "";
}

function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  list.innerHTML = "";

  getMessages().forEach(m => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>${m.text}</div>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   USERS (FOR SIDEBAR COMPATIBILITY)
===================================================== */

function renderUsers() {
  const list = document.getElementById("userList");
  if (!list) return;

  list.innerHTML = `
    <li class="chat-preview">
      <strong>General Chat</strong><br>
      <small>Click to view messages</small>
    </li>
  `;
}

/* =====================================================
   INIT
===================================================== */

window.addEventListener("load", () => {
  renderContacts();
  renderTasks();
  renderMessages();
  renderUsers();
});