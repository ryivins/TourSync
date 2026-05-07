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
   CONTACTS
===================================================== */

function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(data) {
  localStorage.setItem("contacts", JSON.stringify(data));
}

/* =====================================================
   MESSAGES (THREAD SYSTEM)
===================================================== */

let activeChatPhone = "";

/* ---- STORAGE ---- */
function getMessages() {
  return JSON.parse(localStorage.getItem("messages")) || [];
}

function saveMessages(data) {
  localStorage.setItem("messages", JSON.stringify(data));
}

/* ---- FILTER BY CHAT ---- */
function getChatMessages(phone) {
  return getMessages().filter(m => m.recipientPhone === phone);
}

/* =====================================================
   CONTACT SEARCH -> OPEN CHAT
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

    const unreadCount = getChatMessages(c.phone).filter(m => !m.read).length;

    li.innerHTML = `
      <strong>${c.firstName} ${c.lastName}</strong><br>
      <small>${c.phone}</small>
      ${unreadCount ? `<span class="unread"> ${unreadCount}</span>` : ""}
    `;

    li.onclick = () => openChat(c.phone, c.firstName + " " + c.lastName);

    list.appendChild(li);
  });
}

/* =====================================================
   OPEN CHAT (THREAD SWITCH)
===================================================== */

function openChat(phone, name) {
  activeChatPhone = phone;

  const title = document.getElementById("chatTitle");
  if (title) title.textContent = name;

  // mark messages as read
  const messages = getMessages().map(m => {
    if (m.recipientPhone === phone) {
      m.read = true;
    }
    return m;
  });

  saveMessages(messages);

  renderMessages();
  renderContactPicker();
}

/* =====================================================
   SEND MESSAGE
===================================================== */

function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input?.value.trim();

  if (!text) return;

  if (!activeChatPhone) {
    alert("Select a contact first");
    return;
  }

  const messages = getMessages();

  messages.push({
    id: Date.now().toString(),
    text,
    recipientPhone: activeChatPhone,
    time: new Date().toLocaleTimeString(),
    read: true
  });

  saveMessages(messages);

  input.value = "";
  renderMessages();
  renderContactPicker();
}

/* =====================================================
   RENDER CHAT THREAD (BUBBLES)
===================================================== */

function renderMessages() {
  const list = document.getElementById("messageList");
  if (!list) return;

  list.innerHTML = "";

  if (!activeChatPhone) {
    list.innerHTML = "<li class='system-msg'>Select a contact to start chatting</li>";
    return;
  }

  const messages = getChatMessages(activeChatPhone);

  if (messages.length === 0) {
    list.innerHTML = "<li class='system-msg'>No messages yet</li>";
    return;
  }

  messages.forEach(m => {
    const li = document.createElement("li");

    const isMe = true; // since you're only sending from your side

    li.className = isMe ? "msg me" : "msg them";

    li.innerHTML = `
      <div>${m.text}</div>
      <small>${m.time}</small>
    `;

    list.appendChild(li);
  });
}

/* =====================================================
   INIT
===================================================== */

window.addEventListener("load", () => {
  renderContactPicker();
  renderMessages();
});