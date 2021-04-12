// Database initialization

var db;
const dbRequest = indexedDB.open("clients", 1);
const table = document.getElementById("table");

dbRequest.addEventListener("success", (e) => {
  db = e.target.result;
});

dbRequest.addEventListener("upgradeneeded", (e) => {
  db = e.target.result;
  db.createObjectStore("clientsStore", {
    keyPath: "id",
    autoIncrement: true,
  });
});

function addClient(data) {
  const transaction = db.transaction(["clientsStore"], "readwrite");
  const store = transaction.objectStore("clientsStore");
  const addRequest = store.add(data);

  addRequest.addEventListener("success", (e) => {
    const tableRowData = [
      e.target.result,
      data.firstName,
      data.lastName,
      data.phoneNumber,
      data.marketing,
      "",
    ];

    const tableRow = table.insertRow(-1);
    for (const colData of tableRowData) {
      const tableCell = tableRow.insertCell(-1);
      tableCell.innerHTML = colData;
    }
  });
}

// Handling form data

const formElem = document.getElementById("form");

formElem.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(formElem));
  data["marketing"] = !!data["marketing"];
  addClient(data);
});
