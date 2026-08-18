/* =========================================================
   HIRE FLOW — MAIN JAVASCRIPT
   ========================================================= */


/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const navbar = document.querySelector(".navbar");

const mobileMenuBtn =
    document.getElementById("mobileMenuBtn");

const mobileMenu =
    document.getElementById("mobileMenu");

const modalOverlay =
    document.getElementById("modalOverlay");

const modalClose =
    document.getElementById("modalClose");

const jobSearch =
    document.getElementById("jobSearch");

const jobGrid =
    document.getElementById("jobGrid");

const searchBtn =
    document.getElementById("searchBtn");


/* =========================================================
   NAVBAR — SCROLL EFFECT
   ========================================================= */

window.addEventListener("scroll", () => {

    if (window.scrollY > 30) {

        navbar.classList.add("scrolled");

    } else {

        navbar.classList.remove("scrolled");

    }

});


/* =========================================================
   MOBILE MENU
   ========================================================= */

if (mobileMenuBtn) {

    mobileMenuBtn.addEventListener("click", () => {

        mobileMenu.classList.toggle("active");

        const icon =
            mobileMenuBtn.querySelector("i");

        if (mobileMenu.classList.contains("active")) {

            icon.classList.remove("fa-bars");
            icon.classList.add("fa-xmark");

        } else {

            icon.classList.remove("fa-xmark");
            icon.classList.add("fa-bars");

        }

    });

}


/* =========================================================
   CLOSE MOBILE MENU WHEN LINK IS CLICKED
   ========================================================= */

const mobileLinks =
    mobileMenu.querySelectorAll("a");

mobileLinks.forEach(link => {

    link.addEventListener("click", () => {

        mobileMenu.classList.remove("active");

        const icon =
            mobileMenuBtn.querySelector("i");

        icon.classList.remove("fa-xmark");
        icon.classList.add("fa-bars");

    });

});


/* =========================================================
   MODAL SYSTEM
   ========================================================= */

function openModal() {

    modalOverlay.classList.add("active");

    document.body.style.overflow = "hidden";

}


function closeModal() {

    modalOverlay.classList.remove("active");

    document.body.style.overflow = "";

}


/* =========================================================
   MODAL BUTTONS
   ========================================================= */

const loginBtn =
    document.getElementById("loginBtn");

const getStartedBtn =
    document.getElementById("getStartedBtn");

const heroStartBtn =
    document.getElementById("heroStartBtn");

const exploreJobsBtn =
    document.getElementById("exploreJobsBtn");

const companyBtn =
    document.getElementById("companyBtn");

const ctaBtn =
    document.getElementById("ctaBtn");

const mobileLoginBtn =
    document.getElementById("mobileLoginBtn");

const mobileGetStartedBtn =
    document.getElementById("mobileGetStartedBtn");


if (loginBtn) {

    loginBtn.addEventListener("click", openModal);

}

if (getStartedBtn) {

    getStartedBtn.addEventListener("click", openModal);

}

if (heroStartBtn) {

    heroStartBtn.addEventListener("click", openModal);

}

if (companyBtn) {

    companyBtn.addEventListener("click", openModal);

}

if (ctaBtn) {

    ctaBtn.addEventListener("click", openModal);

}

if (mobileLoginBtn) {

    mobileLoginBtn.addEventListener("click", openModal);

}

if (mobileGetStartedBtn) {

    mobileGetStartedBtn.addEventListener(
        "click",
        openModal
    );

}


/* =========================================================
   EXPLORE JOBS BUTTON
   ========================================================= */

if (exploreJobsBtn) {

    exploreJobsBtn.addEventListener("click", () => {

        document
            .getElementById("jobs")
            .scrollIntoView({
                behavior: "smooth"
            });

    });

}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


/* =========================================================
   CLOSE MODAL WHEN CLICKING OUTSIDE
   ========================================================= */

if (modalOverlay) {

    modalOverlay.addEventListener("click", event => {

        if (event.target === modalOverlay) {

            closeModal();

        }

    });

}


/* =========================================================
   ESCAPE KEY CLOSES MODAL
   ========================================================= */

document.addEventListener("keydown", event => {

    if (event.key === "Escape") {

        closeModal();

    }

});


/* =========================================================
   BOOKMARK SYSTEM
   ========================================================= */

const bookmarkButtons =
    document.querySelectorAll(".bookmark-btn");

bookmarkButtons.forEach(button => {

    button.addEventListener("click", () => {

        const icon =
            button.querySelector("i");

        button.classList.toggle("saved");

        if (button.classList.contains("saved")) {

            icon.classList.remove(
                "fa-regular"
            );

            icon.classList.add(
                "fa-solid"
            );

            icon.style.color = "#a78bfa";

        } else {

            icon.classList.remove(
                "fa-solid"
            );

            icon.classList.add(
                "fa-regular"
            );

            icon.style.color = "";

        }

    });

});


/* =========================================================
   JOB SEARCH
   ========================================================= */

function searchJobs() {

    const searchTerm =
        jobSearch.value
            .trim()
            .toLowerCase();

    const jobCards =
        jobGrid.querySelectorAll(".job-card");

    let foundJobs = 0;


    jobCards.forEach(card => {

        const text =
            card.innerText.toLowerCase();

        if (
            searchTerm === "" ||
            text.includes(searchTerm)
        ) {

            card.style.display = "";

            foundJobs++;

        } else {

            card.style.display = "none";

        }

    });


    showSearchMessage(foundJobs);

}


/* =========================================================
   SEARCH MESSAGE
   ========================================================= */

function showSearchMessage(count) {

    let message =
        document.querySelector(
            ".search-message"
        );


    if (!message) {

        message =
            document.createElement("p");

        message.className =
            "search-message";

        message.style.color =
            "#71717a";

        message.style.fontSize =
            "11px";

        message.style.marginTop =
            "15px";

        jobGrid.parentNode.insertBefore(
            message,
            jobGrid
        );

    }


    if (jobSearch.value.trim() === "") {

        message.textContent = "";

        return;

    }


    if (count === 0) {

        message.textContent =
            "No matching jobs found.";

    } else {

        message.textContent =
            `${count} matching job${
                count > 1 ? "s" : ""
            } found.`;

    }

}


/* =========================================================
   SEARCH BUTTON
   ========================================================= */

if (searchBtn) {

    searchBtn.addEventListener(
        "click",
        searchJobs
    );

}


/* =========================================================
   SEARCH WHILE TYPING
   ========================================================= */

if (jobSearch) {

    jobSearch.addEventListener(
        "input",
        searchJobs
    );

}


/* =========================================================
   VIEW ALL JOBS
   ========================================================= */

const viewAllJobsBtn =
    document.getElementById(
        "viewAllJobsBtn"
    );

if (viewAllJobsBtn) {

    viewAllJobsBtn.addEventListener(
        "click",
        () => {

            jobSearch.value = "";

            searchJobs();

            document
                .getElementById("jobs")
                .scrollIntoView({
                    behavior: "smooth"
                });

        }
    );

}


/* =========================================================
   COMPANY DASHBOARD — ROW HOVER
   ========================================================= */

const candidateRows =
    document.querySelectorAll(
        ".candidate-row"
    );

candidateRows.forEach(row => {

    row.addEventListener(
        "mouseenter",
        () => {

            row.style.background =
                "rgba(255,255,255,0.025)";

        }
    );

    row.addEventListener(
        "mouseleave",
        () => {

            row.style.background = "";

        }
    );

});


/* =========================================================
   MODAL CONTINUE BUTTON
   ========================================================= */

const modalAction =
    document.querySelector(
        ".modal-action"
    );

if (modalAction) {

    modalAction.addEventListener(
        "click",
        () => {

            closeModal();

            setTimeout(() => {

                alert(
                    "Authentication module coming next."
                );

            }, 300);

        }
    );

}


/* =========================================================
   PAGE LOAD ANIMATION
   ========================================================= */

window.addEventListener(
    "load",
    () => {

        document.body.classList.add(
            "page-loaded"
        );

    }
);


/* =========================================================
   CONSOLE MESSAGE
   ========================================================= */

console.log(
    "%cHireFlow",
    "font-size: 24px; font-weight: 800; color: #8b5cf6;"
);

console.log(
    "AI-powered recruitment platform initialized."
);