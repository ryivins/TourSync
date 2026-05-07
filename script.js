/* =====================================================
   TOURSYNC MAIN SCRIPT (CLEAN + FIXED)
===================================================== */

console.log("TourSync script loaded");

/* =====================================================
   SAFE ID HELPER
===================================================== */
function safeId() {
  return crypto?.randomUUID?.() || Date.now().toString();
}

/* =====================================================
   EMAILJS INIT
===================================================== */
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("HM3mSVepzVht92z0r");
  }
})();

/* =====================================================
   LOGIN SYSTEM
===================================================== */

function getCurrentUser() {
  return JSON.parse(localStorage.getItem("tourCurrentUser"));
}

function setCurrentUser(user) {
  localStorage.setItem("tourCurrentUser", JSON.stringify(user));
}

function requireLogin() {
  const user = getCurrentUser();
  if (!user) window.location.href = "login.html";
}

function loginUser() {
  const username = document.getElementById("username")?.value.trim();
  const password = document.getElementById("password")?.value.trim();

  if (!username || !password) return alert("Enter login info");

  const users = JSON.parse(localStorage.getItem("tourUsers")) || [];

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

  const users = JSON.parse(localStorage.getItem("tourUsers")) || [];

  if (users.find(u => u.username === username)) {
    return alert("User already exists");
  }

  users.push({ username, password });
  localStorage.setItem("tourUsers", JSON.stringify(users));

  alert("Account created! You can now log in.");
}

/* =====================================================
   GOOGLE CALENDAR
===================================================== */

function addToGoogleCalendar(tour) {
  const title = encodeURIComponent(`TourSync Event - ${tour.venue}`);
  const details = encodeURIComponent(`Tour with ${tour.name}`);
  const location = encodeURIComponent(tour.venue);

  const startDate = formatDateTimeForCalendar(tour.date, tour.time);
  const endDate = startDate;

  const url =
    `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;

  window.open(url, "_blank");
}

function formatDateTimeForCalendar(date, time) {
  if (!date || !time) return "";

  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);

  const utc = new Date(Date.UTC(y, m - 1, d, h, min));

  return utc.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

/* =====================================================
   CONTACTS (FIXED + RELIABLE STORAGE)
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

  if (!firstName || !lastName) return alert("Enter name");

  const contacts = getContacts();

  contacts.push({
    id: safeId(),
    firstName,
    lastName,
    phone: phone || "",
    email: email || ""
  });

  saveContacts(contacts);

  ["firstName","lastName","phone","email"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  renderContacts();
  renderContactPicker();
}

function renderContacts() {
  const list = document.getElementById("contactList");
  if (!list) return;

  const contacts = getContacts();

  list.innerHTML = "";

  if (!contacts.length) {
    list.innerHTML = "<li>No contacts yet</li>";
    return;
  }

  contacts.forEach(c => {
    const li = document.createElement("li");
    li.innerHTML = `
      <strong>${c.firstName} ${c.lastName}</strong><br>
      ${c.phone}<br>
      ${c.email}
    `;
    list.appendChild(li);
  });
}

/* =====================================================
   MESSAGES
===================================================== */

let activeChatPhone = "";

function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(data) {
  localStorage.setItem("messages", JSON.stringify(data));
}

function getChatMessages(phone) {
  return getMessages().filter(m => m.recipientPhone === phone);
}

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

    li.innerHTML = `<strong>${c.firstName} ${c.lastName}</strong>`;

    li.onclick = () => openChat(c.phone, `${c.firstName} ${c.lastName}`);

    list.appendChild(li);
  });
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

  const messages = getChatMessages(activeChatPhone);

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
   TASKS (FULL FIXED SYSTEM)
===================================================== */

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(tasks) {
  localStorage.setItem("tasks", JSON.stringify(tasks));
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

  list.innerHTML = "";

  if (!tasks.length) {
    list.innerHTML = "<li>No tasks yet</li>";
    return;
  }

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