function table(data){
    const tableBody = document.querySelector("#user-table tbody");
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
            IDCellCell.textContent = data[i].ID;
            row.appendChild(IDCell);
        
            const nameCell = document.createElement("td");
            nameCell.textContent = data[i].name;
            row.appendChild(nameCell);
        
            const braceCell = document.createElement("td");
            braceCell.textContent = data[i].braceID;
            row.appendChild(braceCell);
    
            const emailCell = document.createElement("td");
            sumCell.textContent = data[i].email;
            row.appendChild(emailCell)
    
            // Append the row to the table body
            tableBody.appendChild(row);
        }
    }
    
}fetch ('http://127.0.0.1:8000/users')
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
