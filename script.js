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
   CONTACTS (FULL CRUD: ADD / SEARCH / DELETE / EDIT)
===================================================== */

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(data) {
  localStorage.setItem("contacts", JSON.stringify(data));
}

/* ADD OR UPDATE CONTACT */
function addContact() {

  const firstName = document.getElementById("firstName")?.value.trim();
  const lastName = document.getElementById("lastName")?.value.trim();
  const phone = document.getElementById("phone")?.value.trim();
  const email = document.getElementById("email")?.value.trim();
  const editId = document.getElementById("editId")?.value;

  if (!firstName || !lastName) {
    alert("Enter first and last name");
    return;
  }

  let contacts = getContacts();

  if (editId) {
    contacts = contacts.map(c =>
      c.id === editId
        ? { ...c, firstName, lastName, phone, email }
        : c
    );

    document.getElementById("editId").value = "";
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
  loadRecipients();

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
}

/* EDIT CONTACT */
function editContact(id) {

  const contact = getContacts().find(c => c.id === id);
  if (!contact) return;

  document.getElementById("firstName").value = contact.firstName;
  document.getElementById("lastName").value = contact.lastName;
  document.getElementById("phone").value = contact.phone;
  document.getElementById("email").value = contact.email;

  document.getElementById("editId").value = contact.id;
}

/* DELETE CONTACT */
function deleteContact(id) {

  let contacts = getContacts().filter(c => c.id !== id);

  saveContacts(contacts);

  renderContacts();
  loadRecipients();
}

/* RENDER + SEARCH */
function renderContacts() {

  const list = document.getElementById("contactList");
  if (!list) return;

  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";

  const contacts = getContacts();

  list.innerHTML = "";

  const filtered = contacts.filter(c =>
    (c.firstName + " " + c.lastName)
      .toLowerCase()
      .includes(search)
  );

  if (filtered.length === 0) {
    list.innerHTML = "<li>No contacts found</li>";
    return;
  }

  filtered.forEach(c => {

    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${c.firstName} ${c.lastName}</strong><br>
      ${c.phone || ""}<br>
      ${c.email || ""}<br><br>

      <button onclick="editContact('${c.id}')">Edit</button>
      <button onclick="deleteContact('${c.id}')"
        style="background:red;color:white;border:none;padding:5px;margin-left:5px;">
        Delete
      </button>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   MESSAGES (PHONE-BASED SYSTEM)
===================================================== */

function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(data) {
  localStorage.setItem("messages", JSON.stringify(data));
}

/* LOAD CONTACTS INTO PHONE DROPDOWN */
function loadRecipients() {

  const select = document.getElementById("messageRecipient");
  if (!select) return;

  const contacts = getContacts();

  select.innerHTML = `<option value="">Select contact</option>`;

  contacts.forEach(c => {

    if (!c.phone) return;

    const option = document.createElement("option");
    option.value = c.phone;
    option.textContent = `${c.firstName} ${c.lastName} (${c.phone})`;

    select.appendChild(option);
  });
}

/* SEND MESSAGE */
function sendMessage() {

  const text = document.getElementById("messageInput")?.value.trim();
  const recipientPhone = document.getElementById("messageRecipient")?.value;

  if (!text) return;

  if (!recipientPhone) {
    alert("Select a contact first");
    return;
  }

  const messages = getMessages();

  messages.push({
    id: Date.now().toString(),
    text,
    recipientPhone,
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
   TASKS (SAFE STUB)
===================================================== */

function getTasks() {
  return JSON.parse(localStorage.getItem("tasks")) || [];
}

function saveTasks(data) {
  localStorage.setItem("tasks", JSON.stringify(data));
}

/* =====================================================
   INIT
===================================================== */

window.addEventListener("load", () => {

  console.log("INIT running");

  renderContacts();
  renderMessages();
  loadRecipients();
  renderTasks?.();
  renderTours?.();
});