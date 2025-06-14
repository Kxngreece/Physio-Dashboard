let originalData = []; 
let filteredData = []; 
let currentPage = 1;
let recordsPerPage = 10; 
let selectedDates = [];

// Fetch data from the database
fetch("https://api.kneesync.com/alerts")
  .then((response) => response.json())
  .then((fetchedData) => {
    fetchedData.sort((a, b) => {
      const dateA = new Date(a.time_stamp);
      const dateB = new Date(b.time_stamp);
      return dateB - dateA; // Newest first (descending order)
    });
    originalData = fetchedData; 
    filteredData = [...fetchedData]; 
    updateTable();
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });

function populateTable(data) {
  const tableBody = document.querySelector("#alertTable tbody");
  tableBody.innerHTML = ""; 

  if (data.length === 0) {
    const row = document.createElement("tr");
    const noResultsCell = document.createElement("td");
    noResultsCell.colSpan = 4; // Changed from 5 to 4 since you have 4 columns
    noResultsCell.textContent = "No results found";
    noResultsCell.style.textAlign = "center";
    row.appendChild(noResultsCell);
    tableBody.appendChild(row);
  } else {
    data.forEach((row) => {
      const tr = document.createElement("tr");
      // Format the datetime for display
      const displayTime = new Date(row.time_stamp).toLocaleString();
      tr.innerHTML = `
        <td>${row.brace_id}</td>
        <td>${row.type}</td>
        <td>${row.message}</td>
        <td>${displayTime}</td>
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

function updateTable() {
  const start = (currentPage - 1) * recordsPerPage;
  const end = start + recordsPerPage;
  const paginatedData = filteredData.slice(start, end);

  populateTable(paginatedData);
  updatePagination(Math.ceil(filteredData.length / recordsPerPage));
}

function filterTable() {
  const searchTerm = document.getElementById("search").value.toLowerCase();
  const searchFilter = document.getElementById("searchFilter").value;

  // Filter from the original sorted data
  filteredData = originalData.filter((row) => {
    const matchesSearch =
      searchFilter === "all"
        ? Object.values(row).some((value) =>
            String(value).toLowerCase().includes(searchTerm)
          )
        : String(row[searchFilter]).toLowerCase().includes(searchTerm);

    // Date filtering using the time_stamp directly
    const rowTime = new Date(row.time_stamp);
    const matchesDate =
      selectedDates.length === 2
        ? rowTime >= selectedDates[0] && rowTime <= selectedDates[1]
        : true;

    return matchesSearch && matchesDate;
  });

  // Sort the filtered data to maintain newest to oldest order
  filteredData.sort((a, b) => {
    const dateA = new Date(a.time_stamp);
    const dateB = new Date(b.time_stamp);
    return dateB - dateA; // Newest first (descending order)
  });

  currentPage = 1; 
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

// Add event listeners
document.getElementById("search").addEventListener("input", filterTable);
document.getElementById("searchFilter").addEventListener("change", filterTable);
document.getElementById("recordsPerPage").addEventListener("change", changePageSize);