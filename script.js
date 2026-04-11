function addTask() {
  const input = document.getElementById("taskInput");
  const taskText = input.value.trim();

  if (taskText === "") return;

  const li = document.createElement("li");
  li.innerHTML = `
    ${taskText}
    <span class="delete" onclick="this.parentElement.remove()">✕</span>
  `;

  document.getElementById("taskList").appendChild(li);
  input.value = "";
}