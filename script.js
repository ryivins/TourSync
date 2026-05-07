/* =====================================================
   DEBUG
===================================================== */
console.log("TourSync script loaded");

/* =====================================================
   EMAILJS INIT
===================================================== */
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("HM3mSVepzVht92z0r");
  }
})();

/* =====================================================
   SAFE ID HELPER
===================================================== */
function safeId() {
  return (crypto?.randomUUID?.() || Date.now().toString());
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
   CONTACTS (FIXED STORAGE)
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

  if (!firstName || !lastName) return alert("Enter first + last name");

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

  renderContacts?.();
  renderContactPicker?.();
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

/* CONTACT PICKER */
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
      <strong>${c.firstName} ${c.lastName}</strong><br>
      <small>${c.phone || ""}</small>
    `;

    li.onclick = () => openChat(c.phone, `${c.firstName} ${c.lastName}`);

    list.appendChild(li);
  });
}

/* OPEN CHAT */
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
  renderContactPicker();
}

/* SEND MESSAGE */
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

/* RENDER CHAT */
function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  list.innerHTML = "";

  if (!activeChatPhone) {
    list.innerHTML = "<li class='system-msg'>Select a contact</li>";
    return;
  }

  const messages = getChatMessages(activeChatPhone);

  if (!messages.length) {
    list.innerHTML = "<li class='system-msg'>No messages yet</li>";
    return;
  }

  messages.forEach(m => {
    const li = document.createElement("li");

    const isMe = true; // (you can upgrade later for incoming messages)

    li.className = isMe ? "msg me" : "msg them";

    li.innerHTML = `
      <div>${m.text}</div>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   TASKS (FIXED + STATS READY)
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

    li.className = `task ${t.priority || ""}`;

    li.innerHTML = `
      <div onclick="toggleTask('${t.id}')" style="cursor:pointer;">
        ${t.done ? "✅ " : ""}${t.text}
      </div>

      <small>
        ${t.priority || "none"} |
        ${t.dueDate || "no date"} |
        ${t.assignee || "unassigned"}
      </small>

      <button onclick="deleteTask('${t.id}')">Delete</button>
    `;

    list.appendChild(li);
  });
}

/* TASK STATS (FIXED MISSING FUNCTION) */
function updateTaskStats() {
  const tasks = getTasks();

  const high = tasks.filter(t => t.priority === "high").length;
  const medium = tasks.filter(t => t.priority === "medium").length;
  const low = tasks.filter(t => t.priority === "low").length;

  const el = (id) => document.getElementById(id);

  if (el("statHigh")) el("statHigh").textContent = high;
  if (el("statMedium")) el("statMedium").textContent = medium;
  if (el("statLow")) el("statLow").textContent = low;
}

/* =====================================================
   INIT
===================================================== */
window.addEventListener("load", () => {
  renderTasks();
  renderContactPicker();
  renderMessages();
  updateTaskStats();
});