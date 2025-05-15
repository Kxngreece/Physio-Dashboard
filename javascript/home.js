document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const API_BASE_URL = 'https://api.kneesync.com';
    const ENDPOINTS = {
        kneeBrace: (braceId) => `${API_BASE_URL}/knee-brace${braceId ? `?brace_id=${encodeURIComponent(braceId)}` : ''}`,
        alerts: `${API_BASE_URL}/alerts`,
        devices: `${API_BASE_URL}/devices`,
        feedback: `${API_BASE_URL}/feedback`,
    };
    const UPDATE_INTERVALS = {
        dashboard: 2000,
        alerts: 5000,
        feedback: 30000,
    };
    const MUSCLE_HISTORY_LENGTH = 6;

    // --- State Management ---
    let muscleReadingsHistory = [];
    let muscleLabelsHistory = [];
    let currentDeviceId = null;
    const originalKneeChartColors = ['#007bff', '#e9ecef'];
    const originalMuscleChartColors = ['#28a745', 'rgba(40, 167, 69, 0.1)'];

    // --- DOM Elements ---
    const elements = {
        kneeAngleValue: document.getElementById('kneeAngleValue'),
        kneeRotationCanvas: document.getElementById('kneeRotationChartCanvas'),
        muscleActivityCanvas: document.getElementById('muscleActivityChart'),
        alertsTableBody: document.getElementById('alertsTableBody'),
        feedbackContent: document.getElementById('feedbackContent'),
        recentAlertsValue: document.getElementById('recentAlertsValue'),
        deviceSelector: document.getElementById('device'),
        dataError: document.getElementById('data-error')
    };

    // --- Chart Initialization ---
    const charts = {
        kneeRotation: new Chart(elements.kneeRotationCanvas.getContext('2d'), {
            type: 'doughnut',
            data: {
                datasets: [{
                    data: [0, 180],
                    backgroundColor: originalKneeChartColors,
                    borderWidth: 0,
                    circumference: 180,
                    rotation: 270,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '75%',
                animation: { duration: 500 },
                plugins: { tooltip: false, legend: false }
            }
        }),
        muscleActivity: new Chart(elements.muscleActivityCanvas.getContext('2d'), {
            type: 'line',
            data: {
                labels: Array(MUSCLE_HISTORY_LENGTH).fill('--:--:--'),
                datasets: [{
                    label: 'Muscle Activity',
                    data: Array(MUSCLE_HISTORY_LENGTH).fill(0),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    fill: true,
                    tension: 0.3,
                    pointRadius: 3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: { beginAtZero: false, title: { text: 'ADC Value' } },
                    x: { title: { text: 'Time' } }
                },
                plugins: { legend: false }
            }
        })
    };

    // --- Core Functions ---
    async function updateDashboardData() {
        if (!currentDeviceId) return;

        try {
            const response = await fetch(ENDPOINTS.kneeBrace(currentDeviceId));
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const [latestReading] = await response.json();

            // Update Knee Angle Display
            const newAngle = Math.max(0, Math.min(180, latestReading.angle));
            elements.kneeAngleValue.textContent = `${newAngle}°`;
            
            // Update Knee Rotation Chart
            charts.kneeRotation.data.datasets[0].data = [newAngle, 180 - newAngle];
            charts.kneeRotation.update();

            // Update Muscle Activity History
            updateMuscleActivityChart(latestReading);

            elements.dataError.style.display = 'none';

        } catch (error) {
            handleDataError(error);
        }
    }

    function updateMuscleActivityChart(reading) {
        const timestamp = new Date(reading.timestamp);
        const timeLabel = timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit'
        });

        // Update history arrays
        muscleLabelsHistory.push(timeLabel);
        muscleReadingsHistory.push(reading.muscle_reading);

        // Maintain history length
        if (muscleLabelsHistory.length > MUSCLE_HISTORY_LENGTH) {
            muscleLabelsHistory.shift();
            muscleReadingsHistory.shift();
        }

        // Update chart data
        charts.muscleActivity.data.labels = [...muscleLabelsHistory];
        charts.muscleActivity.data.datasets[0].data = [...muscleReadingsHistory];
        charts.muscleActivity.update();
    }

    async function populateDeviceSelector() {
        try {
            const response = await fetch(ENDPOINTS.devices);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const devices = await response.json();
            elements.deviceSelector.innerHTML = devices.map(device => 
                `<option value="${device.brace_id}">${device.display_name}</option>`
            ).join('');

            if (devices.length > 0) {
                currentDeviceId = devices[0].brace_id;
                elements.deviceSelector.value = currentDeviceId;
                initializeChartData();
                updateDashboardData();
            }

        } catch (error) {
            handleDeviceError(error);
        }
    }

    // --- Helper Functions ---
    function initializeChartData() {
        muscleLabelsHistory = Array(MUSCLE_HISTORY_LENGTH).fill('--:--:--');
        muscleReadingsHistory = Array(MUSCLE_HISTORY_LENGTH).fill(0);
    }

    function handleDataError(error) {
        console.error('Dashboard update failed:', error);
        elements.dataError.textContent = `Error: ${error.message}`;
        elements.dataError.style.display = 'block';
        resetChartsWithLoadingState();
    }

    function handleDeviceError(error) {
        console.error('Device loading failed:', error);
        elements.deviceSelector.innerHTML = '<option value="">Error loading devices</option>';
        elements.dataError.textContent = 'Failed to load devices. Please refresh.';
        elements.dataError.style.display = 'block';
    }

    function resetChartsWithLoadingState() {
        charts.muscleActivity.data.datasets[0].backgroundColor = '#f0f0f0';
        charts.kneeRotation.data.datasets[0].backgroundColor = ['#f0f0f0', '#f0f0f0'];
        charts.muscleActivity.update();
        charts.kneeRotation.update();
    }

    // --- Event Listeners ---
    elements.deviceSelector.addEventListener('change', () => {
        currentDeviceId = elements.deviceSelector.value;
        initializeChartData();
        updateDashboardData();
    });

    // --- Initialization ---
    populateDeviceSelector();
    setInterval(updateDashboardData, UPDATE_INTERVALS.dashboard);
    setInterval(updateAlertsTable, UPDATE_INTERVALS.alerts);
    setInterval(updateFeedback, UPDATE_INTERVALS.feedback);

    // --- Alerts Table Functions ---
    async function updateAlertsTable() {
        if (!elements.alertsTableBody || !elements.recentAlertsValue) {
            console.error("Required elements missing!");
            return;
        }

        try {
            const response = await fetch(ENDPOINTS.alerts);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const alerts = await response.json();
            elements.alertsTableBody.innerHTML = '';

            if (alerts?.length > 0) {
                const sortedAlerts = alerts.sort((a, b) => 
                    new Date(`${b.date_stamp}T${b.time_stamp}`) - 
                    new Date(`${a.date_stamp}T${a.time_stamp}`)
                );

                const maxAlertsToShow = 3;
                sortedAlerts.slice(0, maxAlertsToShow).forEach(alert => {
                    const row = document.createElement('tr');
                    const time = new Date(`${alert.date_stamp}T${alert.time_stamp}`);
                    
                    row.innerHTML = `
                        <td>${alert.type || 'N/A'}</td>
                        <td>${alert.message || 'No message'}</td>
                        <td>${time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    `;
                    elements.alertsTableBody.appendChild(row);
                });

                elements.recentAlertsValue.textContent = Math.min(alerts.length, maxAlertsToShow);
            } else {
                handleNoAlerts();
            }
        } catch (error) {
            console.error("Failed to update alerts:", error);
            handleErrorState(error.message);
        }
    }

    function handleNoAlerts() {
        elements.alertsTableBody.innerHTML = `<tr><td colspan="3" class="text-center">No recent alerts</td></tr>`;
        elements.recentAlertsValue.textContent = 0;
    }

    function handleErrorState(message) {
        elements.alertsTableBody.innerHTML = `<tr><td colspan="3" class="text-center error">${message}</td></tr>`;
        elements.recentAlertsValue.textContent = '—';
    }

    // --- Feedback Functions ---
    async function updateFeedback() {
        if (!elements.feedbackContent) {
            console.error("Feedback content element missing!");
            return;
        }

        try {
            const response = await fetch(ENDPOINTS.feedback);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            
            const allFeedbackData = await response.json();
            elements.feedbackContent.innerHTML = '';
            elements.feedbackContent.classList.remove('error-text');

            const maxFeedbackToShow = 5;
            if (allFeedbackData?.length > 0) {
                const sortedFeedback = allFeedbackData.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                );
                
                sortedFeedback.slice(0, maxFeedbackToShow).forEach(item => {
                    if (item.body && item.timestamp) {
                        const feedbackItemDiv = document.createElement('div');
                        feedbackItemDiv.className = 'feedback-item';
                        
                        const feedbackBodyP = document.createElement('p');
                        feedbackBodyP.className = 'feedback-item-body';
                        feedbackBodyP.textContent = item.body;

                        const feedbackTimeP = document.createElement('p');
                        feedbackTimeP.className = 'feedback-item-time';
                        feedbackTimeP.textContent = new Date(item.timestamp).toLocaleString([], {
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit', 
                            minute: '2-digit', 
                            hour12: true
                        });

                        feedbackItemDiv.appendChild(feedbackBodyP);
                        feedbackItemDiv.appendChild(feedbackTimeP);
                        elements.feedbackContent.appendChild(feedbackItemDiv);
                    }
                });
            } else {
                elements.feedbackContent.textContent = "No feedback available at the moment.";
            }
        } catch (error) {
            console.error("Failed to update feedback:", error);
            elements.feedbackContent.innerHTML = `<p class="error-text">Error loading feedback: ${error.message}</p>`;
        }
    }
});