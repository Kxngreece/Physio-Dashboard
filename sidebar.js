// Sidebar toggle functionality
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");

sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    content.classList.toggle("expanded");
  });

// Sidebar toggle functionality
const sidebarToggle = document.getElementById("sidebarToggle");
const sidebar = document.getElementById("sidebar");
const content = document.getElementById("content");

// Toggle sidebar on button click
sidebarToggle.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    content.classList.toggle("expanded");
});

// Expand sidebar on mouse enter (hover)
sidebar.addEventListener("mouseenter", () => {
    sidebar.classList.add("expanded");
    sidebar.classList.remove("collapsed");
});

// Collapse sidebar on mouse leave
sidebar.addEventListener("mouseleave", () => {
    if (!sidebar.classList.contains("pinned")) {
        sidebar.classList.remove("expanded");
        sidebar.classList.add("collapsed");
    }
});

