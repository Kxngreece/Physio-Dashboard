const sidebar = document.querySelector('.sidebar');
const content = document.querySelector('#content');
const toggleButton = document.querySelector('.sidebarToggle');

toggleButton.addEventListener('click', () => {
  sidebar.classList.toggle('expanded'); // Toggle 'expanded' class
});
