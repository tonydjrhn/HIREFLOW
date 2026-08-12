/* =========================================================
   HIRE FLOW — REGISTRATION
   ========================================================= */

const form =
    document.getElementById("registerForm");

const password =
    document.getElementById("password");

const passwordToggle =
    document.getElementById("passwordToggle");

const strengthBars =
    document.querySelectorAll(".strength-bars span");

const strengthText =
    document.getElementById("strengthText");

const roleCards =
    document.querySelectorAll(".role-card");

const successOverlay =
    document.getElementById("successOverlay");

const successBtn =
    document.getElementById("successBtn");


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

passwordToggle.addEventListener("click", () => {

    const icon =
        passwordToggle.querySelector("i");

    if (password.type === "password") {

        password.type = "text";

        icon.classList.remove("fa-eye");

        icon.classList.add("fa-eye-slash");

        passwordToggle.setAttribute(
            "aria-label",
            "Hide password"
        );

    } else {

        password.type = "password";

        icon.classList.remove("fa-eye-slash");

        icon.classList.add("fa-eye");

        passwordToggle.setAttribute(
            "aria-label",
            "Show password"
        );

    }

});


/* =========================================================
   PASSWORD STRENGTH
   ========================================================= */

password.addEventListener("input", () => {

    const value = password.value;

    let score = 0;


    if (value.length >= 8) {
        score++;
    }

    if (/[A-Z]/.test(value)) {
        score++;
    }

    if (/[0-9]/.test(value)) {
        score++;
    }

    if (/[^A-Za-z0-9]/.test(value)) {
        score++;
    }


    strengthBars.forEach(bar => {

        bar.style.background = "#29292e";

    });


    if (score === 0) {

        strengthText.textContent =
            "Password strength";

    }


    if (score === 1) {

        strengthBars[0].style.background =
            "#f87171";

        strengthText.textContent =
            "Weak password";

        strengthText.style.color =
            "#f87171";

    }


    if (score === 2) {

        strengthBars[0].style.background =
            "#fbbf24";

        strengthBars[1].style.background =
            "#fbbf24";

        strengthText.textContent =
            "Fair password";

        strengthText.style.color =
            "#fbbf24";

    }


    if (score === 3) {

        for (let i = 0; i < 3; i++) {

            strengthBars[i].style.background =
                "#a78bfa";

        }

        strengthText.textContent =
            "Good password";

        strengthText.style.color =
            "#a78bfa";

    }


    if (score === 4) {

        strengthBars.forEach(bar => {

            bar.style.background =
                "#34d399";

        });

        strengthText.textContent =
            "Strong password";

        strengthText.style.color =
            "#34d399";

    }

});


/* =========================================================
   ROLE SELECTION
   ========================================================= */

roleCards.forEach(card => {

    card.addEventListener("click", () => {

        roleCards.forEach(item => {

            item.classList.remove("selected");

        });


        card.classList.add("selected");


        const radio =
            card.querySelector("input");

        radio.checked = true;

    });

});


/* =========================================================
   FORM VALIDATION
   ========================================================= */

form.addEventListener("submit", async event => {
    event.preventDefault();
    event.preventDefault();
    console.log("Form submit triggered!");


    const fullName =
        document.getElementById("fullName");

    const email =
        document.getElementById("email");

    const passwordError =
        document.getElementById("passwordError");

    const nameError =
        document.getElementById("nameError");

    const emailError =
        document.getElementById("emailError");

    const terms =
        document.getElementById("terms");


    nameError.textContent = "";
    emailError.textContent = "";
    passwordError.textContent = "";


    let valid = true;


    /* NAME */

    if (fullName.value.trim().length < 2) {

        nameError.textContent =
            "Please enter your full name.";

        valid = false;

    }


    /* EMAIL */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (!emailPattern.test(email.value.trim())) {

        emailError.textContent =
            "Please enter a valid email address.";

        valid = false;

    }


    /* PASSWORD */

    if (password.value.length < 8) {

        passwordError.textContent =
            "Password must contain at least 8 characters.";

        valid = false;

    }


    /* TERMS */

    if (!terms.checked) {

        alert(
            "Please accept the Terms of Service and Privacy Policy."
        );

        valid = false;

    }


    if (!valid) {
        return;
    }


    /* =====================================================
      ============================================================
   CREATE ACCOUNT
============================================================ */

const button = document.getElementById("createAccountBtn");

button.disabled = true;
button.querySelector("span").textContent = "Creating account...";

try {
    console.log("Sending registration request... PRODUCTION");

    fetch("/api/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name: fullName.value.trim(),
            email: email.value.trim(),
            password: password.value
        })
    });

    const data = await response.json();

    console.log("Response received:", response.status);

    if (!response.ok) {
        throw new Error(data.message || "Registration failed");
    }

    console.log("Registration successful:", data);

    successOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

} catch (error) {

    console.error("Registration error:", error);

    alert(error.message || "Something went wrong. Please try again.");

    button.disabled = false;
    button.querySelector("span").textContent = "Create Account";
}

/* =========================================================
   SUCCESS CONTINUE
   ========================================================= */

successBtn.addEventListener("click", () => {

    successOverlay.classList.remove("active");

    document.body.style.overflow = "";

});


/* =========================================================
   ESCAPE
   ========================================================= */

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        successOverlay.classList.contains("active")
    ) {

        successOverlay.classList.remove("active");

        document.body.style.overflow = "";

    }

});


/* =========================================================
   CONSOLE
   ========================================================= */

console.log(
    "%cHireFlow Registration",
    "font-size: 20px; font-weight: 800; color: #8b5cf6;"
);

console.log(
    "Registration interface initialized."
);
});