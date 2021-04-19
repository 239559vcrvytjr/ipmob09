// Database initialization

var db;
const dbRequest = indexedDB.open("clients", 1);
const table = document.getElementById("table");

dbRequest.addEventListener("success", (e) => {
  db = e.target.result;

  const transaction = db.transaction(["clientsStore"], "readonly");
  const store = transaction.objectStore("clientsStore");
  const cursor = store.openCursor();

  cursor.addEventListener("success", (e) => {
    const c = e.target.result;
    if (c) {
      addClientRow(c.value);
      c.continue();
    }
  });
});

dbRequest.addEventListener("upgradeneeded", (e) => {
  db = e.target.result;
  db.createObjectStore("clientsStore", {
    keyPath: "id",
    autoIncrement: true,
  });
});

// Handle read/write

function addClient(data) {
  const transaction = db.transaction(["clientsStore"], "readwrite");
  const store = transaction.objectStore("clientsStore");
  const addRequest = store.add(data);

  addRequest.addEventListener("success", (e) => {
    addClientRow({ ...data, id: e.target.result });
  });
}

function deleteClient(id) {
  const transaction = db.transaction(["clientsStore"], "readwrite");
  const store = transaction.objectStore("clientsStore");
  const deleteRequest = store.delete(id);

  deleteRequest.addEventListener("success", () => {
    deleteClientRow(id);
  });
}

// DOM manipulation

function addClientRow(data) {
  const tableRowData = [
    data.id,
    data.firstName,
    data.lastName,
    data.address,
    data.phoneNumber,
    data.email,
    data.pesel,
    data.identity,
    data.business,
    data.businessName,
    data.nip,
    data.marketing,
  ];

  const tableRow = table.insertRow(-1);
  tableRow.id = `tableRow${data.id}`;

  for (const colData of tableRowData) {
    const tableCell = tableRow.insertCell(-1);
    tableCell.innerHTML = colData || "";
  }

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Usuń";
  deleteButton.addEventListener("click", () => {
    deleteClient(data.id);
  });

  const deleteButtonCell = tableRow.insertCell(-1);
  deleteButtonCell.appendChild(deleteButton);
}

function deleteClientRow(id) {
  document.getElementById(`tableRow${id}`).remove();
}

// Handling form data

const formElem = document.getElementById("form");

formElem.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(formElem));
  data["business"] = !!data["business"];
  data["marketing"] = !!data["marketing"];
  addClient(data);

  formElem.reset();
});
