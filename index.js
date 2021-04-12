// Database initialization

var db;
const dbRequest = indexedDB.open("clients", 1);

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

  addRequest.addEventListener("success", () => {
    alert("New client added");
  });
}

// Handling form data

const formElem = document.getElementById("form");

formElem.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(formElem));
  addClient(data);
});
