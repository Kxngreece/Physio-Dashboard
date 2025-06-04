 let originalData = []; 
        let filteredData = []; 
        let currentPage = 1;
        let recordsPerPage = 10; 
        let selectedDates = [];

        fetch("https://api.kneesync.com/knee-brace")
          .then((response) => response.json())
          .then((fetchedData) => {
            // Sort the data: newest to oldest using 
            fetchedData.sort((a, b) => {
              const dateA = new Date(`${a.date_stamp}T${a.time_stamp}`);
              const dateB = new Date(`${b.date_stamp}T${b.time_stamp}`);
              return dateB - dateA; // descending order
            });
            originalData = fetchedData; 
            filteredData = [...fetchedData]; 
            updateTable();
          })
          .catch((error) => {
            console.error("Error fetching data:", error);
          });

        function populateTable(data) {
          const tableBody = document.querySelector("#activityTable tbody");
          tableBody.innerHTML = ""; 

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
                <td>${row.angle}°</td>
                <td>${row.emg_reading}</td>
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


        function updateTable() {
          const start = (currentPage - 1) * recordsPerPage;
          const end = start + recordsPerPage;
          const paginatedData = filteredData.slice(start, end);

          populateTable(paginatedData);
          updatePagination(Math.ceil(filteredData.length / recordsPerPage));
        }

        // Function to filter the table based on search and date range
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

          
            const fullTimestamp = `${row.date_stamp}T${row.time_stamp}`;
            const rowTime = new Date(fullTimestamp);
            const matchesDate =
              selectedDates.length === 2
                ? rowTime >= selectedDates[0] && rowTime <= selectedDates[1]
                : true;

            return matchesSearch && matchesDate;
          });

          // Sort the filtered data to maintain newest to oldest order
          filteredData.sort((a, b) => {
            const dateA = new Date(`${a.date_stamp}T${a.time_stamp}`);
            const dateB = new Date(`${b.date_stamp}T${b.time_stamp}`);
            return dateB - dateA; 
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

        updateTable();

        // Add event listeners
        document.getElementById("search").addEventListener("input", filterTable);

        document
          .getElementById("searchFilter")
          .addEventListener("change", filterTable);

        document
          .getElementById("recordsPerPage")
          .addEventListener("change", changePageSize);
    