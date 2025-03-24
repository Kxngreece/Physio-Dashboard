// Update time and date
function updateTimeAndDate() {
  const now = new Date();
  document.getElementById("time").textContent = now.toLocaleTimeString();
  document.getElementById("date").textContent = now.toLocaleDateString();
}

// Update every second
setInterval(updateTimeAndDate, 1000);
updateTimeAndDate();
