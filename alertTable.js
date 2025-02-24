function table(data){
    const tableBody = document.querySelector("#alertTable tbody");
    
    tableBody.innerHTML = ''
    if(data.length === 0){
        const row = document.createElement("tr");
        const noResultsCell = document.createElement("td");
        noResultsCell.colSpan = 6; // Span all columns
        noResultsCell.textContent = "No results found";
        noResultsCell.style.textAlign = "center";
        row.appendChild(noResultsCell);
        tableBody.appendChild(row);

    }
    else{
        for (let i = 0; i < data.length; i++) {
            const row = document.createElement("tr"); // Create a new row
        
            // Create and populate cells for each field

            const IDCell = document.createElement("td");
            IDCell.textContent = data[i].id;
            row.appendChild(IDCell);
        
            const braceCell = document.createElement("td");
            braceCell.textContent = data[i].brace_id;
            row.appendChild(braceCell);

            const alertCell = document.createElement("td");
            alertCell.textContent = data[i].type;
            row.appendChild(alertCell);
    
            const messageCell = document.createElement("td");
            messageCell.textContent = data[i].message;
            row.appendChild(messageCell)

            const dateCell = document.createElement("td");
            dateCell.textContent = data[i].time_stamp;
            row.appendChild(dateCell)
    
            // Append the row to the table body
            tableBody.appendChild(row);
        }
    }
    
}


fetch ('https://150.136.88.20:8000/alert-history')
.then(response => response.json())
.then(data => {
    //const latestEntry = data[data.length - 1]; // Get the last entry
    // Update Socket 1
    table(data);
    console.log(data);
    
})
.catch(error => {
    console.error('Error fetching data:', error);
});
