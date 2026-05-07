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

  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  const utc = new Date(Date.UTC(year, month - 1, day, hour, minute));

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

function scheduleTour() {

  const name = document.getElementById("tourName")?.value.trim();
  const email = document.getElementById("tourEmail")?.value.trim();
  const venue = document.getElementById("tourVenue")?.value.trim();
  const date = document.getElementById("tourDate")?.value;
  const time = document.getElementById("tourTime")?.value;

  if (!name || !email || !venue || !date || !time) {
    alert("Please complete all tour fields.");
    return;
  }

  const templateParams = { name, email, venue, date, time };

  emailjs.send("service_g3o4rfy", "template_e2asduq", templateParams)
    .then(() => {

      const tours = getTours();

      tours.push({
        id: Date.now().toString(),
        name,
        email,
        venue,
        date,
        time
      });

      saveTours(tours);

      alert("Tour scheduled + email sent!");

      renderTours();

      document.getElementById("tourName").value = "";
      document.getElementById("tourEmail").value = "";
      document.getElementById("tourVenue").value = "";
      document.getElementById("tourDate").value = "";
      document.getElementById("tourTime").value = "";

    })
    .catch(err => {
      console.error(err);
      alert("Email failed to send.");
    });
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
   CONTACTS
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
  const email =
    document.getElementById("contactEmail")?.value.trim() ||
    document.getElementById("email")?.value.trim();

  if (!firstName || !lastName) {
    alert("Please enter first and last name");
    return;
  }

  const contacts = getContacts();

  contacts.push({
    id: Date.now().toString(),
    firstName,
    lastName,
    phone: phone || "",
    email: email || ""
  });

  saveContacts(contacts);

  renderContacts();
  loadRecipients();

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("phone").value = "";

  if (document.getElementById("contactEmail")) {
    document.getElementById("contactEmail").value = "";
  }
  if (document.getElementById("email")) {
    document.getElementById("email").value = "";
  }
}

function renderContacts() {

  const list = document.getElementById("contactList");
  if (!list) return;

  const search =
    document.getElementById("searchInput")?.value.toLowerCase() || "";

  list.innerHTML = "";

  getContacts()
    .filter(c =>
      (c.firstName + " " + c.lastName)
        .toLowerCase()
        .includes(search)
    )
    .forEach(c => {

      const li = document.createElement("li");

      li.innerHTML = `
        <strong>${c.firstName} ${c.lastName}</strong><br>
        ${c.phone || ""}<br>
        ${c.email || ""}
      `;

      list.appendChild(li);
    });
}

/* =====================================================
   MESSAGES
===================================================== */

function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(data) {
  localStorage.setItem("messages", JSON.stringify(data));
}

/* LOAD CONTACTS INTO DROPDOWN */
function loadRecipients() {

  const select = document.getElementById("messageRecipient");
  if (!select) return;

  const contacts = getContacts();

  select.innerHTML = `<option value="">Select contact</option>`;

  contacts.forEach(c => {

    if (!c.email) return;

    const option = document.createElement("option");
    option.value = c.email;
    option.textContent = `${c.firstName} ${c.lastName}`;

    select.appendChild(option);
  });
}

function sendMessage() {

  const input = document.getElementById("messageInput");
  const text = input?.value.trim();

  const recipient = document.getElementById("messageRecipient")?.value;

  if (!text) return;

  if (!recipient) {
    alert("Please select a contact first");
    return;
  }

  const messages = getMessages();

  messages.push({
    id: Date.now().toString(),
    text,
    recipient,
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
      <small>To: ${m.recipient}</small><br>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   TASKS (SAFE PLACEHOLDER)
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
}

/* =====================================================
   INIT
===================================================== */

window.addEventListener("load", () => {

  renderContacts();
  renderMessages();
  loadRecipients();
  renderTasks();
  renderTours();
});