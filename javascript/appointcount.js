
fetch ('https:///129.213.50.21:8000/appointments')
.then(response => response.json())
.then(data => {
    //const latestEntry = data[data.length - 1]; // Get the last entry
    // Update Socket 1
    
    console.log(data);
    document.getElementById('appoint_counter').innerText = data[0].number;
})
.catch(error => {
    console.error('Error fetching data:', error);
});
