// Database initialization

const DATABASE_NAME = "clientsDatabase";

var db;
const dbRequest = indexedDB.open(DATABASE_NAME, 1);
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

  const store = db.createObjectStore("clientsStore", {
    keyPath: "id",
    autoIncrement: true,
  });
  store.createIndex("phoneNumber", "phoneNumber");
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

function addRandomClient() {
  addClient(getRandomData());
}

function deleteClient(id) {
  const transaction = db.transaction(["clientsStore"], "readwrite");
  const store = transaction.objectStore("clientsStore");
  const deleteRequest = store.delete(id);

  deleteRequest.addEventListener("success", () => {
    deleteClientRow(id);
  });
}

function findClientByPhoneNumber(phoneNumber) {
  const transaction = db.transaction(["clientsStore"], "readonly");
  const store = transaction.objectStore("clientsStore");
  const index = store.index("phoneNumber");
  const cursor = index.openCursor(IDBKeyRange.bound(phoneNumber, phoneNumber + "\uffff"));

  deleteAllClientRows();

  cursor.addEventListener("success", (e) => {
    const c = e.target.result;
    if (c) {
      addClientRow(c.value);
      c.continue();
    }
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

function deleteAllClientRows() {
  table.querySelectorAll("*").forEach((row) => row.remove());
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

// Handling search form data

const searchFormElem = document.getElementById("searchForm");

searchFormElem.addEventListener("submit", (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(searchFormElem));
  findClientByPhoneNumber(data.search);
});

// Generate random data

document.getElementById("addRandomClientButton").addEventListener("click", addRandomClient);

function getRandomData() {
  String.prototype.toTitleCase = function () {
    return this.split(" ")
      .map((word) => word[0].toUpperCase() + word.substr(1))
      .join();
  };

  function randomString(length) {
    const sourceChars = "abcdefghijklmnopqrstuvwxyz";
    const stringChars = [...Array(length)].map(() =>
      sourceChars.charAt(Math.floor(Math.random() * sourceChars.length))
    );
    return stringChars.join("");
  }

  function randomNumber(length, padZeros = true) {
    const maxValue = 10 ** length - 1;
    const randomNum = Math.floor(Math.random() * maxValue);

    if (padZeros) return (randomNum + "").padStart(length, "0");
    else return randomNum;
  }

  function randomBool() {
    return !!Math.round(Math.random());
  }

  const rS = randomString;
  const rN = randomNumber;
  const rB = randomBool;

  const requirePersonal = rB();
  const requireBusiness = rB();

  return {
    firstName: rS(10).toTitleCase(),
    lastName: rS(15).toTitleCase(),
    address: rS(10).toTitleCase() + " " + rN(2, false) + "/" + rN(1),
    phoneNumber: rN(9),
    email: rS(5) + "@" + rS(5) + "." + rS(2),
    pesel: requirePersonal ? rN(11) : undefined,
    identity: requirePersonal ? rS(3).toUpperCase() + rN(6) : undefined,
    business: requireBusiness,
    businessName: requireBusiness ? rS(10).toTitleCase() + " " + rS(10).toTitleCase() : undefined,
    nip: requireBusiness ? rN(3) + "-" + rN(2) + "-" + rN(2) + "-" + rN(3) : undefined,
    marketing: rB(),
  };
}

// Remove database data

document.getElementById("fixDatabaseButton").addEventListener("click", deleteDatabase);

function deleteDatabase() {
  indexedDB.deleteDatabase(DATABASE_NAME);
  alert("Database will be re-created when you refresh the page");
}
