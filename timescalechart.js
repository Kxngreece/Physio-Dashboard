document.addEventListener("DOMContentLoaded", function () {
    const ctx = document.getElementById('timescalechart').getContext('2d');

    const timescalechart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [
                '2025-01-01T08:00:00',
                '2025-01-01T10:00:00',
                '2025-01-01T12:00:00',
                '2025-01-01T14:00:00',
                '2025-01-01T16:00:00',
            ],
            datasets: [{
                label: 'Activity Over Time',
                data: [10, 30, 25, 40, 60],
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2,
                tension: 0.4,
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'h:mm a',
                        },
                    },
                    title: {
                        display: true,
                        text: 'Time of Day',
                    },
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Activity Level',
                    },
                },
            },
        },
    });
});
