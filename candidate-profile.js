// =====================================================
// HIREFLOW - CANDIDATE PROFILE
// CLEAN SINGLE VERSION
// =====================================================

const API_URL = "http://localhost:5000/api";
const SERVER_URL = "http://localhost:5000";

// =====================================================
// USER / HELPERS
// =====================================================

function getLoggedInUser() {
    const keys = [
        "hireflowUser",
        "user",
        "loggedInUser",
        "currentUser"
    ];

    for (const key of keys) {
        const stored = localStorage.getItem(key);

        if (!stored) {
            continue;
        }

        try {
            const user = JSON.parse(stored);

            if (user && (user.id || user._id)) {
                console.log(
                    "Logged-in user found:",
                    key
                );

                return user;
            }

        } catch (error) {
            console.error(
                "Invalid stored user:",
                error
            );
        }
    }

    return null;
}

function getUserId() {
    const user = getLoggedInUser();

    if (!user) {
        return null;
    }

    return user.id || user._id;
}


// =====================================================
// GET INPUT VALUE
// =====================================================

function getValue(id) {
    const element =
        document.getElementById(id);

    if (!element) {
        return "";
    }

    return String(
        element.value || ""
    ).trim();
}


// =====================================================
// SET INPUT VALUE
// =====================================================

function setValue(id, value) {
    const element =
        document.getElementById(id);

    if (element) {
        element.value =
            value || "";
    }
}


// =====================================================
// HTML ESCAPE
// =====================================================

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================================
// RESUME FILENAME
// =====================================================

function resumeFilename(resume) {

    if (!resume) {
        return "";
    }

    const filename =
        resume.filename ||
        resume.fileName ||
        resume.originalName ||
        resume.originalname ||
        resume.name;

    if (filename) {
        return String(filename);
    }

    if (resume.path) {
        return String(resume.path)
            .split(/[\\/]/)
            .pop();
    }

    return "";
}


// =====================================================
// RESUME URL
// =====================================================

function resumeUrl(resume) {

    if (!resume || !resume.path) {
        return "";
    }

    const pathValue =
        String(resume.path);

    if (
        /^https?:\/\//i.test(
            pathValue
        )
    ) {
        return pathValue;
    }

    return (
        SERVER_URL +
        (
            pathValue.startsWith("/")
                ? ""
                : "/"
        ) +
        pathValue
    );
}


// =====================================================
// PROFILE HEADER
// =====================================================

function updateProfileHeader(name) {

    const safeName =
        name || "Candidate";

    const initial =
        safeName
            .charAt(0)
            .toUpperCase();

    const avatarIds = [
        "largeAvatar",
        "profileAvatar"
    ];

    avatarIds.forEach(id => {

        const element =
            document.getElementById(id);

        if (!element) {
            return;
        }

        const hasPhoto =
            element.querySelector("img") ||
            element.style.backgroundImage;

        if (!hasPhoto) {
            element.textContent =
                initial;
        }

    });


    const nameIds = [
        "avatarName",
        "topProfileName"
    ];

    nameIds.forEach(id => {

        const element =
            document.getElementById(id);

        if (element) {
            element.textContent =
                safeName;
        }

    });
}


// =====================================================
// SHOW PROFILE PHOTO
// =====================================================

function showProfilePhoto(dataUrl) {

    if (!dataUrl) {
        return;
    }

    const avatarIds = [
        "profileAvatar",
        "largeAvatar"
    ];

    avatarIds.forEach(id => {

        const avatar =
            document.getElementById(id);

        if (!avatar) {
            return;
        }

        avatar.innerHTML = "";

        const img =
            document.createElement("img");

        img.src = dataUrl;

        img.alt =
            "Profile photo";

        img.style.width =
            "100%";

        img.style.height =
            "100%";

        img.style.objectFit =
            "cover";

        img.style.borderRadius =
            "inherit";

        avatar.appendChild(img);

    });
}


// =====================================================
// RESTORE PROFILE PHOTO
// =====================================================

function restoreProfilePhoto() {

    const savedPhoto =
        localStorage.getItem(
            "hireflowProfilePhoto"
        );

    if (savedPhoto) {
        showProfilePhoto(
            savedPhoto
        );
    }
}


// =====================================================
// INITIALIZE PROFILE PHOTO
// =====================================================

function initializeProfilePhoto() {

    const changePhotoBtn =
        document.getElementById(
            "changePhotoBtn"
        );

    const profilePhotoInput =
        document.getElementById(
            "profilePhotoInput"
        );

    if (
        !changePhotoBtn ||
        !profilePhotoInput
    ) {

        console.warn(
            "Profile photo controls not found."
        );

        return;
    }


    changePhotoBtn.type =
        "button";


    changePhotoBtn.addEventListener(
        "click",
        event => {

            event.preventDefault();

            profilePhotoInput.click();

        }
    );


    profilePhotoInput.addEventListener(
        "change",
        async () => {

            const file =
                profilePhotoInput.files &&
                profilePhotoInput.files[0];

            if (!file) {
                return;
            }


            if (
                !file.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Please select an image file."
                );

                profilePhotoInput.value = "";

                return;
            }


            if (
                file.size >
                5 * 1024 * 1024
            ) {

                alert(
                    "Image must be less than 5 MB."
                );

                profilePhotoInput.value = "";

                return;
            }


            const reader =
                new FileReader();


            reader.onload =
                function(event) {

                    const imageUrl =
                        event.target.result;

                    showProfilePhoto(
                        imageUrl
                    );

                    localStorage.setItem(
                        "hireflowProfilePhoto",
                        imageUrl
                    );

                    updateCompletionFromCurrentProfile();

                };


            reader.readAsDataURL(
                file
            );


            const userId =
                getUserId();

            if (!userId) {

                alert(
                    "Please login again."
                );

                return;
            }


            try {

                const formData =
                    new FormData();

                formData.append(
                    "profilePhoto",
                    file
                );

                formData.append(
                    "userId",
                    userId
                );


                const response =
                    await fetch(
                        `${API_URL}/profile/photo`,
                        {
                            method: "POST",
                            body: formData
                        }
                    );


                const data =
                    await response.json();


                if (
                    !response.ok ||
                    !data.success
                ) {

                    throw new Error(
                        data.message ||
                        "Photo upload failed."
                    );
                }


                console.log(
                    "Profile photo uploaded successfully."
                );


                await loadProfile();


            } catch (error) {

                console.error(
                    "Profile photo upload error:",
                    error
                );

                alert(
                    error.message ||
                    "Could not upload profile photo."
                );

            } finally {

                profilePhotoInput.value = "";

            }

        }
    );
}


// =====================================================
// LOAD PROFILE
// =====================================================

async function loadProfile() {

    const userId =
        getUserId();


    if (!userId) {

        console.error(
            "No logged-in user found."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/profile/${userId}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            console.error(
                "Profile loading failed:",
                data
            );

            return;
        }


        const profile =
            data.profile || {};


        console.log(
            "Profile loaded:",
            profile
        );


        // BASIC INFORMATION

        setValue(
            "fullName",
            profile.name
        );

        setValue(
            "email",
            profile.email
        );

        setValue(
            "phone",
            profile.phone
        );

        setValue(
            "location",
            profile.location
        );


        // PROFESSIONAL INFORMATION

        setValue(
            "professionalHeadline",
            profile.headline
        );

        setValue(
            "headline",
            profile.headline
        );

        setValue(
            "about",
            profile.about
        );

        setValue(
            "careerGoal",
            profile.careerGoal
        );


        // HEADER

        updateProfileHeader(
            profile.name
        );

        restoreProfilePhoto();


        // EDUCATION

        renderEducation(
            profile.education || []
        );


        // SKILLS

        renderSkills(
            profile.skills || []
        );


        // RESUME

        renderResume(
            profile.resume || null
        );


        // COMPLETION

        updateCompletion(
            profile
        );

        updateCompletionChecklist();


        console.log(
            "Profile loaded successfully."
        );


    } catch (error) {

        console.error(
            "Profile loading error:",
            error
        );

    }
}


// =====================================================
// COLLECT PROFILE DATA
// =====================================================

function collectProfileData() {

    return {

        name:
            getValue("fullName"),

        phone:
            getValue("phone"),

        location:
            getValue("location"),

        headline:
            getValue(
                "professionalHeadline"
            ) ||
            getValue("headline"),

        about:
            getValue("about"),

        careerGoal:
            getValue("careerGoal"),

        skills:
            getCurrentSkills(),

        education:
            getCurrentEducation()

    };
}


// =====================================================
// SAVE PROFILE
// =====================================================

async function saveProfile() {

    const userId =
        getUserId();


    if (!userId) {

        alert(
            "Please login again."
        );

        return;
    }


    const profileData =
        collectProfileData();


    try {

        console.log(
            "Saving profile:",
            profileData
        );


        const response =
            await fetch(
                `${API_URL}/profile/${userId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            profileData
                        )
                }
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Profile save failed."
            );
        }


        const savedProfile =
            data.profile ||
            profileData;


        updateStoredUser(
            savedProfile
        );


        updateProfileHeader(
            savedProfile.name
        );


        updateCompletion(
            savedProfile
        );


        updateCompletionChecklist();


        alert(
            "Profile saved successfully! ✅"
        );


    } catch (error) {

        console.error(
            "Profile save error:",
            error
        );


        alert(
            error.message ||
            "Unable to save profile."
        );

    }
}


// =====================================================
// SILENT PROFILE SAVE
// =====================================================

async function saveProfileSilently() {

    const userId =
        getUserId();


    if (!userId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/profile/${userId}`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(
                            collectProfileData()
                        )
                }
            );


        const data =
            await response.json();


        if (data.success) {

            updateCompletion(
                data.profile
            );

            updateCompletionChecklist();

        }


    } catch (error) {

        console.error(
            "Automatic save failed:",
            error
        );

    }
}


// =====================================================
// UPDATE LOCAL STORAGE USER
// =====================================================

function updateStoredUser(profile) {

    const keys = [
        "hireflowUser",
        "user",
        "loggedInUser",
        "currentUser"
    ];


    keys.forEach(key => {

        const stored =
            localStorage.getItem(key);

        if (!stored) {
            return;
        }


        try {

            const user =
                JSON.parse(stored);


            user.id =
                profile._id ||
                user.id;


            user.name =
                profile.name ||
                user.name;


            user.email =
                profile.email ||
                user.email;


            localStorage.setItem(
                key,
                JSON.stringify(user)
            );


        } catch (error) {

            console.error(
                "Could not update stored user:",
                error
            );

        }

    });
}


// =====================================================
// EDUCATION - GET CURRENT
// =====================================================

function getCurrentEducation() {

    const educationList =
        document.getElementById(
            "educationList"
        );


    if (!educationList) {
        return [];
    }


    const items =
        educationList.querySelectorAll(
            ".education-item"
        );


    const education = [];


    items.forEach(item => {

        const degree =
            item.dataset.degree ||
            "";

        const college =
            item.dataset.college ||
            "";

        const year =
            item.dataset.year ||
            "";


        if (
            degree ||
            college ||
            year
        ) {

            education.push({
                degree,
                college,
                year
            });

        }

    });


    return education;
}


// =====================================================
// EDUCATION - RENDER
// =====================================================

function renderEducation(
    education
) {

    const educationList =
        document.getElementById(
            "educationList"
        );


    if (!educationList) {
        return;
    }


    const items =
        Array.isArray(education)
            ? education
            : [];


    if (
        items.length === 0
    ) {

        educationList.innerHTML = `

            <div class="empty-state">

                <div class="empty-icon">
                    🎓
                </div>

                <h3>
                    No education added yet
                </h3>

                <p>
                    Add your degree, college and graduation year.
                </p>

                <button
                    type="button"
                    class="secondary-button"
                    id="emptyEducationBtn"
                >
                    + Add education
                </button>

            </div>

        `;


        const button =
            document.getElementById(
                "emptyEducationBtn"
            );


        if (button) {

            button.addEventListener(
                "click",
                showEducationForm
            );

        }


        return;
    }


    educationList.innerHTML = `

        <div class="education-header-actions">

            <button
                type="button"
                class="secondary-button"
                id="innerAddEducationBtn"
            >
                + Add education
            </button>

        </div>


        ${items.map(item => `

            <div
                class="education-item"
                data-degree="${escapeHtml(item.degree)}"
                data-college="${escapeHtml(item.college)}"
                data-year="${escapeHtml(item.year)}"
            >

                <div class="education-icon">
                    🎓
                </div>

                <div>

                    <h3>
                        ${escapeHtml(item.degree)}
                    </h3>

                    <p>
                        ${escapeHtml(item.college)}
                    </p>

                    <span>
                        ${escapeHtml(item.year)}
                    </span>

                </div>

            </div>

        `).join("")}

    `;


    const button =
        document.getElementById(
            "innerAddEducationBtn"
        );


    if (button) {

        button.addEventListener(
            "click",
            showEducationForm
        );

    }
}


// =====================================================
// SHOW EDUCATION FORM
// =====================================================

function showEducationForm() {

    const educationList =
        document.getElementById(
            "educationList"
        );


    if (!educationList) {

        console.error(
            "educationList not found"
        );

        return;
    }


    educationList.innerHTML = `

        <div class="education-form">

            <div class="form-group">

                <label>
                    Degree / Course
                </label>

                <input
                    type="text"
                    id="educationDegree"
                    placeholder="e.g. B.E. Electronics"
                >

            </div>


            <div class="form-group">

                <label>
                    College / University
                </label>

                <input
                    type="text"
                    id="educationCollege"
                    placeholder="Enter college/university"
                >

            </div>


            <div class="form-group">

                <label>
                    Graduation Year
                </label>

                <input
                    type="number"
                    id="educationYear"
                    placeholder="e.g. 2026"
                    min="1950"
                    max="2100"
                >

            </div>


            <button
                type="button"
                id="saveEducationBtn"
                class="primary-button"
            >
                Save Education
            </button>

        </div>

    `;


    const saveButton =
        document.getElementById(
            "saveEducationBtn"
        );


    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveEducation
        );

    }
}


// =====================================================
// SAVE EDUCATION
// =====================================================

async function saveEducation() {

    const degree =
        getValue(
            "educationDegree"
        );

    const college =
        getValue(
            "educationCollege"
        );

    const year =
        getValue(
            "educationYear"
        );


    if (
        !degree ||
        !college ||
        !year
    ) {

        alert(
            "Please fill all education details."
        );

        return;
    }


    const userId =
        getUserId();


    if (!userId) {

        alert(
            "Please login again."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/profile/${userId}`
            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Could not load profile."
            );

        }


        const existingEducation =
            data.profile.education ||
            [];


        const updatedEducation = [

            ...existingEducation,

            {
                degree,
                college,
                year
            }

        ];


        const saveResponse =
            await fetch(
                `${API_URL}/profile/${userId}`,
                {

                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            education:
                                updatedEducation
                        })

                }
            );


        const saveData =
            await saveResponse.json();


        if (
            !saveResponse.ok ||
            !saveData.success
        ) {

            throw new Error(
                saveData.message ||
                "Education save failed."
            );

        }


        renderEducation(
            saveData.profile.education ||
            updatedEducation
        );


        updateCompletion(
            saveData.profile
        );


        updateCompletionChecklist();


        alert(
            "Education saved successfully! ✅"
        );


    } catch (error) {

        console.error(
            "Education save error:",
            error
        );


        alert(
            error.message ||
            "Unable to save education."
        );

    }
}


// =====================================================
// INITIALIZE EDUCATION
// =====================================================

function initializeEducation() {

    const button =
        document.getElementById(
            "addEducationBtn"
        );


    if (!button) {
        return;
    }


    button.type =
        "button";


    button.addEventListener(
        "click",
        showEducationForm
    );
}


// =====================================================
// SKILLS - GET CURRENT
// =====================================================

function getCurrentSkills() {

    const skillTags =
        document.getElementById(
            "skillTags"
        );


    if (!skillTags) {
        return [];
    }


    const tags =
        skillTags.querySelectorAll(
            ".skill-tag"
        );


    const skills = [];


    tags.forEach(tag => {

        const clone =
            tag.cloneNode(true);


        const button =
            clone.querySelector(
                "button"
            );


        if (button) {
            button.remove();
        }


        const skill =
            clone.textContent.trim();


        if (skill) {
            skills.push(skill);
        }

    });


    return skills;
}


// =====================================================
// RENDER SKILLS
// =====================================================

function renderSkills(
    skills
) {

    const skillTags =
        document.getElementById(
            "skillTags"
        );


    if (!skillTags) {
        return;
    }


    skillTags.innerHTML = "";


    const items =
        Array.isArray(skills)
            ? skills
            : [];


    items.forEach(
        skill =>
            addSkillToUI(skill)
    );
}


// =====================================================
// ADD SKILL TO UI
// =====================================================

function addSkillToUI(
    skill
) {

    const skillTags =
        document.getElementById(
            "skillTags"
        );


    if (
        !skillTags ||
        !skill
    ) {

        return;
    }


    const normalized =
        String(skill).trim();


    if (!normalized) {
        return;
    }


    const existing =
        getCurrentSkills();


    if (
        existing.some(
            item =>
                item.toLowerCase() ===
                normalized.toLowerCase()
        )
    ) {

        return;
    }


    const tag =
        document.createElement(
            "span"
        );


    tag.className =
        "skill-tag";


    tag.innerHTML = `

        ${escapeHtml(normalized)}

        <button
            type="button"
            class="remove-skill"
        >
            ×
        </button>

    `;


    const removeButton =
        tag.querySelector(
            ".remove-skill"
        );


    if (removeButton) {

        removeButton.addEventListener(
            "click",
            async () => {

                tag.remove();

                await saveProfileSilently();

            }
        );

    }


    skillTags.appendChild(
        tag
    );
}


// =====================================================
// ADD SKILL
// =====================================================

async function addSkill() {

    const input =
        document.getElementById(
            "skillInput"
        );


    if (!input) {
        return;
    }


    const skill =
        input.value.trim();


    if (!skill) {
        return;
    }


    addSkillToUI(
        skill
    );


    input.value = "";


    await saveProfileSilently();
}


// =====================================================
// INITIALIZE SKILLS
// =====================================================

function initializeSkills() {

    const addButton =
        document.getElementById(
            "addSkillBtn"
        );


    const input =
        document.getElementById(
            "skillInput"
        );


    if (addButton) {

        addButton.type =
            "button";


        addButton.addEventListener(
            "click",
            addSkill
        );

    }


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Enter"
                ) {

                    event.preventDefault();

                    addSkill();

                }

            }
        );

    }
}


// =====================================================
// RESUME - DISPLAY
// =====================================================

function renderResume(
    resume
) {

    const resumeInput =
        document.getElementById(
            "resumeInput"
        );


    if (!resumeInput) {
        return;
    }


    const resumeSection =
        resumeInput.closest(
            ".profile-card"
        );


    if (!resumeSection) {
        return;
    }


    const oldDisplay =
        resumeSection.querySelector(
            ".resume-js-display"
        );


    if (oldDisplay) {
        oldDisplay.remove();
    }


    if (!resume) {

        console.log(
            "No resume saved in profile."
        );

        return;
    }


    const filename =
        resumeFilename(
            resume
        );


    if (!filename) {

        console.log(
            "Resume found but filename unavailable:",
            resume
        );

        return;
    }


    const url =
        resumeUrl(
            resume
        );


    const display =
        document.createElement(
            "div"
        );


    display.className =
        "resume-js-display";


    display.style.marginTop =
        "16px";


    display.style.padding =
        "14px";


    display.style.borderRadius =
        "12px";


    display.style.background =
        "rgba(139,92,246,0.08)";


    display.innerHTML = `

        <div
            style="
                font-weight:600;
                margin-bottom:10px;
            "
        >
            📄 ${escapeHtml(filename)}
        </div>


        <div
            style="
                display:flex;
                gap:8px;
                flex-wrap:wrap;
            "
        >

            <button
                type="button"
                class="secondary-button"
                data-resume-action="view"
            >
                View
            </button>


            <button
                type="button"
                class="secondary-button"
                data-resume-action="download"
            >
                Download
            </button>


            <button
                type="button"
                class="secondary-button"
                data-resume-action="replace"
            >
                Replace
            </button>

        </div>

    `;


    const uploadArea =
        resumeSection.querySelector(
            ".upload-area"
        );


    if (uploadArea) {

        uploadArea.appendChild(
            display
        );

    } else {

        resumeSection.appendChild(
            display
        );

    }


    // =================================================
    // VIEW BUTTON
    // =================================================

    const viewButton =
        display.querySelector(
            '[data-resume-action="view"]'
        );


    if (viewButton) {

        viewButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (!url) {

                    alert(
                        "Resume file URL is not available."
                    );

                    return;
                }


                window.open(
                    url,
                    "_blank",
                    "noopener,noreferrer"
                );

            }
        );

    }


    // =================================================
    // DOWNLOAD BUTTON
    // =================================================

    const downloadButton =
        display.querySelector(
            '[data-resume-action="download"]'
        );


    if (downloadButton) {

        downloadButton.addEventListener(
            "click",
            event => {

                event.preventDefault();


                if (!url) {

                    alert(
                        "Resume file URL is not available."
                    );

                    return;
                }


                const link =
                    document.createElement(
                        "a"
                    );


                link.href =
                    url;


                link.download =
                    filename;


                link.target =
                    "_blank";


                document.body.appendChild(
                    link
                );


                link.click();


                link.remove();

            }
        );

    }


    // =================================================
    // REPLACE BUTTON
    // =================================================

    const replaceButton =
        display.querySelector(
            '[data-resume-action="replace"]'
        );


    if (replaceButton) {

        replaceButton.addEventListener(
            "click",
            event => {

                event.preventDefault();

                resumeInput.click();

            }
        );

    }


    console.log(
        "Resume displayed:",
        filename
    );
}


// =====================================================
// UPLOAD RESUME
// =====================================================

async function uploadResume(
    file
) {

    if (!file) {
        return;
    }


    const maxSize =
        5 * 1024 * 1024;


    if (
        file.size >
        maxSize
    ) {

        alert(
            "Resume must be smaller than 5 MB."
        );

        return;
    }


    const allowedExtensions = [
        ".pdf",
        ".doc",
        ".docx"
    ];


    const fileName =
        file.name.toLowerCase();


    const valid =
        allowedExtensions.some(
            extension =>
                fileName.endsWith(
                    extension
                )
        );


    if (!valid) {

        alert(
            "Only PDF, DOC and DOCX files are allowed."
        );

        return;
    }


    const userId =
        getUserId();


    if (!userId) {

        alert(
            "Please login again."
        );

        return;
    }


    const formData =
        new FormData();


    formData.append(
        "resume",
        file
    );


    formData.append(
        "userId",
        userId
    );


    try {

        console.log(
            "Uploading resume:",
            file.name
        );


        const response =
            await fetch(
                `${API_URL}/profile/resume`,
                {
                    method: "POST",
                    body: formData
                }
            );


        const data =
            await response.json();


        console.log(
            "Resume upload response:",
            data
        );


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Resume upload failed."
            );

        }


        renderResume(
            data.resume ||
            data.profile?.resume ||
            {
                filename:
                    file.name
            }
        );


        await loadProfile();


        alert(
            "Resume uploaded successfully! ✅"
        );


    } catch (error) {

        console.error(
            "Resume upload error:",
            error
        );


        alert(
            error.message ||
            "Resume upload failed."
        );

    }
}


// =====================================================
// INITIALIZE RESUME UPLOAD
// =====================================================

function initializeResumeUpload() {

    const resumeInput =
        document.getElementById(
            "resumeInput"
        );


    if (!resumeInput) {

        console.warn(
            "resumeInput not found."
        );

        return;
    }


    resumeInput.addEventListener(
        "change",
        async function() {

            const file =
                this.files &&
                this.files[0];


            if (!file) {
                return;
            }


            await uploadResume(
                file
            );


            this.value = "";

        }
    );
}


// =====================================================
// PROFILE COMPLETION
// SAME WEIGHTING AS OUR WORKING VERSION
// =====================================================

function updateCompletion(
    profile
) {

    if (!profile) {
        return;
    }


    let percentage = 0;


    // BASIC INFORMATION - 15%

    if (
        profile.name &&
        profile.email
    ) {

        percentage += 15;

    }


    // PHONE + LOCATION - 10%

    if (
        profile.phone &&
        profile.location
    ) {

        percentage += 10;

    }


    // PROFESSIONAL HEADLINE - 15%

    if (
        profile.headline &&
        String(
            profile.headline
        ).trim()
    ) {

        percentage += 15;

    }


    // ABOUT - 15%

    if (
        profile.about &&
        String(
            profile.about
        ).trim()
    ) {

        percentage += 15;

    }


    // CAREER GOAL - 10%

    if (
        profile.careerGoal &&
        String(
            profile.careerGoal
        ).trim()
    ) {

        percentage += 10;

    }


    // EDUCATION - 10%

    if (
        Array.isArray(
            profile.education
        ) &&
        profile.education.length > 0
    ) {

        percentage += 10;

    }


    // SKILLS - 10%

    if (
        Array.isArray(
            profile.skills
        ) &&
        profile.skills.length > 0
    ) {

        percentage += 10;

    }


    // RESUME - 10%

    if (
        profile.resume &&
        (
            profile.resume.path ||
            profile.resume.filename ||
            profile.resume.fileName ||
            profile.resume.originalName
        )
    ) {

        percentage += 10;

    }


    // PROFILE PHOTO - 5%

    const savedPhoto =
        localStorage.getItem(
            "hireflowProfilePhoto"
        );


    if (
        savedPhoto ||
        (
            profile.profilePhoto &&
            (
                profile.profilePhoto.path ||
                profile.profilePhoto.filename ||
                profile.profilePhoto.originalName
            )
        )
    ) {

        percentage += 5;

    }


    const element =
        document.getElementById(
            "completionPercent"
        );


    if (element) {

        element.textContent =
            `${percentage}%`;

    }


    console.log(
        "Profile completion:",
        `${percentage}%`
    );
}


// =====================================================
// UPDATE COMPLETION FROM SERVER
// =====================================================

async function updateCompletionFromCurrentProfile() {

    const userId =
        getUserId();


    if (!userId) {
        return;
    }


    try {

        const response =
            await fetch(
                `${API_URL}/profile/${userId}`
            );


        const data =
            await response.json();


        if (
            response.ok &&
            data.success
        ) {

            updateCompletion(
                data.profile
            );

            updateCompletionChecklist();

        }


    } catch (error) {

        console.error(
            "Completion refresh failed:",
            error
        );

    }
}


// =====================================================
// COMPLETION CHECKLIST
// =====================================================

function updateCompletionChecklist() {

    const checklist =
        document.getElementById(
            "completionChecklist"
        );


    if (!checklist) {
        return;
    }


    const checks = {

        basic:
            !!(
                getValue("fullName") &&
                getValue("phone") &&
                getValue("location")
            ),

        headline:
            !!getValue("headline"),

        about:
            !!getValue("about"),

        career:
            !!getValue("careerGoal"),

        skills:
            getCurrentSkills().length > 0,

        education:
            getCurrentEducation().length > 0,

        resume:
            !!document.querySelector(
                ".resume-js-display"
            ) ||
            !!document.querySelector(
                ".resume-uploaded-name"
            ),

        photo:
            !!localStorage.getItem(
                "hireflowProfilePhoto"
            ) ||
            !!document.querySelector(
                "#profileAvatar img"
            )

    };


    Object.keys(
        checks
    ).forEach(key => {

        const item =
            checklist.querySelector(
                `[data-check="${key}"]`
            );


        if (!item) {
            return;
        }


        const icon =
            item.querySelector(
                ".check-icon"
            );


        if (
            checks[key]
        ) {

            item.classList.add(
                "completed"
            );


            if (icon) {
                icon.textContent =
                    "✓";
            }

        } else {

            item.classList.remove(
                "completed"
            );


            if (icon) {
                icon.textContent =
                    "○";
            }

        }

    });


    console.log(
        "CHECKLIST STATUS:",
        checks
    );
}


// =====================================================
// CLICKABLE COMPLETION CHECKLIST
// =====================================================

function setupCompletionChecklistLinks() {

    const checklist =
        document.getElementById(
            "completionChecklist"
        );


    if (!checklist) {
        return;
    }


    const destinations = {

        basic:
            "fullName",

        headline:
            "headline",

        about:
            "about",

        career:
            "careerGoal",

        skills:
            "skillTags",

        education:
            "educationSection",

        resume:
            "resumeInput",

        photo:
            "profileAvatar"

    };


    Object.keys(
        destinations
    ).forEach(key => {

        const item =
            checklist.querySelector(
                `[data-check="${key}"]`
            );


        if (!item) {
            return;
        }


        item.style.cursor =
            "pointer";


        item.addEventListener(
            "click",
            function() {

                const targetId =
                    destinations[key];


                const target =
                    document.getElementById(
                        targetId
                    );


                if (!target) {

                    console.log(
                        "Target not found:",
                        targetId
                    );

                    return;
                }


                target.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "center"

                });


                target.style.transition =
                    "box-shadow 0.3s ease";


                target.style.boxShadow =
                    "0 0 0 3px rgba(139,92,246,0.7)";


                setTimeout(
                    function() {

                        target.style.boxShadow =
                            "";

                    },
                    1500
                );

            }
        );

    });


    console.log(
        "Completion checklist links ready."
    );
}


// =====================================================
// INITIALIZE SAVE BUTTON
// =====================================================

function initializeSaveButton() {

    const button =
        document.getElementById(
            "saveProfileBtn"
        );


    if (!button) {
        return;
    }


    button.type =
        "button";


    button.addEventListener(
        "click",
        saveProfile
    );
}


// =====================================================
// START APPLICATION
// =====================================================

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "Starting Candidate Profile..."
        );


        initializeEducation();

        initializeSkills();

        initializeSaveButton();

        initializeResumeUpload();

        initializeProfilePhoto();


        await loadProfile();


        updateCompletionChecklist();


        setupCompletionChecklistLinks();

    }
);