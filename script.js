function getContacts() {
  return JSON.parse(localStorage.getItem("contacts")) || [];
}

function saveContacts(contacts) {
  localStorage.setItem("contacts", JSON.stringify(contacts));
}

// ADD CONTACT
function addContact() {
  const first = document.getElementById("firstName").value.trim();
  const last = document.getElementById("lastName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();

  if (!first || !last) return;

  const contacts = getContacts();

  contacts.push({
    id: Date.now(),
    first,
    last,
    phone,
    email
  });

  contacts.sort((a, b) => a.last.localeCompare(b.last));

  saveContacts(contacts);
  renderContacts();

  document.getElementById("firstName").value = "";
  document.getElementById("lastName").value = "";
  document.getElementById("phone").value = "";
  document.getElementById("email").value = "";
}

// RENDER CONTACTS (with search)
function renderContacts() {
  const list = document.getElementById("contactList");
  const search = document.getElementById("searchInput")?.value.toLowerCase() || "";

  let contacts = getContacts();

  contacts = contacts.filter(c =>
    c.first.toLowerCase().includes(search) ||
    c.last.toLowerCase().includes(search) ||
    c.phone.toLowerCase().includes(search) ||
    c.email.toLowerCase().includes(search)
  );

  list.innerHTML = "";

  contacts.forEach(c => {
    const li = document.createElement("li");

    li.innerHTML = `
      <div>
        <strong>${c.last}, ${c.first}</strong><br>
        <a href="tel:${c.phone}">📞 ${c.phone}</a><br>
        <a href="mailto:${c.email}">✉️ ${c.email}</a>
      </div>

      <div class="actions">
        <button onclick="editContact(${c.id})">Edit</button>
        <span class="delete" onclick="deleteContact(${c.id})">✕</span>
      </div>
    `;

    list.appendChild(li);
  });
}

// DELETE CONTACT
function deleteContact(id) {
  let contacts = getContacts();
  contacts = contacts.filter(c => c.id !== id);

  saveContacts(contacts);
  renderContacts();
}

// EDIT CONTACT
function editContact(id) {
  let contacts = getContacts();
  const c = contacts.find(x => x.id === id);

  document.getElementById("firstName").value = c.first;
  document.getElementById("lastName").value = c.last;
  document.getElementById("phone").value = c.phone;
  document.getElementById("email").value = c.email;

  deleteContact(id);
}

// LOAD ON START
window.addEventListener("load", renderContacts);