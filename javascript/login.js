const form = document.getElementById("form");
const username_input = document.getElementById("username");
const password_input = document.getElementById("password");
const error_message = document.getElementById("error-message");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  let errors = [];

  const presetUser = "admin";
  const presetPass = "admin868";

  let user = username_input.value.trim();
  let pass = password_input.value.trim();

  // Validate inputs
  if (user === "" || user == null) {
    errors.push("Email is required");
    username_input.parentElement.classList.add("incorrect");
  }
  if (pass === "" || pass == null) {
    errors.push("Password is required");
    password_input.parentElement.classList.add("incorrect");
  }

  if (errors.length === 0) {
    if (user === presetUser && pass === presetPass) {
      window.location.href = "home.html";
    } else {
      errors.push("Invalid credentials");
      error_message.innerText = errors.join(". ");
      username_input.parentElement.classList.add("incorrect");
      password_input.parentElement.classList.add("incorrect");
    }
  } else {
    error_message.innerText = errors.join(". ");
  }
});

const allInputs = [username_input, password_input].filter(
  (input) => input != null
);

allInputs.forEach((input) => {
  input.addEventListener("input", () => {
    if (input.parentElement.classList.contains("incorrect")) {
      input.parentElement.classList.remove("incorrect");
      error_message.innerText = "";
    }
  });
});
