let data = []; // This will store the fetched data
let currentPage = 1;
let recordsPerPage = 10; // Default value changed to 10
let selectedDates = [];

// Fetch data from the database
fetch("https://api.kneesync.com/alerts")
  .then((response) => response.json())
  .then((fetchedData) => {
    // Sort the data: newest to oldest using date_stamp and time_stamp
    fetchedData.sort((a, b) => {
      const dateA = new Date(`${a.date_stamp}T${a.time_stamp}`);
      const dateB = new Date(`${b.date_stamp}T${b.time_stamp}`);
      return dateB - dateA; // descending order
    });
    data = fetchedData;
    updateTable();
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

function populateTable(data) {
  const tableBody = document.querySelector("#alertTable tbody");
  tableBody.innerHTML = ""; // Clear existing rows

  if (data.length === 0) {
    const row = document.createElement("tr");
    const noResultsCell = document.createElement("td");
    noResultsCell.colSpan = 5;
    noResultsCell.textContent = "No results found";
    noResultsCell.style.textAlign = "center";
    row.appendChild(noResultsCell);
    tableBody.appendChild(row);
  } else {
    data.forEach((row) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${row.brace_id}</td>
        <td>${row.type}</td>
        <td>${row.message}</td>
        <td>${row.date_stamp}</td>
        <td>${row.time_stamp}</td>
      `;
      tableBody.appendChild(tr);
    });
  }
}

// Function to update pagination buttons
function updatePagination(totalPages) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement("button");
    button.textContent = i;
    button.addEventListener("click", () => {
      currentPage = i;
      updateTable();
    });
    if (i === currentPage) {
      button.classList.add("active");
    }
    pagination.appendChild(button);
  }
}

// Function to update the table based on the current page
function updateTable() {
  const start = (currentPage - 1) * recordsPerPage;
  const end = start + recordsPerPage;
  const paginatedData = data.slice(start, end);

  populateTable(paginatedData);
  updatePagination(Math.ceil(data.length / recordsPerPage));
}

// Function to filter the table based on search and date range
function filterTable() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const searchFilter = document.getElementById("searchFilter").value;

  const filteredData = data.filter((row) => {
    const matchesSearch =
      searchFilter === "all"
        ? Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm)
          )
        : String(row[searchFilter]).toLowerCase().includes(searchTerm);

    // Combine date_stamp and time_stamp to create a full timestamp
    const fullTimestamp = `${row.date_stamp}T${row.time_stamp}`;
    const rowTime = new Date(fullTimestamp);
    const matchesDate =
      selectedDates.length === 2
        ? rowTime >= selectedDates[0] && rowTime <= selectedDates[1]
        : true;

    return matchesSearch && matchesDate;
  });

  currentPage = 1;
  data = filteredData;
  updateTable();
}

function changePageSize() {
  recordsPerPage = parseInt(document.getElementById("recordsPerPage").value);
  currentPage = 1;
  updateTable();
}

// Initialize flatpickr for date range filtering
flatpickr("#dateRange", {
  mode: "range",
  dateFormat: "Y-m-d",
  altInput: true,
  altFormat: "F j, Y",
  onChange: function (dates, dateStr) {
    selectedDates = dates;
    filterTable();
  },
});

// Initial table update call
updateTable();

// Add event listener for search input
document.getElementById("search").addEventListener("input", filterTable);
// Add event listener for search filter dropdown
document
  .getElementById("searchFilter")
  .addEventListener("change", filterTable);
// Add event listener for records per page dropdown
document
  .getElementById("recordsPerPage")
  .addEventListener("change", changePageSize);  