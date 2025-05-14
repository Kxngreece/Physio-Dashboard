document.addEventListener('DOMContentLoaded', () => {

    
    const kneeAngleValueElement = document.getElementById('kneeAngleValue');
    const kneeRotationCanvas = document.getElementById('kneeRotationChartCanvas')?.getContext('2d');
    const muscleActivityCanvas = document.getElementById('muscleActivityChart')?.getContext('2d');
    const alertsTableBody = document.getElementById('alertsTableBody');
    const feedbackContentElement = document.getElementById('feedbackContent');


    if (!kneeRotationCanvas || !muscleActivityCanvas) {
        console.error("Could not find canvas elements for charts.");
        return; 
    }

    // --- Initial Data ---
    let currentKneeAngle = 90; 
    const initialMuscleData = [600, 650, 580, 700, 620, 680];
    const initialMuscleLabels = ['-5s', '-4s', '-3s', '-2s', '-1s', 'Now']; // Example time labels

    // --- Knee Rotation Doughnut Chart ---
    const kneeRotationChart = new Chart(kneeRotationCanvas, {
        type: 'doughnut',
        data: {
            
            datasets: [{
                data: [currentKneeAngle, 180 - currentKneeAngle], // Initial data
                backgroundColor: ['#007bff', '#e9ecef'], // Active color, Inactive color
                borderWidth: 0,
                circumference: 180, // Half circle
                rotation: 270, // Start at the bottom
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true, 
            aspectRatio: 2, // Makes it wider than tall, suitable for half doughnut
            cutout: '75%', // Adjust thickness of the doughnut
            plugins: {
                tooltip: {
                    enabled: false // Disable default tooltips
                },
                legend: {
                    display: false // Hide legend
                },
                // Datalabels plugin configuration (make sure plugin is included)
                datalabels: {
                   display: false // We display the value outside the chart
                }
            }
        }
    });

    // --- Muscle Activity Line Chart ---
    const muscleActivityChart = new Chart(muscleActivityCanvas, {
        type: 'line',
        data: {
            labels: initialMuscleLabels,
            datasets: [{
                label: 'ADC Value',
                data: initialMuscleData,
                borderColor: '#28a745', // Green line
                backgroundColor: 'rgba(40, 167, 69, 0.1)', // Light green fill
                fill: true,
                tension: 0.3, // Smoothes the line
                pointRadius: 3, // Show points
                pointBackgroundColor: '#28a745'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: false, // Adjust if your ADC values don't start near zero
                    title: {
                        display: true,
                        text: 'ADC Value'
                    }
                },
                x: {
                   title: {
                       display: true,
                       text: 'Time'
                   }
                }
            },
            plugins: {
                legend: {
                    display: false // Hide legend for single dataset
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                }
            }
        }
    });

    // --- Function to Update Dashboard Data (Simulated) ---
    function updateDashboardData() {
        // Simulate new Knee Angle
        const newKneeAngle = Math.max(0, Math.min(180, currentKneeAngle + Math.floor(Math.random() * 10 - 5))); // Simulate small change
        currentKneeAngle = newKneeAngle;

        // Update Knee Angle Value Display
        if (kneeAngleValueElement) {
            kneeAngleValueElement.textContent = newKneeAngle;
        }

        // Update Doughnut Chart
        kneeRotationChart.data.datasets[0].data = [newKneeAngle, 180 - newKneeAngle];
        kneeRotationChart.update('none'); // Update without animation for smoother feel

        // Simulate new Muscle Activity Data Point
        const lastLabel = muscleActivityChart.data.labels[muscleActivityChart.data.labels.length - 1];
        const newLabel = 'Now'; // Or update with actual time
        const newDataPoint = Math.max(0, muscleActivityChart.data.datasets[0].data[muscleActivityChart.data.datasets[0].data.length - 1] + (Math.random() * 100 - 50)); // Simulate change

        // Add new data and remove the oldest
        muscleActivityChart.data.labels.push(newLabel);
        muscleActivityChart.data.datasets[0].data.push(newDataPoint);
        muscleActivityChart.data.labels.shift(); // Remove first label
        muscleActivityChart.data.datasets[0].data.shift(); // Remove first data point

        muscleActivityChart.update();

        // Simulate updating alerts (example: add one, remove oldest if > limit)
        // In a real app, this would come from a data source
        updateAlertsTable();

        // Simulate updating feedback
        // updateFeedback();
    }

    // --- Function to Update Alerts Table  ---
    async function updateAlertsTable() {
        const alertEndpoint = 'https://api.kneesync.com/alerts';
        const maxAlertsToShow = 3;
        const recentAlertsValue = document.getElementById('recentAlertsValue');

        if (!alertsTableBody || !recentAlertsValue) {
            console.error("Required elements missing!");
            return;
        }

        try {
            const response = await fetch(alertEndpoint);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: "Unknown server error" }));
                throw new Error(`HTTP error! status: ${response.status} - ${errorData.detail}`);
            }

            const alerts = await response.json();
            alertsTableBody.innerHTML = '';

            if (alerts?.length > 0) {
                // Sort alerts by date and time (newest first)
                const sortedAlerts = alerts.sort((a, b) => 
                    new Date(`${b.date_stamp}T${b.time_stamp}`) - 
                    new Date(`${a.date_stamp}T${a.time_stamp}`)
                );

                sortedAlerts.slice(0, maxAlertsToShow).forEach(alert => {
                    const row = document.createElement('tr');
                    const time = new Date(`${alert.date_stamp}T${alert.time_stamp}`);
                    
                    row.innerHTML = `
                        <td>${alert.type || 'N/A'}</td>
                        <td>${alert.message || 'No message'}</td>
                        <td>${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    `;
                    alertsTableBody.appendChild(row);
                });

                recentAlertsValue.textContent = Math.min(alerts.length, maxAlertsToShow);
            } else {
                this.handleNoAlerts(alertsTableBody, recentAlertsValue);
            }
        } catch (error) {
            console.error("Failed to update alerts:", error);
            this.handleErrorState(alertsTableBody, recentAlertsValue);
        }
    }

    // Helper functions
    function handleNoAlerts(tableBody, countElement) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center">No recent alerts</td></tr>`;
        countElement.textContent = 0;
    }

    function handleErrorState(tableBody, countElement) {
        tableBody.innerHTML = `<tr><td colspan="3" class="text-center error">Error loading alerts</td></tr>`;
        countElement.textContent = '—';
    }

setInterval(updateAlertsTable, 5000);
updateAlertsTable();

    // --- Function to Update Feedback (Simulated) ---
    function updateFeedback() {
         if (feedbackContentElement && Math.random() < 0.05) { // Randomly update sometimes
             const feedbacks = [
                 "Patient reports improvement in stability.",
                 "Slight pain noted during flexion exercise.",
                 "Completed full set of exercises today.",
                 "User mentioned the brace feels comfortable."
             ];
             feedbackContentElement.textContent = feedbacks[Math.floor(Math.random() * feedbacks.length)];
         }
    }


    // --- Initial Call & Interval for Simulation ---
    // updateDashboardData(); // Call once initially if needed
    const updateInterval = 2000; // Update every 2 seconds (adjust as needed)
    setInterval(updateDashboardData, updateInterval);

    
    const deviceSelector = document.getElementById('device');
    if (deviceSelector) {
        deviceSelector.addEventListener('change', (event) => {
            console.log(`Device selected: ${event.target.value}`);
            // Add logic here to fetch and display data for the selected device
            // This would likely involve clearing existing chart data and fetching new data
            // For simulation, you could reset the charts or change some visual element
            currentKneeAngle = Math.floor(Math.random() * 180); // Reset angle on device change
            muscleActivityChart.data.datasets[0].data = initialMuscleData.map(() => Math.random() * 500 + 500); // Reset muscle data
            updateDashboardData(); 
        });
    }

});