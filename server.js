// =====================================================
// HireFlow - Complete Server
// =====================================================

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();

const User = require("./models/User");

const app = express();

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());

app.use(express.json());

app.use(
    express.urlencoded({
        extended: true
    })
);

// =====================================================
// FRONTEND STATIC FILES
// =====================================================

// IMPORTANT:
// index.html, register.html, login.html,
// script.js, style.css, etc. are inside backend/

app.use(express.static(__dirname));

// =====================================================
// UPLOAD DIRECTORIES
// =====================================================

const uploadsDir = path.join(
    __dirname,
    "uploads",
    "resumes"
);

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(
        uploadsDir,
        {
            recursive: true
        }
    );
}

// =====================================================
// MULTER - RESUME UPLOAD
// =====================================================

const storage = multer.diskStorage({

    destination: function (
        req,
        file,
        cb
    ) {

        cb(
            null,
            uploadsDir
        );

    },

    filename: function (
        req,
        file,
        cb
    ) {

        const uniqueName =
            Date.now() +
            "-" +
            Math.round(
                Math.random() * 1E9
            ) +
            path.extname(
                file.originalname
            );

        cb(
            null,
            uniqueName
        );

    }

});

const upload = multer({

    storage: storage,

    limits: {
        fileSize:
            5 * 1024 * 1024
    },

    fileFilter: function (
        req,
        file,
        cb
    ) {

        const allowedExtensions = [
            ".pdf",
            ".doc",
            ".docx"
        ];

        const extension =
            path
                .extname(
                    file.originalname
                )
                .toLowerCase();

        if (
            allowedExtensions.includes(
                extension
            )
        ) {

            cb(
                null,
                true
            );

        } else {

            cb(
                new Error(
                    "Only PDF, DOC and DOCX files are allowed."
                )
            );

        }

    }

});

// =====================================================
// MAKE UPLOADS ACCESSIBLE
// =====================================================

app.use(
    "/uploads",
    express.static(
        path.join(
            __dirname,
            "uploads"
        )
    )
);

// =====================================================
// DATABASE
// =====================================================

mongoose
    .connect(
        process.env.MONGO_URI
    )
    .then(() => {

        console.log(
            "MongoDB connected successfully ✅"
        );

    })
    .catch((error) => {

        console.error(
            "MongoDB connection failed ❌"
        );

        console.error(
            error.message
        );

    });

// =====================================================
// JOB MODEL
// =====================================================

const jobSchema =
    new mongoose.Schema(
        {

            title: {
                type: String,
                required: true
            },

            company: {
                type: String,
                required: true
            },

            location: {
                type: String,
                default: ""
            },

            jobType: {
                type: String,
                default: "Full-time"
            },

            salary: {
                type: String,
                default: ""
            },

            description: {
                type: String,
                default: ""
            },

            skills: {
                type: [String],
                default: []
            },

            recruiterId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                default: null
            },

            createdAt: {
                type: Date,
                default: Date.now
            }

        }
    );

const Job =
    mongoose.models.Job ||
    mongoose.model(
        "Job",
        jobSchema
    );

// =====================================================
// APPLICATION MODEL
// =====================================================

const applicationSchema =
    new mongoose.Schema(
        {

            jobId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Job",
                required: true
            },

            candidateId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true
            },

            status: {
                type: String,
                default: "Applied"
            },

            appliedAt: {
                type: Date,
                default: Date.now
            }

        }
    );

const Application =
    mongoose.models.Application ||
    mongoose.model(
        "Application",
        applicationSchema
    );

// =====================================================
// REGISTER USER
// =====================================================

app.post(
    "/api/register",
    async (
        req,
        res
    ) => {

        try {

            const {
                name,
                email,
                password,
                role
            } = req.body;

            if (
                !name ||
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Name, email and password are required"

                    });

            }

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            const existingUser =
                await User.findOne({
                    email:
                        normalizedEmail
                });

            if (existingUser) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "User already exists"

                    });

            }

            const hashedPassword =
                await bcrypt.hash(
                    password,
                    10
                );

            const user =
                new User({

                    name:
                        name.trim(),

                    email:
                        normalizedEmail,

                    password:
                        hashedPassword,

                    role:
                        role ||
                        "candidate"

                });

            await user.save();

            console.log(
                "New user registered:",
                normalizedEmail
            );

            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Registration successful"

                });

        }
        catch (error) {

            console.error(
                "Registration error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Server error"

                });

        }

    }
);

// =====================================================
// LOGIN USER
// =====================================================

app.post(
    "/api/login",
    async (
        req,
        res
    ) => {

        try {

            const {
                email,
                password
            } = req.body;

            if (
                !email ||
                !password
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Email and password are required"

                    });

            }

            const normalizedEmail =
                email
                    .trim()
                    .toLowerCase();

            const user =
                await User.findOne({
                    email:
                        normalizedEmail
                });

            if (!user) {

                return res
                    .status(401)
                    .json({

                        success: false,

                        message:
                            "Invalid email or password"

                    });

            }

            const passwordMatch =
                await bcrypt.compare(
                    password,
                    user.password
                );

            if (!passwordMatch) {

                return res
                    .status(401)
                    .json({

                        success: false,

                        message:
                            "Invalid email or password"

                    });

            }

            console.log(
                "User login successful:",
                normalizedEmail
            );

            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Login successful",

                    user: {

                        id:
                            user._id,

                        name:
                            user.name,

                        email:
                            user.email,

                        role:
                            user.role ||
                            "candidate"

                    }

                });

        }
        catch (error) {

            console.error(
                "Login error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Server error"

                });

        }

    }
);

// =====================================================
// GET USER PROFILE
// =====================================================

app.get(
    "/api/profile/:userId",
    async (
        req,
        res
    ) => {

        try {

            const user =
                await User
                    .findById(
                        req.params.userId
                    )
                    .select(
                        "-password"
                    );

            if (!user) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "User not found"

                    });

            }

            return res
                .status(200)
                .json({

                    success: true,

                    profile:
                        user

                });

        }
        catch (error) {

            console.error(
                "Get profile error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Server error"

                });

        }

    }
);

// =====================================================
// UPDATE USER PROFILE
// =====================================================

app.put(
    "/api/profile/:userId",
    async (
        req,
        res
    ) => {

        try {

            const {
                name,
                phone,
                location,
                headline,
                about,
                careerGoal,
                education,
                skills
            } = req.body;

            const updateData = {};

            if (
                typeof name ===
                "string"
            ) {

                updateData.name =
                    name.trim();

            }

            if (
                typeof phone ===
                "string"
            ) {

                updateData.phone =
                    phone.trim();

            }

            if (
                typeof location ===
                "string"
            ) {

                updateData.location =
                    location.trim();

            }

            if (
                typeof headline ===
                "string"
            ) {

                updateData.headline =
                    headline.trim();

            }

            if (
                typeof about ===
                "string"
            ) {

                updateData.about =
                    about.trim();

            }

            if (
                typeof careerGoal ===
                "string"
            ) {

                updateData.careerGoal =
                    careerGoal.trim();

            }

            if (
                Array.isArray(
                    education
                )
            ) {

                updateData.education =
                    education.map(
                        item => ({

                            degree:
                                String(
                                    item.degree ||
                                    ""
                                ).trim(),

                            college:
                                String(
                                    item.college ||
                                    ""
                                ).trim(),

                            year:
                                String(
                                    item.year ||
                                    ""
                                ).trim()

                        })
                    );

            }

            if (
                Array.isArray(
                    skills
                )
            ) {

                updateData.skills =
                    skills
                        .map(
                            skill =>
                                String(
                                    skill
                                ).trim()
                        )
                        .filter(
                            Boolean
                        );

            }

            const updatedUser =
                await User.findByIdAndUpdate(

                    req.params.userId,

                    {
                        $set:
                            updateData
                    },

                    {
                        new: true,
                        runValidators: true
                    }

                ).select(
                    "-password"
                );

            if (!updatedUser) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "User not found"

                    });

            }

            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Profile saved successfully",

                    profile:
                        updatedUser

                });

        }
        catch (error) {

            console.error(
                "Update profile error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Could not save profile"

                });

        }

    }
);

// =====================================================
// UPLOAD RESUME
// =====================================================

app.post(
    "/api/profile/resume",

    upload.single(
        "resume"
    ),

    async (
        req,
        res
    ) => {

        try {

            const {
                userId
            } = req.body;

            if (!userId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "User ID is required"

                    });

            }

            if (!req.file) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Please select a resume"

                    });

            }

            const user =
                await User.findById(
                    userId
                );

            if (!user) {

                if (
                    fs.existsSync(
                        req.file.path
                    )
                ) {

                    fs.unlinkSync(
                        req.file.path
                    );

                }

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "User not found"

                    });

            }

            // Delete old resume
            if (
                user.resume &&
                user.resume.path
            ) {

                const oldRelativePath =
                    user.resume.path.replace(
                        "/uploads/",
                        ""
                    );

                const oldFilePath =
                    path.join(
                        __dirname,
                        "uploads",
                        oldRelativePath
                    );

                if (
                    fs.existsSync(
                        oldFilePath
                    )
                ) {

                    fs.unlinkSync(
                        oldFilePath
                    );

                }

            }

            user.resume = {

                filename:
                    req.file.originalname,

                path:
                    `/uploads/resumes/${req.file.filename}`,

                uploadedAt:
                    new Date()

            };

            await user.save();

            return res
                .status(200)
                .json({

                    success: true,

                    message:
                        "Resume uploaded successfully",

                    resume:
                        user.resume

                });

        }
        catch (error) {

            console.error(
                "Resume upload error:",
                error
            );

            if (
                req.file &&
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        error.message ||
                        "Resume upload failed"

                });

        }

    }
);

// =====================================================
// GET ALL JOBS
// =====================================================

app.get(
    "/api/jobs",
    async (
        req,
        res
    ) => {

        try {

            const jobs =
                await Job.find()
                    .sort({
                        createdAt:
                            -1
                    });

            return res
                .status(200)
                .json({

                    success: true,

                    jobs:
                        jobs

                });

        }
        catch (error) {

            console.error(
                "Get jobs error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to load jobs"

                });

        }

    }
);

// =====================================================
// GET SINGLE JOB
// =====================================================

app.get(
    "/api/jobs/:id",
    async (
        req,
        res
    ) => {

        try {

            const job =
                await Job.findById(
                    req.params.id
                );

            if (!job) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Job not found"

                    });

            }

            return res
                .status(200)
                .json({

                    success: true,

                    job:
                        job

                });

        }
        catch (error) {

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to load job"

                });

        }

    }
);

// =====================================================
// CREATE JOB
// =====================================================

app.post(
    "/api/jobs",
    async (
        req,
        res
    ) => {

        try {

            const {
                title,
                company,
                location,
                jobType,
                salary,
                description,
                skills,
                recruiterId
            } = req.body;

            if (
                !title ||
                !company
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Title and company are required"

                    });

            }

            const job =
                new Job({

                    title:
                        title.trim(),

                    company:
                        company.trim(),

                    location:
                        location || "",

                    jobType:
                        jobType ||
                        "Full-time",

                    salary:
                        salary || "",

                    description:
                        description || "",

                    skills:
                        Array.isArray(
                            skills
                        )
                            ? skills
                            : [],

                    recruiterId:
                        recruiterId ||
                        null

                });

            await job.save();

            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Job created successfully",

                    job:
                        job

                });

        }
        catch (error) {

            console.error(
                "Create job error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to create job"

                });

        }

    }
);

// =====================================================
// APPLY FOR JOB
// =====================================================

app.post(
    "/api/jobs/:jobId/apply",
    async (
        req,
        res
    ) => {

        try {

            const {
                candidateId
            } = req.body;

            if (!candidateId) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Candidate ID is required"

                    });

            }

            const job =
                await Job.findById(
                    req.params.jobId
                );

            if (!job) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Job not found"

                    });

            }

            const existing =
                await Application.findOne({

                    jobId:
                        req.params.jobId,

                    candidateId:
                        candidateId

                });

            if (existing) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "You have already applied for this job"

                    });

            }

            const application =
                new Application({

                    jobId:
                        req.params.jobId,

                    candidateId:
                        candidateId,

                    status:
                        "Applied"

                });

            await application.save();

            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Application submitted successfully",

                    application:
                        application

                });

        }
        catch (error) {

            console.error(
                "Job application error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to submit application"

                });

        }

    }
);

// =====================================================
// GET CANDIDATE APPLICATIONS
// =====================================================

app.get(
    "/api/applications/:candidateId",
    async (
        req,
        res
    ) => {

        try {

            const applications =
                await Application
                    .find({
                        candidateId:
                            req.params.candidateId
                    })
                    .populate(
                        "jobId"
                    )
                    .sort({
                        appliedAt:
                            -1
                    });

            return res
                .status(200)
                .json({

                    success: true,

                    applications:
                        applications

                });

        }
        catch (error) {

            console.error(
                "Applications error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to load applications"

                });

        }

    }
);

// =====================================================
// HEALTH CHECK
// =====================================================

app.get(
    "/api/health",
    (
        req,
        res
    ) => {

        res
            .status(200)
            .json({

                success: true,

                message:
                    "HireFlow API is running successfully 🚀",

                timestamp:
                    new Date().toISOString()

            });

    }
);

// =====================================================
// ROOT PAGE
// =====================================================

// IMPORTANT:
// This MUST come after API routes.

app.get(
    "/",
    (
        req,
        res
    ) => {

        res.sendFile(
            path.join(
                __dirname,
                "index.html"
            )
        );

    }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            `HireFlow server running on port ${PORT} 🚀`
        );

    }
);