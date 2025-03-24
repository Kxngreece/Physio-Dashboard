let data = [];
let currentPage = 1;
let recordsPerPage = 5;
let selectedDates = []; // Store selected dates globally

const sampleData = [
    { braceId: "B001", alertCode: "A001", message: "Low Battery", time: "2023-10-01 10:00" },
    { braceId: "B002", alertCode: "A002", message: "Fall Detected", time: "2023-10-01 11:00" },
    { braceId: "B003", alertCode: "A003", message: "High Heart Rate", time: "2023-10-01 12:00" },
    { braceId: "B004", alertCode: "A004", message: "Low Battery", time: "2023-10-01 13:00" },
    { braceId: "B005", alertCode: "A005", message: "Fall Detected", time: "2023-10-01 14:00" },
    { braceId: "B006", alertCode: "A006", message: "High Heart Rate", time: "2023-10-01 15:00" },
    { braceId: "B007", alertCode: "A007", message: "Low Battery", time: "2023-10-01 16:00" },
    { braceId: "B008", alertCode: "A008", message: "Fall Detected", time: "2023-10-01 17:00" },
    { braceId: "B009", alertCode: "A009", message: "High Heart Rate", time: "2023-10-01 18:00" },
    { braceId: "B010", alertCode: "A010", message: "Low Battery", time: "2023-10-01 19:00" },
    { braceId: "B007", alertCode: "A007", message: "Low Battery", time: "2023-10-01 16:00" },
    { braceId: "B008", alertCode: "A008", message: "Fall Detected", time: "2023-10-01 17:00" },
    { braceId: "B009", alertCode: "A009", message: "High Heart Rate", time: "2023-10-01 18:00" },
    { braceId: "B010", alertCode: "A010", message: "Low Battery", time: "2023-10-01 19:00" },
    { braceId: "B007", alertCode: "A007", message: "Low Battery", time: "2023-10-01 16:00" },
    { braceId: "B008", alertCode: "A008", message: "Fall Detected", time: "2023-10-01 17:00" },
    { braceId: "B009", alertCode: "A009", message: "High Heart Rate", time: "2023-10-01 18:00" },
    { braceId: "B010", alertCode: "A010", message: "Low Battery", time: "2023-10-01 19:00" },
];


data = sampleData;


flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "F j, Y",
    onChange: function(dates, dateStr) {
        selectedDates = dates; // Update global selectedDate
        filterTable();
    }
});

// Function to populate the table with data
function populateTable(data) {
    const tableBody = document.querySelector("#alertTable tbody");
    tableBody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        const row = document.createElement("tr");
        const noResultsCell = document.createElement("td");
        noResultsCell.colSpan = 4; // Span all columns (excluding id)
        noResultsCell.textContent = "No results found";
        noResultsCell.style.textAlign = "center";
        row.appendChild(noResultsCell);
        tableBody.appendChild(row);
    } else {
        data.forEach(row => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${row.brace_id}</td>
                <td>${row.type}</td>
                <td>${row.message}</td>
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

    data = sampleData.filter(row => {
        // Search filter
        const matchesSearch = searchFilter === "all" ?
            Object.values(row).some(value => String(value).toLowerCase().includes(searchTerm)) :
            String(row[searchFilter]).toLowerCase().includes(searchTerm);

        // Date range filter
        const rowTime = new Date(row.time);
        const matchesDate = selectedDates.length === 2 ?
            rowTime >= selectedDates[0] && rowTime <= selectedDates[1] :
            true;

        return matchesSearch && matchesDate;
    });

    currentPage = 1;
    updateTable();
}

// Function to change the number of records per page
function changePageSize() {
    recordsPerPage = parseInt(document.getElementById("recordsPerPage").value);
    currentPage = 1;
    updateTable();
}


updateTable();