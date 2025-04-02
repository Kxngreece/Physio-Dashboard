let data = []; // This will store the fetched data
let currentPage = 1;
let recordsPerPage = 5;
let selectedDates = []; 

// Fetch data from the database
fetch('http://129.213.50.21:8000/alerts')
    .then(response => response.json())
    .then(fetchedData => {
        data = fetchedData; 
        updateTable(); 
    })
    .catch(error => {
        console.error('Error fetching data:', error);
    });


function populateTable(data) {
    const tableBody = document.querySelector("#alertTable tbody");
    tableBody.innerHTML = ''; // Clear existing rows

    if (data.length === 0) {
        const row = document.createElement("tr");
        const noResultsCell = document.createElement("td");
        noResultsCell.colSpan = 5; 
        noResultsCell.textContent = "No results found";
        noResultsCell.style.textAlign = "center";
        row.appendChild(noResultsCell);
        tableBody.appendChild(row);
        
    } else {
        data.forEach(row => {
            const tr = document.createElement("tr");
            
            const dateObj = new Date(row.time_stamp);
            const date = dateObj.toISOString().split("T")[0]; // YYYY-MM-DD
            const time = dateObj.toLocaleTimeString("en-US", { hour12: false }); // HH:MM:SS
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

    const filteredData = data.filter(row => {
        
        const matchesSearch = searchFilter === "all" ?
            Object.values(row).some(value => String(value).toLowerCase().includes(searchTerm)) :
            String(row[searchFilter]).toLowerCase().includes(searchTerm);

        const rowTime = new Date(row.time_stamp);
        const matchesDate = selectedDates.length === 2 ?
            rowTime >= selectedDates[0] && rowTime <= selectedDates[1] :
            true;

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


flatpickr("#dateRange", {
    mode: "range",
    dateFormat: "Y-m-d",
    altInput: true,
    altFormat: "F j, Y",
    onChange: function (dates, dateStr) {
        selectedDates = dates; 
        filterTable(); 
    }
});


updateTable();