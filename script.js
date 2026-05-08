const SUPABASE_URL = "https://wenezehwhokhzqpnkznm.supabase.co";
const SUPABASE_KEY = "sb_publishable_rMZSdPy_yy7vhcyuOnHseA_jNPYNb9t";

const dialog = document.querySelector("#authDialog");
const authButtons = document.querySelectorAll("[data-open-auth]");
const saveButton = document.querySelector("#saveAccount");
const authNote = document.querySelector("#authNote");
const authModeLabel = document.querySelector("#authModeLabel");
const authTitle = document.querySelector("#authTitle");
const authSubtitle = document.querySelector("#authSubtitle");
const usernameField = document.querySelector("#usernameField");
const planField = document.querySelector("#planField");
const usernameInput = document.querySelector("#username");
const emailInput = document.querySelector("#email");
const passwordInput = document.querySelector("#password");
const planSelect = document.querySelector("#plan");
const previewResult = document.querySelector("#previewResult");
const progress = document.querySelector(".scroll-progress");
const productShot = document.querySelector(".product-shot");

let authMode = "signup";

const previewLines = [
  "The main idea is that Simplit watches for copied text and gives focused writing help without switching apps.",
  "For a question, Simplit gives the answer first, then the short reason so it stays easy to use.",
  "Pro adds image tools, Sneaky Mode, faster responses, and a better model for heavier work."
];

let previewLine = 0;
let previewIndex = 0;

function typePreview() {
  if (!previewResult) return;

  const text = previewLines[previewLine];
  previewResult.textContent = text.slice(0, previewIndex);

  if (previewIndex < text.length) {
    previewIndex += 1;
    window.setTimeout(typePreview, 24);
    return;
  }

  window.setTimeout(() => {
    previewIndex = 0;
    previewLine = (previewLine + 1) % previewLines.length;
    typePreview();
  }, 1400);
}

function updateProgress() {
  if (!progress) return;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const amount = maxScroll <= 0 ? 0 : window.scrollY / maxScroll;
  progress.style.transform = `scaleX(${Math.min(1, Math.max(0, amount))})`;
}

function setupReveal() {
  const items = [...document.querySelectorAll("[data-reveal]")];

  items.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 45, 260)}ms`;
  });

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));
}

function setAuthMode(mode, selectedPlan = "Starter") {
  authMode = mode;
  const isSignIn = mode === "signin";

  authModeLabel.textContent = isSignIn ? "Log in" : "Create account";
  authTitle.textContent = isSignIn ? "Welcome back" : "Create your Simplit account";
  authSubtitle.textContent = isSignIn
    ? "Log in with the same email you use inside Simplit."
    : "Create an account, then use the same login inside the Mac app.";

  usernameField.classList.toggle("is-hidden", isSignIn);
  planField.classList.toggle("is-hidden", isSignIn);
  passwordInput.autocomplete = isSignIn ? "current-password" : "new-password";
  saveButton.textContent = isSignIn ? "Log in" : "Create account";
  planSelect.value = selectedPlan;
  authNote.textContent = "";
  authNote.className = "auth-note";
}

function showAuth(button) {
  const selectedMode = button.dataset.mode || "signup";
  const selectedPlan = button.dataset.plan || "Starter";
  setAuthMode(selectedMode, selectedPlan);

  if (typeof dialog?.showModal === "function") {
    dialog.showModal();
    window.setTimeout(() => emailInput.focus(), 80);
  }
}

function setAuthNote(message, type = "") {
  authNote.textContent = message;
  authNote.className = `auth-note ${type}`.trim();
}

async function callSupabaseAuth() {
  const username = usernameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const plan = planSelect.value;
  const isSignIn = authMode === "signin";

  if (!email || !password || (!isSignIn && !username)) {
    setAuthNote("Fill in the required fields to continue.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthNote("Password must be at least 6 characters.", "error");
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = isSignIn ? "Logging in..." : "Creating...";
  setAuthNote("");

  const endpoint = isSignIn
    ? `${SUPABASE_URL}/auth/v1/token?grant_type=password`
    : `${SUPABASE_URL}/auth/v1/signup`;

  const body = isSignIn
    ? { email, password }
    : {
        email,
        password,
        data: {
          display_name: username,
          selected_plan: plan
        }
      };

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`
      },
      body: JSON.stringify(body)
    });

    const json = await response.json();
    if (!response.ok) {
      throw new Error(json.msg || json.message || json.error_description || "Could not continue.");
    }

    localStorage.setItem(
      "simplitAccount",
      JSON.stringify({
        email,
        plan,
        accessToken: json.access_token || null,
        createdAt: new Date().toISOString()
      })
    );

    setAuthNote(
      json.access_token
        ? "Account ready. Open Simplit and log in with this email."
        : "Account created. Check your email if confirmation is enabled, then log in.",
      "success"
    );

    window.setTimeout(() => dialog.close(), 1500);
  } catch (error) {
    setAuthNote(error.message, "error");
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = isSignIn ? "Log in" : "Create account";
  }
}

authButtons.forEach((button) => {
  button.addEventListener("click", () => showAuth(button));
});

saveButton.addEventListener("click", (event) => {
  event.preventDefault();
  callSupabaseAuth();
});

window.addEventListener("scroll", updateProgress, { passive: true });
window.addEventListener("resize", updateProgress);

if (productShot) {
  productShot.addEventListener("mousemove", (event) => {
    const rect = productShot.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    productShot.style.transform = `translateY(-6px) rotateX(${y * -3}deg) rotateY(${x * 4}deg)`;
  });

  productShot.addEventListener("mouseleave", () => {
    productShot.style.transform = "";
  });
}

setupReveal();
updateProgress();
typePreview();
