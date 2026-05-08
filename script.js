const dialog = document.querySelector("#authDialog");
const authButtons = document.querySelectorAll("[data-open-auth]");
const saveButton = document.querySelector("#saveAccount");
const authNote = document.querySelector("#authNote");

authButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    }
  });
});

saveButton.addEventListener("click", (event) => {
  event.preventDefault();
  const username = document.querySelector("#username").value.trim();
  const email = document.querySelector("#email").value.trim();
  const plan = document.querySelector("#plan").value;

  if (!username || !email) {
    authNote.textContent = "Add a username and email to continue.";
    return;
  }

  localStorage.setItem(
    "simplitAccount",
    JSON.stringify({
      username,
      email,
      plan,
      createdAt: new Date().toISOString()
    })
  );

  authNote.textContent = `Saved ${username}. In production this would send you to Stripe Checkout.`;
  setTimeout(() => dialog.close(), 1100);
});
