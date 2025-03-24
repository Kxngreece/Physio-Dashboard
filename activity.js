let data = [];
        let currentPage = 1;
        let recordsPerPage = 5;

        async function fetchData() {
            const deviceId = document.getElementById('deviceId').value || 'AC:15:18:D7:B0:80';
            try {
                const response = await fetch(`https://api.fyahalarm.com/data/${deviceId}?page_size=100&page_number=0`);
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                data = await response.json();
                displayPage(1);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        }

        function displayPage(page) {
            const tbody = document.getElementById('myTable').getElementsByTagName('tbody')[0];
            tbody.innerHTML = '';
            
            let start = (page - 1) * recordsPerPage;
            let end = start + recordsPerPage;
            let paginatedItems = data.slice(start, end);
            
            paginatedItems.forEach(record => {
                const row = tbody.insertRow();
                row.innerHTML = `
                    <td>${record.device_id}</td>
                    <td>${record.time_stamp}</td>
                    <td>${record.temperature}</td>
                    <td>${record.flame}</td>
                    <td>${record.flame_level}</td>
                    <td>${record.gas}</td>
                    <td>${record.gas_concentration}</td>
                    <td>${record.oxygen_concentration}</td>
                `;
            });
            updatePagination();
        }

        function updatePagination() {
            const paginationDiv = document.getElementById('pagination');
            paginationDiv.innerHTML = '';
            let pageCount = Math.ceil(data.length / recordsPerPage);
            
            for (let i = 1; i <= pageCount; i++) {
                let btn = document.createElement('button');
                btn.innerText = i;
                btn.onclick = function() { displayPage(i); };
                paginationDiv.appendChild(btn);
            }
        }

        function filterTable() {
            const startDate = new Date(document.getElementById('startDate').value);
            const endDate = new Date(document.getElementById('endDate').value);
            data = data.filter(record => {
                const timestamp = new Date(record.time_stamp);
                return (!isNaN(startDate) && !isNaN(endDate)) ? (timestamp >= startDate && timestamp <= endDate) : true;
            });
            displayPage(1);
        }

        function changePageSize() {
            recordsPerPage = parseInt(document.getElementById('recordsPerPage').value);
            displayPage(1);
        }

        window.onload = fetchData;