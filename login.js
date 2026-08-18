/* =========================================================
   HIRE FLOW — LOGIN
   ========================================================= */

const loginForm =
    document.getElementById("loginForm");

const loginEmail =
    document.getElementById("loginEmail");

const loginPassword =
    document.getElementById("loginPassword");

const togglePassword =
    document.getElementById("togglePassword");

const loginButton =
    document.getElementById("loginButton");

const demoLogin =
    document.getElementById("demoLogin");

const forgotPassword =
    document.getElementById("forgotPassword");

const forgotOverlay =
    document.getElementById("forgotOverlay");

const closeForgot =
    document.getElementById("closeForgot");

const resetButton =
    document.getElementById("resetButton");


/* =========================================================
   PASSWORD VISIBILITY
   ========================================================= */

togglePassword.addEventListener("click", () => {

    const icon =
        togglePassword.querySelector("i");


    if (loginPassword.type === "password") {

        loginPassword.type = "text";

        icon.classList.remove("fa-eye");

        icon.classList.add("fa-eye-slash");

    } else {

        loginPassword.type = "password";

        icon.classList.remove("fa-eye-slash");

        icon.classList.add("fa-eye");

    }

});


/* =========================================================
   LOGIN VALIDATION
   ========================================================= */

loginForm.addEventListener("submit", async event => {

    event.preventDefault();


    const emailError =
        document.getElementById(
            "loginEmailError"
        );

    const passwordError =
        document.getElementById(
            "loginPasswordError"
        );


    emailError.textContent = "";
    passwordError.textContent = "";


    let valid = true;


    /* EMAIL */

    const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
        !emailPattern.test(
            loginEmail.value.trim()
        )
    ) {

        emailError.textContent =
            "Enter a valid email address.";

        valid = false;

    }


    /* PASSWORD */

    if (loginPassword.value.length < 8) {

        passwordError.textContent =
            "Password must contain at least 8 characters.";

        valid = false;

    }


    if (!valid) {
        return;
    }


 /* =====================================================
   REAL LOGIN
   ===================================================== */

loginButton.disabled = true;

loginButton.querySelector("span").textContent = "Signing in...";

try {

    console.log("Sending login request...");

    const response = await fetch(
        "/api/login",
        {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                email: loginEmail.value.trim().toLowerCase(),
                password: loginPassword.value
            })
        }
    );

    const data = await response.json();

    console.log("Response status:", response.status);
    console.log("Login response:", data);

    if (!response.ok || !data.success) {
        throw new Error(
            data.message || "Login failed"
        );
    }

    console.log("Login successful:", data.user);

    // Store logged-in user
    localStorage.setItem(
        "hireflowUser",
        JSON.stringify(data.user)
    );

    // Redirect based on role
    if (data.user.role === "recruiter") {

        window.location.href =
            "recruiter-dashboard.html";

    } else {

        window.location.href =
            "candidate-dashboard.html";
    }

} catch (error) {

    console.error("Login error:", error);

    passwordError.textContent =
        error.message || "Unable to login. Please try again.";

} finally {

    loginButton.disabled = false;

    loginButton.querySelector("span").textContent =
        "Sign In";
}

});


/* =========================================================
   DEMO ACCOUNT
   ========================================================= */

demoLogin.addEventListener("click", () => {

    loginEmail.value =
        "demo@hireflow.com";

    loginPassword.value =
        "HireFlow@123";


    loginEmail.focus();

});


/* =========================================================
   FORGOT PASSWORD
   ========================================================= */

forgotPassword.addEventListener("click", event => {

    event.preventDefault();

    forgotOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

});


/* =========================================================
   CLOSE FORGOT MODAL
   ========================================================= */

closeForgot.addEventListener("click", () => {

    forgotOverlay.classList.remove("active");

    document.body.style.overflow = "";

});


/* =========================================================
   CLICK OUTSIDE
   ========================================================= */

forgotOverlay.addEventListener("click", event => {

    if (event.target === forgotOverlay) {

        forgotOverlay.classList.remove("active");

        document.body.style.overflow = "";

    }

});


/* =========================================================
   RESET PASSWORD
   ========================================================= */

resetButton.addEventListener("click", () => {

    const email =
        document.getElementById(
            "resetEmail"
        ).value.trim();


    if (!email) {

        alert(
            "Please enter your email address."
        );

        return;

    }


    alert(
        "Password reset flow will be connected to the backend."
    );


    forgotOverlay.classList.remove("active");

    document.body.style.overflow = "";

});


/* =========================================================
   ESCAPE KEY
   ========================================================= */

document.addEventListener("keydown", event => {

    if (
        event.key === "Escape" &&
        forgotOverlay.classList.contains("active")
    ) {

        forgotOverlay.classList.remove("active");

        document.body.style.overflow = "";

    }

});


/* =========================================================
   CONSOLE
   ========================================================= */

console.log(
    "%cHireFlow Login",
    "font-size: 20px; font-weight: 800; color: #8b5cf6;"
);

console.log(
    "Login interface initialized."
);