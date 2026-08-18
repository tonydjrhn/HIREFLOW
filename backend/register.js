/* =========================================================
   HIRE FLOW — REGISTRATION
========================================================= */

"use strict";


/* =========================================================
   GET ELEMENTS
========================================================= */

const form = document.getElementById("registerForm");

const password = document.getElementById("password");

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
   CHECK REQUIRED ELEMENTS
========================================================= */

if (!form) {
    console.error("ERROR: registerForm not found.");
}

if (!password) {
    console.error("ERROR: password input not found.");
}

if (!passwordToggle) {
    console.error("ERROR: passwordToggle not found.");
}


/* =========================================================
   PASSWORD VISIBILITY
========================================================= */

if (passwordToggle && password) {

    passwordToggle.addEventListener("click", () => {

        const icon = passwordToggle.querySelector("i");

        if (password.type === "password") {

            password.type = "text";

            if (icon) {
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            }

            passwordToggle.setAttribute(
                "aria-label",
                "Hide password"
            );

        } else {

            password.type = "password";

            if (icon) {
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }

            passwordToggle.setAttribute(
                "aria-label",
                "Show password"
            );

        }

    });

}


/* =========================================================
   PASSWORD STRENGTH
========================================================= */

if (password) {

    password.addEventListener("input", () => {

        const value = password.value;

        let score = 0;


        /* Reset bars */

        strengthBars.forEach(bar => {

            bar.style.background = "#29292e";

        });


        /* Check password */

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


        /* Score 0 */

        if (score === 0) {

            strengthText.textContent =
                "Password strength";

            strengthText.style.color = "";

        }


        /* Score 1 */

        if (score === 1) {

            if (strengthBars[0]) {
                strengthBars[0].style.background =
                    "#f87171";
            }

            strengthText.textContent =
                "Weak password";

            strengthText.style.color =
                "#f87171";

        }


        /* Score 2 */

        if (score === 2) {

            if (strengthBars[0]) {
                strengthBars[0].style.background =
                    "#fbbf24";
            }

            if (strengthBars[1]) {
                strengthBars[1].style.background =
                    "#fbbf24";
            }

            strengthText.textContent =
                "Fair password";

            strengthText.style.color =
                "#fbbf24";

        }


        /* Score 3 */

        if (score === 3) {

            for (let i = 0; i < 3; i++) {

                if (strengthBars[i]) {

                    strengthBars[i].style.background =
                        "#a78bfa";

                }

            }

            strengthText.textContent =
                "Good password";

            strengthText.style.color =
                "#a78bfa";

        }


        /* Score 4 */

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

}


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
            card.querySelector("input[type='radio']");


        if (radio) {

            radio.checked = true;

        }

    });

});


/* =========================================================
   FORM SUBMISSION
========================================================= */

if (form) {

    form.addEventListener("submit", async event => {

        event.preventDefault();

        console.log(
            "HireFlow: Form submit triggered."
        );


        /* =================================================
           GET FORM FIELDS
        ================================================= */

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

        const button =
            document.getElementById("createAccountBtn");


        /* =================================================
           CLEAR OLD ERRORS
        ================================================= */

        if (nameError) {
            nameError.textContent = "";
        }

        if (emailError) {
            emailError.textContent = "";
        }

        if (passwordError) {
            passwordError.textContent = "";
        }


        let valid = true;


        /* =================================================
           NAME VALIDATION
        ================================================= */

        if (
            !fullName ||
            fullName.value.trim().length < 2
        ) {

            if (nameError) {

                nameError.textContent =
                    "Please enter your full name.";

            }

            valid = false;

        }


        /* =================================================
           EMAIL VALIDATION
        ================================================= */

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


        if (
            !email ||
            !emailPattern.test(
                email.value.trim()
            )
        ) {

            if (emailError) {

                emailError.textContent =
                    "Please enter a valid email address.";

            }

            valid = false;

        }


        /* =================================================
           PASSWORD VALIDATION
        ================================================= */

        if (
            !password ||
            password.value.length < 8
        ) {

            if (passwordError) {

                passwordError.textContent =
                    "Password must contain at least 8 characters.";

            }

            valid = false;

        }


        /* =================================================
           TERMS VALIDATION
        ================================================= */

        if (!terms || !terms.checked) {

            alert(
                "Please accept the Terms of Service and Privacy Policy."
            );

            valid = false;

        }


        /* =================================================
           STOP IF INVALID
        ================================================= */

        if (!valid) {

            console.log(
                "HireFlow: Form validation failed."
            );

            return;

        }


        /* =================================================
           DISABLE BUTTON
        ================================================= */

        if (button) {

            button.disabled = true;

            const buttonText =
                button.querySelector("span");

            if (buttonText) {

                buttonText.textContent =
                    "Creating account...";

            }

        }


        /* =================================================
           SEND REGISTRATION REQUEST
           
           IMPORTANT:
           We intentionally use "serverResult"
           instead of "response".

           NEVER use localhost here.
        ================================================= */

        try {

            console.log(
                "HireFlow: Sending registration request..."
            );


            const serverResult =
                await fetch("/api/register", {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        name:
                            fullName.value.trim(),

                        email:
                            email.value.trim(),

                        password:
                            password.value

                    })

                });


            console.log(
                "HireFlow: Server status =",
                serverResult.status
            );


            /* =================================================
               READ SERVER DATA
            ================================================= */

            let serverData = {};

            try {

                serverData =
                    await serverResult.json();

            } catch (jsonError) {

                console.error(
                    "HireFlow: Server returned invalid JSON.",
                    jsonError
                );

                throw new Error(
                    "Server returned an invalid response."
                );

            }


            console.log(
                "HireFlow: Server data =",
                serverData
            );


            /* =================================================
               CHECK SERVER RESULT
            ================================================= */

            if (!serverResult.ok) {

                throw new Error(
                    serverData.message ||
                    "Registration failed."
                );

            }


            /* =================================================
               REGISTRATION SUCCESS
            ================================================= */

            console.log(
                "HireFlow: Registration successful!"
            );


            if (successOverlay) {

                successOverlay.classList.add(
                    "active"
                );

            }

            document.body.style.overflow =
                "hidden";


        } catch (error) {

            console.error(
                "HireFlow: Registration error:",
                error
            );


            alert(
                error.message ||
                "Unable to connect to the server. Please try again."
            );


            /* =================================================
               ENABLE BUTTON AGAIN
            ================================================= */

            if (button) {

                button.disabled = false;

                const buttonText =
                    button.querySelector("span");

                if (buttonText) {

                    buttonText.textContent =
                        "Create Account";

                }

            }

        }

    });

}


/* =========================================================
   SUCCESS BUTTON
========================================================= */

if (successBtn) {

    successBtn.addEventListener(
        "click",
        () => {

            if (successOverlay) {

                successOverlay.classList.remove(
                    "active"
                );

            }

            document.body.style.overflow = "";

        }
    );

}


/* =========================================================
   ESCAPE KEY
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            successOverlay &&
            successOverlay.classList.contains("active")
        ) {

            successOverlay.classList.remove(
                "active"
            );

            document.body.style.overflow = "";

        }

    }
);


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

console.log(
    "Production API: /api/register"
);