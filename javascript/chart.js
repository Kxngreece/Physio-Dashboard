// Doughnut Chart 1
const ctx1 = document.getElementById("doughnutChart").getContext("2d");
const gradient1 = ctx1.createLinearGradient(0, 0, ctx1.canvas.width, 0);
gradient1.addColorStop(0, "#002767");
gradient1.addColorStop(0.5, "#134492");
gradient1.addColorStop(1, "#2e5daa");

const xValues1 = ["Knee Rotation"];
const yValues1 = [90, 90];
const barColors1 = [gradient1, "#f1f3f9"];

new Chart(ctx1, {
  type: "doughnut",
  data: {
    labels: xValues1,
    datasets: [
      {
        backgroundColor: barColors1,
        data: yValues1,
      },
    ],
  },
  options: {
    rotation: -90,
    circumference: 180,
    plugins: {
      legend: {
        display: false,
      },
    },
  },
});

// Doughnut Chart 2
const doughnutCtx2 = document.getElementById("doughnutChart2").getContext("2d");
new Chart(doughnutCtx2, {
  type: "doughnut",
  data: {
    labels: ["Daily", "Other"],
    datasets: [
      {
        data: [60, 40],
        backgroundColor: ["#FFCE56", "#4BC0C0"],
      },
    ],
  },
  options: {
    responsive: true,
  },
});
