const API_BASE_URL = 'https://api.kneesync.com';
let devices = [];
let currentSettings = {};

// Initialize settings page
async function initializeSettings() {
    console.log('Initializing settings...');
    await loadDevices();
    setupEventListeners();
}

// Load available devices from the API
async function loadDevices() {
    try {
        showStatus('Loading devices...', 'info');
        const response = await fetch(`${API_BASE_URL}/knee-brace`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('Devices loaded:', data);
        
        // Remove duplicates and create device objects
        devices = [...new Set(data.map(item => ({
            id: item.brace_id,
            name: item.display_name || `KneeBrace_${item.brace_id.substring(12)}`
        })))];

        populateDeviceSelect();
        hideStatus();
        
    } catch (error) {
        console.error('Error loading devices:', error);
        showStatus(`Failed to load devices: ${error.message}`, 'error');
    }
}

// Populate the device dropdown
function populateDeviceSelect() {
    const select = document.getElementById('deviceSelect');
    select.innerHTML = '<option value="">Select a device...</option>';
    
    if (devices.length === 0) {
        select.innerHTML = '<option value="">No devices available</option>';
        return;
    }
    
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
        console.log(`Loading current settings for device: ${braceId}`);
        showStatus('Loading current settings...', 'info');
        
        const response = await fetch(`${API_BASE_URL}/settings/${braceId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        if (response.status === 404) {
            console.log('No existing settings found for device');
            hideCurrentSettings();
            hideStatus();
            return;
        }
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const settings = await response.json();
        console.log('Current settings loaded:', settings);
        
        currentSettings = settings;
        displayCurrentSettings(settings);
        hideStatus();
        
    } catch (error) {
        console.error('Error loading current settings:', error);
        showStatus(`Failed to load current settings: ${error.message}`, 'error');
        hideCurrentSettings();
    }
}

// Display current settings
function displayCurrentSettings(settings) {
    const currentSettingsDiv = document.getElementById('currentSettings');
    const currentLower = document.getElementById('currentLower');
    const currentUpper = document.getElementById('currentUpper');
    
    currentLower.textContent = `${settings.lower_angle_treshold}°`;
    currentUpper.textContent = `${settings.upper_angle_treshold}°`;
    currentSettingsDiv.style.display = 'block';
    
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
    
    if (!isNaN(lower) && !isNaN(upper)) {
        if (lower >= upper) {
            saveBtn.disabled = true;
            showStatus('Lower threshold must be less than upper threshold', 'error');
            return false;
        } else if (lower < 0 || upper < 0) {
            saveBtn.disabled = true;
            showStatus('Angle values must be positive', 'error');
            return false;
        } else if (lower > 180 || upper > 180) {
            saveBtn.disabled = true;
            showStatus('Angle values must be 180° or less', 'error');
            return false;
        } else {
            saveBtn.disabled = false;
            hideStatus();
            return true;
        }
    }
    
    return true;
}


async function handleFormSubmit(e) {
    e.preventDefault();
    
    const deviceSelect = document.getElementById('deviceSelect');
    const lowerThreshold = document.getElementById('lowerThreshold');
    const upperThreshold = document.getElementById('upperThreshold');
    const contactInfo = document.getElementById('contactInfo');
    
    // Validate form data
    if (!deviceSelect.value) {
        showStatus('Please select a device', 'error');
        return;
    }
    
    const lowerValue = parseFloat(lowerThreshold.value);
    const upperValue = parseFloat(upperThreshold.value);
    
    if (isNaN(lowerValue) || isNaN(upperValue)) {
        showStatus('Please enter valid angle values', 'error');
        return;
    }
    
    if (!validateAngles()) {
        return;
    }
    
    const formData = {
        brace_id: deviceSelect.value,
        lower_angle_treshold: lowerValue,
        upper_angle_treshold: upperValue,
        contact: contactInfo.value.trim()
    };
    
    console.log('Submitting form data:', formData);
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
        showStatus('Saving settings...', 'info');
        
        const popup = document.querySelector('.settings-popup');
        if (popup) popup.classList.add('loading');

        console.log('Sending POST request to:', `${API_BASE_URL}/settings`);
        console.log('Request payload:', JSON.stringify(data, null, 2));

        const response = await fetch(`${API_BASE_URL}/settings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(data)
        });

        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);

        let responseData;
        try {
            responseData = await response.json();
            console.log('Response data:', responseData);
        } catch (jsonError) {
            console.error('Failed to parse response as JSON:', jsonError);
            const textResponse = await response.text();
            console.log('Raw response:', textResponse);
            throw new Error('Invalid JSON response from server');
        }

        if (!response.ok) {
            throw new Error(responseData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        showStatus('Settings saved successfully!', 'success');
        
        await loadCurrentSettings(data.brace_id);
        
        setTimeout(() => {
            closeSettings();
        }, 2000);

    } catch (error) {
        console.error('Error saving settings:', error);
        showStatus(`Failed to save settings: ${error.message}`, 'error');
    } finally {
    
        saveBtn.innerHTML = originalText;
        saveBtn.disabled = false;
        const popup = document.querySelector('.settings-popup');
        if (popup) popup.classList.remove('loading');
    }
}

function showStatus(message, type) {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.textContent = message;
        statusElement.className = `status-message status-${type}`;
        statusElement.style.display = 'block';
    }
    console.log(`Status [${type}]: ${message}`);
}


function hideStatus() {
    const statusElement = document.getElementById('statusMessage');
    if (statusElement) {
        statusElement.style.display = 'none';
    }
}

// Close settings popup
function closeSettings() {
    const popup = document.querySelector('.settings-popup');
    if (popup) {
        popup.style.animation = 'slideOut 0.3s ease-in';
    }
    
    setTimeout(() => {
        if (window.opener) {
            window.close();
        }
        
        const overlay = document.querySelector('.settings-overlay');
        if (overlay) {
            overlay.style.display = 'none';
        }
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
    
    .spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        border: 2px solid #f3f3f3;
        border-top: 2px solid #666;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-right: 8px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .settings-popup.loading {
        pointer-events: none;
        opacity: 0.8;
    }
`;
document.head.appendChild(style);

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeSettings);

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeSettings();
    }
});

// Global error handler
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    showStatus('An unexpected error occurred. Please try again.', 'error');
});