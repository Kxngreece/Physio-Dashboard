
    fetch ('http://127.0.0.1:8000/alert')
        .then(response => response.json())
        .then(data => {
            //const latestEntry = data[data.length - 1]; // Get the last entry
            // Update Socket 1
            
            console.log(data);
            document.getElementById('alert_counter').innerText = data[0].number;
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
