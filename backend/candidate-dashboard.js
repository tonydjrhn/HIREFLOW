// =====================================================
// HIREFLOW - CANDIDATE LOGIN PROTECTION
// =====================================================

(function () {

    const userData = localStorage.getItem("hireflowUser");

    // No logged-in user → go to login
    if (!userData) {
        window.location.replace("login.html");
        return;
    }

    // Make sure stored data is valid
    try {
        const user = JSON.parse(userData);

        if (!user || !user.email) {
            localStorage.removeItem("hireflowUser");
            window.location.replace("login.html");
            return;
        }

        // Make sure this is a candidate account
        if (
            user.role &&
            user.role.toLowerCase() !== "candidate"
        ) {
            localStorage.removeItem("hireflowUser");
            window.location.replace("login.html");
            return;
        }

    } catch (error) {

        console.error(
            "Invalid login session:",
            error
        );

        localStorage.removeItem("hireflowUser");

        window.location.replace("login.html");
    }

})();
// ==========================================
// HireFlow Candidate Dashboard
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    console.log("HireFlow Candidate Dashboard initialized.");

    // Get logged-in user
    const userData = localStorage.getItem("hireflowUser");

    if (!userData) {
        console.warn("No logged-in user found.");
        return;
    }

    let user;

    try {
        user = JSON.parse(userData);
    } catch (error) {
        console.error("Could not read user data:", error);
        return;
    }

    console.log("Logged-in user:", user);

    // ==========================================
    // USER INFORMATION
    // ==========================================

    const userName = user.name || "Candidate";
    const userEmail = user.email || "";

    // First letter for avatar
    const initial = userName.charAt(0).toUpperCase();

    // ==========================================
    // GREETING
    // ==========================================

    const greeting = document.querySelector("h1");

    if (greeting) {
        greeting.innerHTML = `
            Good morning, <span>${userName}</span> 👋
        `;
    }

    // ==========================================
    // PROFILE NAME
    // ==========================================

    const profileName = document.querySelector(
        ".profile-name, .user-name"
    );

    if (profileName) {
        profileName.textContent = userName;
    }

    // ==========================================
    // PROFILE EMAIL
    // ==========================================

    const profileEmail = document.querySelector(
        ".profile-email, .user-email"
    );

    if (profileEmail) {
        profileEmail.textContent = userEmail;
    }

    // ==========================================
    // AVATAR
    // ==========================================

    const avatars = document.querySelectorAll(
        ".profile-avatar, .avatar"
    );

    avatars.forEach(avatar => {
        avatar.textContent = initial;
    });

    console.log("Dashboard loaded for:", userName);
});
// =====================================================
// EDUCATION — ADD / SAVE / REMOVE
// =====================================================

const addEducationBtn = document.querySelector("#addEducationBtn");

if (addEducationBtn) {
    addEducationBtn.addEventListener("click", () => {
        showEducationForm();
    });
}

function showEducationForm() {

    // Prevent duplicate forms
    if (document.querySelector("#educationForm")) {
        return;
    }

    const educationSection =
        document.querySelector(".education-section") ||
        document.querySelector("#educationSection");

    if (!educationSection) {
        console.error("Education section not found.");
        return;
    }

    const form = document.createElement("div");

    form.id = "educationForm";

    form.innerHTML = `
        <div class="education-form-card">

            <div class="education-form-header">
                <div>
                    <span class="card-label">NEW EDUCATION</span>
                    <h3>Add Education</h3>
                </div>

                <button
                    type="button"
                    id="cancelEducationBtn"
                    class="education-cancel"
                >
                    ×
                </button>
            </div>

            <div class="education-form-grid">

                <div class="form-group">
                    <label>Degree / Course</label>

                    <input
                        type="text"
                        id="educationDegree"
                        placeholder="e.g. B.E. Computer Science"
                    >
                </div>

                <div class="form-group">
                    <label>College / University</label>

                    <input
                        type="text"
                        id="educationInstitution"
                        placeholder="e.g. Anna University"
                    >
                </div>

                <div class="form-group">
                    <label>Graduation Year</label>

                    <input
                        type="text"
                        id="educationYear"
                        placeholder="e.g. 2026"
                        maxlength="4"
                    >
                </div>

            </div>

            <div class="education-form-actions">

                <button
                    type="button"
                    id="cancelEducationBtn2"
                    class="secondary-button"
                >
                    Cancel
                </button>

                <button
                    type="button"
                    id="saveEducationBtn"
                    class="save-button"
                >
                    Add Education
                </button>

            </div>

        </div>
    `;

    educationSection.appendChild(form);

    document
        .querySelector("#cancelEducationBtn")
        ?.addEventListener(
            "click",
            closeEducationForm
        );

    document
        .querySelector("#cancelEducationBtn2")
        ?.addEventListener(
            "click",
            closeEducationForm
        );

    document
        .querySelector("#saveEducationBtn")
        ?.addEventListener(
            "click",
            addEducation
        );
}


// =====================================================
// ADD EDUCATION TO CURRENT PROFILE
// =====================================================

async function addEducation() {

    const degree =
        document
            .querySelector("#educationDegree")
            ?.value
            .trim();

    const institution =
        document
            .querySelector("#educationInstitution")
            ?.value
            .trim();

    const graduationYear =
        document
            .querySelector("#educationYear")
            ?.value
            .trim();

    if (!degree || !institution || !graduationYear) {

        alert(
            "Please fill in degree, institution and graduation year."
        );

        return;
    }

    if (!/^\d{4}$/.test(graduationYear)) {

        alert(
            "Please enter a valid 4-digit graduation year."
        );

        return;
    }


    const button =
        document.querySelector(
            "#saveEducationBtn"
        );

    button.disabled = true;
    button.textContent = "Saving...";


    try {

        // Get latest profile
        const response =
            await fetch(
                `${API_URL}/api/profile/${userId}`
            );

        const data =
            await response.json();

        if (!response.ok || !data.success) {

            throw new Error(
                data.message ||
                "Unable to load profile"
            );
        }


        const existingEducation =
            Array.isArray(data.user.education)
                ? data.user.education
                : [];


        // Add new education
        existingEducation.push({

            degree: degree,

            institution: institution,

            graduationYear: graduationYear

        });


        // Save complete education array
        const saveResponse =
            await fetch(
                `${API_URL}/api/profile/${userId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        education:
                            existingEducation

                    })
                }
            );


        const saveData =
            await saveResponse.json();


        if (!saveResponse.ok ||
            !saveData.success) {

            throw new Error(
                saveData.message ||
                "Failed to save education"
            );
        }


        // Close form
        closeEducationForm();


        // Refresh education display
        await loadEducation();


        console.log(
            "Education added successfully."
        );


    } catch (error) {

        console.error(
            "Education save error:",
            error
        );

        alert(
            "Unable to save education."
        );

        button.disabled = false;

        button.textContent =
            "Add Education";
    }
}


// =====================================================
// LOAD EDUCATION
// =====================================================

async function loadEducation() {

    try {

        const response =
            await fetch(
                `${API_URL}/api/profile/${userId}`
            );

        const data =
            await response.json();

        if (!response.ok ||
            !data.success) {

            return;
        }


        const education =
            Array.isArray(data.user.education)
                ? data.user.education
                : [];


        const container =
            document.querySelector(
                "#educationList"
            );


        if (!container) {

            console.warn(
                "educationList container not found."
            );

            return;
        }


        container.innerHTML = "";


        if (education.length === 0) {

            container.innerHTML = `
                <div class="empty-state">

                    <div class="empty-icon">
                        🎓
                    </div>

                    <h3>No education added yet</h3>

                    <p>
                        Add your educational qualifications
                        to strengthen your profile.
                    </p>

                </div>
            `;

            return;
        }


        education.forEach(
            (item, index) => {

                const card =
                    document.createElement("div");

                card.className =
                    "education-item";

                card.innerHTML = `

                    <div class="education-icon">
                        🎓
                    </div>

                    <div class="education-details">

                        <h3>
                            ${escapeHTML(
                                item.degree || ""
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                item.institution || ""
                            )}
                        </p>

                        <span>
                            ${escapeHTML(
                                item.graduationYear || ""
                            )}
                        </span>

                    </div>

                    <button
                        type="button"
                        class="education-delete"
                        data-index="${index}"
                    >
                        Delete
                    </button>

                `;

                container.appendChild(card);
            }
        );


        container
            .querySelectorAll(
                ".education-delete"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        deleteEducation(
                            Number(
                                button.dataset.index
                            )
                        );

                    }
                );

            });


    } catch (error) {

        console.error(
            "Education loading error:",
            error
        );

    }
}


// =====================================================
// DELETE EDUCATION
// =====================================================

async function deleteEducation(index) {

    if (
        !confirm(
            "Delete this education entry?"
        )
    ) {

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/api/profile/${userId}`
            );

        const data =
            await response.json();

        if (!response.ok ||
            !data.success) {

            return;
        }


        const education =
            Array.isArray(data.user.education)
                ? data.user.education
                : [];


        education.splice(index, 1);


        const saveResponse =
            await fetch(
                `${API_URL}/api/profile/${userId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        education
                    })
                }
            );


        const saveData =
            await saveResponse.json();


        if (!saveResponse.ok ||
            !saveData.success) {

            throw new Error(
                saveData.message ||
                "Failed to delete education"
            );
        }


        await loadEducation();


    } catch (error) {

        console.error(
            "Education delete error:",
            error
        );

        alert(
            "Unable to delete education."
        );
    }
}


// =====================================================
// CLOSE EDUCATION FORM
// =====================================================

function closeEducationForm() {

    const form =
        document.querySelector(
            "#educationForm"
        );

    if (form) {
        form.remove();
    }
}


// =====================================================
// START EDUCATION
// =====================================================

loadEducation();
document.addEventListener("DOMContentLoaded", () => {
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            // Clear candidate login/session data
            localStorage.removeItem("candidate");
            localStorage.removeItem("candidateUser");
            localStorage.removeItem("user");
            sessionStorage.clear();

            // Go to login page
            window.location.href = "login.html";
        });
    }
});
// =====================================================
// HIREFLOW - CANDIDATE LOGOUT
// =====================================================

document.addEventListener("DOMContentLoaded", function () {

    const logoutBtn =
        document.getElementById("logoutBtn");

    if (!logoutBtn) {
        console.warn(
            "Logout button not found."
        );
        return;
    }

    logoutBtn.addEventListener(
        "click",
        function () {

            console.log(
                "Logging out candidate..."
            );

            // Remove the actual login session
            localStorage.removeItem(
                "hireflowUser"
            );

            // Remove any older/alternative login keys
            localStorage.removeItem(
                "user"
            );

            localStorage.removeItem(
                "loggedInUser"
            );

            localStorage.removeItem(
                "currentUser"
            );

            // Clear temporary session data
            sessionStorage.clear();

            // Prevent returning to dashboard with browser Back
            window.location.replace(
                "login.html"
            );
        }
    );

});