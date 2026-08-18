// =====================================================
// HireFlow - Main JavaScript
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    // =================================================
    // GET STARTED BUTTONS
    // =================================================

    const getStartedBtn = document.getElementById("getStartedBtn");
    const mobileGetStartedBtn =
        document.getElementById("mobileGetStartedBtn");

    function goToRegister() {
        window.location.href = "register.html";
    }

    if (getStartedBtn) {
        getStartedBtn.addEventListener("click", goToRegister);
    }

    if (mobileGetStartedBtn) {
        mobileGetStartedBtn.addEventListener("click", goToRegister);
    }


    // =================================================
    // SIGN IN BUTTONS
    // =================================================

    const loginBtn = document.getElementById("loginBtn");
    const mobileLoginBtn =
        document.getElementById("mobileLoginBtn");

    function goToLogin() {
        window.location.href = "login.html";
    }

    if (loginBtn) {
        loginBtn.addEventListener("click", goToLogin);
    }

    if (mobileLoginBtn) {
        mobileLoginBtn.addEventListener("click", goToLogin);
    }


    // =================================================
    // FIND JOBS
    // =================================================

    const findJobsLinks =
        document.querySelectorAll('a[href="#jobs"]');

    findJobsLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {

            const jobsSection =
                document.getElementById("jobs");

            if (jobsSection) {
                event.preventDefault();

                jobsSection.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });


    // =================================================
    // HOW IT WORKS
    // =================================================

    const howItWorksLinks =
        document.querySelectorAll('a[href="#how-it-works"]');

    howItWorksLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {

            const section =
                document.getElementById("how-it-works");

            if (section) {
                event.preventDefault();

                section.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });


    // =================================================
    // COMPANIES
    // =================================================

    const companyLinks =
        document.querySelectorAll('a[href="#companies"]');

    companyLinks.forEach(function (link) {
        link.addEventListener("click", function (event) {

            const section =
                document.getElementById("companies");

            if (section) {
                event.preventDefault();

                section.scrollIntoView({
                    behavior: "smooth"
                });
            }
        });
    });


    // =================================================
    // MOBILE MENU
    // =================================================

    const mobileMenuBtn =
        document.getElementById("mobileMenuBtn");

    const mobileMenu =
        document.getElementById("mobileMenu");

    if (mobileMenuBtn && mobileMenu) {

        mobileMenuBtn.addEventListener("click", function () {

            mobileMenu.classList.toggle("active");

        });
    }


    // =================================================
    // CLOSE MOBILE MENU AFTER CLICK
    // =================================================

    if (mobileMenu) {

        const mobileLinks =
            mobileMenu.querySelectorAll("a");

        mobileLinks.forEach(function (link) {

            link.addEventListener("click", function () {
                mobileMenu.classList.remove("active");
            });

        });
    }


    // =================================================
    // MODAL CONTINUE BUTTON
    // =================================================

    const modalOverlay =
        document.getElementById("modalOverlay");

    const modalAction =
        document.querySelector(".modal-action");

    if (modalAction) {

        modalAction.addEventListener("click", function () {

            if (modalOverlay) {
                modalOverlay.classList.remove("active");
                modalOverlay.style.display = "none";
            }

        });
    }


    // =================================================
    // ESCAPE KEY - CLOSE MODAL
    // =================================================

    document.addEventListener("keydown", function (event) {

        if (event.key === "Escape") {

            if (modalOverlay) {
                modalOverlay.classList.remove("active");
                modalOverlay.style.display = "none";
            }

            if (mobileMenu) {
                mobileMenu.classList.remove("active");
            }
        }

    });


    console.log("HireFlow JavaScript loaded successfully ✅");

});