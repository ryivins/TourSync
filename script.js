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

let selectedPhone = "";

/* CONTACT SEARCH FOR MESSAGES */
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
    li.textContent = `${c.firstName} ${c.lastName} (${c.phone})`;

    li.style.cursor = "pointer";
    li.onclick = () => {
      selectedPhone = c.phone;
      alert(`Selected: ${c.firstName} ${c.lastName}`);
    };

    list.appendChild(li);
  });
}

/* MESSAGES STORAGE */
function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(data) {
  localStorage.setItem("messages", JSON.stringify(data));
}

/* SEND MESSAGE */
function sendMessage() {

  const text = document.getElementById("messageInput")?.value.trim();

  if (!text) return;

  if (!selectedPhone) {
    alert("Select a contact from search first");
    return;
  }

  const messages = getMessages();

  messages.push({
    id: Date.now().toString(),
    text,
    recipientPhone: selectedPhone,
    time: new Date().toLocaleTimeString()
  });

  saveMessages(messages);
  renderMessages();

  document.getElementById("messageInput").value = "";
}

/* RENDER MESSAGES */
function renderMessages() {

  const list = document.getElementById("messageList");
  if (!list) return;

  list.innerHTML = "";

  getMessages().forEach(m => {

    const li = document.createElement("li");

    li.innerHTML = `
      <div>${m.text}</div>
      <small>To: ${m.recipientPhone}</small><br>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   INIT
===================================================== */

window.addEventListener("load", () => {

  renderContacts();
  renderMessages();
  renderContactPicker();
  renderTours();

  if (typeof renderTasks === "function") renderTasks();
});