  const API_BASE_URL = 'https://api.kneesync.com';
        let devices = [];
        let currentSettings = {};

       
        async function initializeSettings() {
            await loadDevices();
            setupEventListeners();
        }

        // Load available devices from the API
        async function loadDevices() {
            try {
                const response = await fetch(`${API_BASE_URL}/knee-brace`);
                if (!response.ok) throw new Error('Failed to fetch devices');
                
                const data = await response.json();
                devices = [...new Set(data.map(item => ({
                    id: item.brace_id,
                    name: item.display_name || `KneeBrace_${item.brace_id.substring(12)}`
                })))];

                populateDeviceSelect();
            } catch (error) {
                console.error('Error loading devices:', error);
                showStatus('Failed to load devices. Please try again.', 'error');
            }
        }

        // Populate the device dropdown
        function populateDeviceSelect() {
            const select = document.getElementById('deviceSelect');
            select.innerHTML = '<option value="">Select a device...</option>';
            
            devices.forEach(device => {
                const option = document.createElement('option');
                option.value = device.id;
                option.textContent = device.name;
                select.appendChild(option);
            });
        }

        // Load current settings for selected device
        async function loadCurrentSettings(braceId) {
            try {
                const response = await fetch(`${API_BASE_URL}/settings`);
                if (!response.ok) throw new Error('Failed to fetch settings');
                
                const settings = await response.json();
                const deviceSettings = settings.filter(s => s.brace_id === braceId);
                
                if (deviceSettings.length > 0) {
                    // Get the most recent settings
                    const latest = deviceSettings.reduce((prev, current) => 
                        new Date(prev.time_stamp) > new Date(current.time_stamp) ? prev : current
                    );
                    
                    currentSettings = latest;
                    displayCurrentSettings(latest);
                } else {
                    hideCurrentSettings();
                }
            } catch (error) {
                console.error('Error loading current settings:', error);
                hideCurrentSettings();
            }
        }

        // Display current settings
        function displayCurrentSettings(settings) {
            document.getElementById('currentLower').textContent = `${settings.lower_angle_treshold}°`;
            document.getElementById('currentUpper').textContent = `${settings.upper_angle_treshold}°`;
            document.getElementById('currentSettings').style.display = 'block';
            
            // Pre-fill form with current values
            document.getElementById('lowerThreshold').value = settings.lower_angle_treshold;
            document.getElementById('upperThreshold').value = settings.upper_angle_treshold;
            document.getElementById('contactInfo').value = settings.contact || '';
        }

        // Hide current settings section
        function hideCurrentSettings() {
            document.getElementById('currentSettings').style.display = 'none';
            // Clear form
            document.getElementById('lowerThreshold').value = '';
            document.getElementById('upperThreshold').value = '';
            document.getElementById('contactInfo').value = '';
        }

        // Setup event listeners
        function setupEventListeners() {
            const deviceSelect = document.getElementById('deviceSelect');
            const form = document.getElementById('settingsForm');
            
            deviceSelect.addEventListener('change', async (e) => {
                if (e.target.value) {
                    await loadCurrentSettings(e.target.value);
                } else {
                    hideCurrentSettings();
                }
            });

            form.addEventListener('submit', handleFormSubmit);

            // Validate angle inputs
            const lowerInput = document.getElementById('lowerThreshold');
            const upperInput = document.getElementById('upperThreshold');
            
            lowerInput.addEventListener('input', validateAngles);
            upperInput.addEventListener('input', validateAngles);
        }

        // Validate angle inputs
        function validateAngles() {
            const lower = parseFloat(document.getElementById('lowerThreshold').value);
            const upper = parseFloat(document.getElementById('upperThreshold').value);
            const saveBtn = document.getElementById('saveBtn');
            
            if (!isNaN(lower) && !isNaN(upper) && lower >= upper) {
                saveBtn.disabled = true;
                showStatus('Lower threshold must be less than upper threshold', 'error');
            } else {
                saveBtn.disabled = false;
                hideStatus();
            }
        }

        // Handle form submission
        async function handleFormSubmit(e) {
            e.preventDefault();
            
            const formData = {
                brace_id: document.getElementById('deviceSelect').value,
                lower_angle_treshold: parseFloat(document.getElementById('lowerThreshold').value),
                upper_angle_treshold: parseFloat(document.getElementById('upperThreshold').value),
                contact: document.getElementById('contactInfo').value
            };

            // Validate form data
            if (!formData.brace_id) {
                showStatus('Please select a device', 'error');
                return;
            }

            if (formData.lower_angle_treshold >= formData.upper_angle_treshold) {
                showStatus('Lower threshold must be less than upper threshold', 'error');
                return;
            }

            await saveSettings(formData);
        }

        // Save settings to API
        async function saveSettings(data) {
            const saveBtn = document.getElementById('saveBtn');
            const originalText = saveBtn.innerHTML;
            
            try {
                // Show loading state
                saveBtn.innerHTML = '<span class="spinner"></span>Saving...';
                saveBtn.disabled = true;
                document.querySelector('.settings-popup').classList.add('loading');

                const response = await fetch(`${API_BASE_URL}/settings`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.detail || 'Failed to save settings');
                }

                showStatus('Settings saved successfully!', 'success');
                
                // Refresh current settings display
                await loadCurrentSettings(data.brace_id);
                
                // Auto-close after 2 seconds
                setTimeout(() => {
                    closeSettings();
                }, 2000);

            } catch (error) {
                console.error('Error saving settings:', error);
                showStatus(`Failed to save settings: ${error.message}`, 'error');
            } finally {
                // Reset button state
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                document.querySelector('.settings-popup').classList.remove('loading');
            }
        }

        // Show status message
        function showStatus(message, type) {
            const statusElement = document.getElementById('statusMessage');
            statusElement.textContent = message;
            statusElement.className = `status-message status-${type}`;
            statusElement.style.display = 'block';
        }

        // Hide status message
        function hideStatus() {
            const statusElement = document.getElementById('statusMessage');
            statusElement.style.display = 'none';
        }

        // Close settings popup
        function closeSettings() {
            const popup = document.querySelector('.settings-popup');
            popup.style.animation = 'slideOut 0.3s ease-in';
            
            setTimeout(() => {
                window.close(); // If opened as popup
                
                document.querySelector('.settings-overlay').style.display = 'none';
            }, 300);
        }

        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideOut {
                from {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: scale(0.9) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);

        // Initialize when page loads
        document.addEventListener('DOMContentLoaded', initializeSettings);

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeSettings();
            }
        });