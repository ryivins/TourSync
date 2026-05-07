/* =====================================================
   DEBUG CHECK
===================================================== */
console.log("TourSync script loaded");

/* =====================================================
   EMAILJS INIT (SAFE)
===================================================== */
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init("HM3mSVepzVht92z0r");
  }
})();

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
   TOURS
===================================================== */

function getTours() {
  return JSON.parse(localStorage.getItem("tours")) || [];
}

function saveTours(data) {
  localStorage.setItem("tours", JSON.stringify(data));
}

function renderTours() {
  const list = document.getElementById("tourList");
  if (!list) return;

  list.innerHTML = "";

  getTours().forEach(tour => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${tour.venue}</strong><br>
      ${tour.date} at ${tour.time}<br>
      ${tour.name} (${tour.email})<br><br>
    `;

    const btn = document.createElement("button");
    btn.textContent = "Add to Google Calendar";
    btn.onclick = () => addToGoogleCalendar(tour);

    li.appendChild(btn);
    list.appendChild(li);
  });
}

/* =====================================================
   CONTACTS (FULL CRUD)
===================================================== */

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(data) {
  localStorage.setItem("contacts", JSON.stringify(data));
}

/* ADD / UPDATE CONTACT */
function addContact() {

  const firstName = document.getElementById("firstName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const email = document.getElementById("email")?.value.trim();

  const editIdEl = document.getElementById("editId");
  const editId = editIdEl ? editIdEl.value : "";

  if (!firstName || !lastName) {
    alert("Enter first and last name");
    return;
  }

  let contacts = getContacts();

  if (editId) {
    contacts = contacts.map(c =>
      c.id === editId
        ? { ...c, firstName, lastName, phone: phone || "", email: email || "" }
        : c
    );
    editIdEl.value = "";
  } else {
    contacts.push({
      id: Date.now().toString(),
      firstName,
      lastName,
      phone: phone || "",
      email: email || ""
    });
  }

  saveContacts(contacts);

  renderContacts();
  renderContactPicker(); // IMPORTANT (for messaging system)

  ["firstName", "lastName", "phone", "email"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });
}

/* EDIT */
function editContact(id) {
  const contact = getContacts().find(c => c.id === id);
  if (!contact) return;

  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.value = val || "";
  };

  set("firstName", contact.firstName);
  set("lastName", contact.lastName);
  set("phone", contact.phone);
  set("email", contact.email);

  let editIdEl = document.getElementById("editId");
  if (!editIdEl) {
    editIdEl = document.createElement("input");
    editIdEl.type = "hidden";
    editIdEl.id = "editId";
    document.body.appendChild(editIdEl);
  }

  editIdEl.value = contact.id;
}

/* DELETE */
function deleteContact(id) {
  const updated = getContacts().filter(c => c.id !== id);
  saveContacts(updated);

  renderContacts();
  renderContactPicker();
}

/* RENDER CONTACTS + SEARCH */
function renderContacts() {
  const list = document.getElementById("contactList");
  if (!list) return;

  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";

  const contacts = getContacts().filter(c =>
    (c.firstName + " " + c.lastName).toLowerCase().includes(search)
  );

  list.innerHTML = "";

  if (contacts.length === 0) {
    list.innerHTML = "<li>No contacts found</li>";
    return;
  }

  contacts.forEach(c => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${c.firstName} ${c.lastName}</strong><br>
        ${c.phone || ""}<br>
        ${c.email || ""}<br><br>
      </div>

      <div>
        <button onclick="editContact('${c.id}')">Edit</button>
        <button onclick="deleteContact('${c.id}')" style="background:red;color:white;">
          Delete
        </button>
      </div>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   MESSAGES (SEARCH + CLICK SELECT SYSTEM)
===================================================== */
/* =====================================================
   MESSAGES (THREAD-BASED SYSTEM)
===================================================== */

/* CURRENT ACTIVE CHAT */
let activeChatPhone = "";

/* GET MESSAGES */
function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(data) {
  localStorage.setItem("messages", JSON.stringify(data));
}

/* FILTER MESSAGES FOR ACTIVE CHAT */
function getChatMessages(phone) {
  return getMessages().filter(m => m.recipientPhone === phone);
}

/* =====================================================
   CONTACT SEARCH (CLICK TO OPEN CHAT)
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
      <strong>${c.firstName} ${c.lastName}</strong><br>
      ${c.phone || ""}
    `;

    li.onclick = () => openChat(c.phone, c.firstName + " " + c.lastName);

    list.appendChild(li);
  });
}

/* =====================================================
   OPEN CHAT (CREATES MESSAGE BOARD)
===================================================== */

function openChat(phone, name) {
  activeChatPhone = phone;

  const title = document.getElementById("chatTitle");
  if (title) title.textContent = name;

  renderMessages();
}

/* =====================================================
   SEND MESSAGE (TO ACTIVE CHAT)
===================================================== */

function sendMessage() {

  const input = document.getElementById("messageInput");
  const text = input?.value.trim();

  if (!text) return;

  if (!activeChatPhone) {
    alert("Search and select a contact first");
    return;
  }

  const messages = getMessages();

  messages.push({
    id: Date.now().toString(),
    text,
    recipientPhone: activeChatPhone,
    time: new Date().toLocaleTimeString()
  });

  saveMessages(messages);

  input.value = "";
  renderMessages();
}

/* =====================================================
   RENDER CHAT THREAD
===================================================== */

function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  list.innerHTML = "";

  if (!activeChatPhone) {
    list.innerHTML = "<li>Select a contact to start chatting</li>";
    return;
  }

  const messages = getChatMessages(activeChatPhone);

  if (messages.length === 0) {
    list.innerHTML = "<li>No messages yet</li>";
    return;
  }

  messages.forEach(m => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>${m.text}</div>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   INIT UPDATE
===================================================== */

window.addEventListener("load", () => {
  renderContacts();
  renderContactPicker();
  renderMessages();
});