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

app.use(express.urlencoded({
    extended: true
}));
app.use(express.static(__dirname));
// =====================================================
// FRONTEND
// =====================================================

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});


// =====================================================
// UPLOADS
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

        const allowed =
            [
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
            allowed.includes(
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
    .catch(error => {

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
                default: "Company"
            },

            location: {
                type: String,
                default: "Location not specified"
            },

            jobType: {
                type: String,
                default: "full-time"
            },

            salary: {
                type: String,
                default: "Salary not specified"
            },

            experience: {
                type: String,
                default: "Experience not specified"
            },

            skills: {
                type: [
                    String
                ],
                default: []
            },

            description: {
                type: String,
                default: ""
            },

            recruiterId: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User",

                required: false
            }

        },

        {
            timestamps: true
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

            candidateId: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User",

                required: true
            },

            jobId: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "Job",

                required: true
            },

            coverMessage: {
                type: String,
                default: ""
            },

            status: {
                type: String,

                enum: [
                    "applied",
                    "reviewing",
                    "shortlisted",
                    "rejected",
                    "selected"
                ],

                default: "applied"
            }

        },

        {
            timestamps: true
        }

    );


applicationSchema.index(
    {
        candidateId: 1,
        jobId: 1
    },
    {
        unique: true
    }
);


const Application =
    mongoose.models.Application ||
    mongoose.model(
        "Application",
        applicationSchema
    );


// =====================================================
// SHORTLIST MODEL
// =====================================================

const shortlistSchema =
    new mongoose.Schema(

        {

            candidateId: {
                type:
                    mongoose.Schema.Types.ObjectId,

                ref: "User",

                required: true,

                unique: true
            }

        },

        {
            timestamps: true
        }

    );


const Shortlist =
    mongoose.models.Shortlist ||
    mongoose.model(
        "Shortlist",
        shortlistSchema
    );


// =====================================================
// REGISTER
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
// LOGIN
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
// GET PROFILE
// =====================================================

app.get(
    "/api/profile/:userId",
    async (
        req,
        res
    ) => {

        try {

            const user =
                await User.findById(
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
// UPDATE PROFILE
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
                skills,
                resume
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
                    education;

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
                        .filter(Boolean);

            }


            if (
                resume !== undefined
            ) {

                updateData.resume =
                    resume;

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

                )
                .select(
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
// RESUME UPLOAD
// =====================================================

app.post(
    "/api/profile/resume",
    upload.single("resume"),

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
// GET CANDIDATES
// =====================================================

app.get(
    "/api/candidates",
    async (
        req,
        res
    ) => {

        try {

            const {
                search,
                skill,
                location
            } = req.query;


            const query = {

                role:
                    "candidate"

            };


            if (search) {

                const regex =
                    new RegExp(
                        search.trim(),
                        "i"
                    );


                query.$or = [

                    {
                        name:
                            regex
                    },

                    {
                        headline:
                            regex
                    }

                ];

            }


            if (skill) {

                query.skills = {

                    $regex:
                        skill.trim(),

                    $options:
                        "i"

                };

            }


            if (location) {

                query.location = {

                    $regex:
                        location.trim(),

                    $options:
                        "i"

                };

            }


            const candidates =
                await User.find(
                    query
                )
                .select(
                    "-password"
                )
                .sort({

                    createdAt:
                        -1

                });


            return res
                .status(200)
                .json({

                    success: true,

                    candidates:
                        candidates

                });

        }

        catch (error) {

            console.error(
                "Get candidates error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to load candidates"

                });

        }

    }
);


// =====================================================
// SHORTLIST CANDIDATE
// =====================================================

app.post(
    "/api/candidates/:id/shortlist",
    async (
        req,
        res
    ) => {

        try {

            const candidateId =
                req.params.id;


            if (
                !mongoose.Types.ObjectId.isValid(
                    candidateId
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success: false,

                        message:
                            "Invalid candidate ID"

                    });

            }


            const candidate =
                await User.findById(
                    candidateId
                );


            if (!candidate) {

                return res
                    .status(404)
                    .json({

                        success: false,

                        message:
                            "Candidate not found"

                    });

            }


            const existing =
                await Shortlist.findOne({

                    candidateId:
                        candidateId

                });


            if (existing) {

                return res
                    .status(200)
                    .json({

                        success: true,

                        message:
                            "Candidate is already shortlisted",

                        shortlisted:
                            true

                    });

            }


            await Shortlist.create({

                candidateId:
                    candidateId

            });


            return res
                .status(201)
                .json({

                    success: true,

                    message:
                        "Candidate shortlisted successfully",

                    shortlisted:
                        true

                });

        }

        catch (error) {

            console.error(
                "Shortlist error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to shortlist candidate"

                });

        }

    }
);


// =====================================================
// REMOVE SHORTLIST
// =====================================================

app.delete(
    "/api/candidates/:id/shortlist",
    async (
        req,
        res
    ) => {

        try {

            await Shortlist.findOneAndDelete({

                candidateId:
                    req.params.id

            });


            return res
                .status(200)
                .json({

                    success: true,

                    shortlisted:
                        false

                });

        }

        catch (error) {

            console.error(
                "Remove shortlist error:",
                error
            );

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to remove candidate from shortlist"

                });

        }

    }
);


// =====================================================
// CHECK SHORTLIST
// =====================================================

app.get(
    "/api/candidates/:id/shortlist",
    async (
        req,
        res
    ) => {

        try {

            const item =
                await Shortlist.findOne({

                    candidateId:
                        req.params.id

                });


            return res
                .status(200)
                .json({

                    success: true,

                    shortlisted:
                        !!item

                });

        }

        catch (error) {

            return res
                .status(500)
                .json({

                    success: false,

                    message:
                        "Unable to check shortlist"

                });

        }

    }
);


// =====================================================
// GET JOBS
// =====================================================

app.get(
    "/api/jobs",
    async (
        req,
        res
    ) => {

        try {

            const {
                search,
                location,
                type
            } = req.query;


            const query = {};


            if (search) {

                const regex =
                    new RegExp(
                        search.trim(),
                        "i"
                    );


                query.$or = [

                    {
                        title:
                            regex
                    },

                    {
                        company:
                            regex
                    },

                    {
                        description:
                            regex
                    }

                ];

            }


            if (location) {

                query.location = {

                    $regex:
                        location.trim(),

                    $options:
                        "i"

                };

            }


            if (type) {

                query.jobType =
                    type;

            }


            const jobs =
                await Job
                    .find(query)
                    .sort({
                        createdAt:
                            -1
                    })
                    .lean();


            return res
                .status(200)
                .json({

                    success:
                        true,

                    jobs:
                        jobs

                });

        }

        catch (error) {

            console.error(
                "GET /api/jobs error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to load jobs",

                    jobs:
                        []

                });

        }

    }
);


// =====================================================
// GET ONE JOB
// =====================================================

app.get(
    "/api/jobs/:id",
    async (
        req,
        res
    ) => {

        try {

            if (
                !mongoose.Types.ObjectId.isValid(
                    req.params.id
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid job ID"

                    });

            }


            const job =
                await Job.findById(
                    req.params.id
                );


            if (!job) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Job not found"

                    });

            }


            return res
                .status(200)
                .json({

                    success:
                        true,

                    job:
                        job

                });

        }

        catch (error) {

            return res
                .status(500)
                .json({

                    success:
                        false,

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
                experience,
                skills,
                description,
                recruiterId
            } = req.body;


            if (!title) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Job title is required"

                    });

            }


            let skillArray = [];


            if (
                Array.isArray(
                    skills
                )
            ) {

                skillArray =
                    skills;

            }

            else if (
                typeof skills ===
                "string"
            ) {

                skillArray =
                    skills
                        .split(",")
                        .map(
                            skill =>
                                skill.trim()
                        )
                        .filter(Boolean);

            }


            const job =
                await Job.create({

                    title:
                        title.trim(),

                    company:
                        company ||
                        "Company",

                    location:
                        location ||
                        "Location not specified",

                    jobType:
                        jobType ||
                        "full-time",

                    salary:
                        salary ||
                        "Salary not specified",

                    experience:
                        experience ||
                        "Experience not specified",

                    skills:
                        skillArray,

                    description:
                        description ||
                        "",

                    recruiterId:
                        recruiterId ||
                        undefined

                });


            return res
                .status(201)
                .json({

                    success:
                        true,

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

                    success:
                        false,

                    message:
                        error.message ||
                        "Unable to create job"

                });

        }

    }
);


// =====================================================
// DELETE JOB
// =====================================================

app.delete(
    "/api/jobs/:id",
    async (
        req,
        res
    ) => {

        try {

            const job =
                await Job.findByIdAndDelete(
                    req.params.id
                );


            if (!job) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Job not found"

                    });

            }


            await Application.deleteMany({

                jobId:
                    req.params.id

            });


            return res
                .status(200)
                .json({

                    success:
                        true,

                    message:
                        "Job deleted successfully"

                });

        }

        catch (error) {

            console.error(
                "Delete job error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to delete job"

                });

        }

    }
);


// =====================================================
// APPLY FOR JOB
// =====================================================

app.post(
    "/api/applications",
    async (
        req,
        res
    ) => {

        try {

            const {
                candidateId,
                jobId,
                coverMessage
            } = req.body;


            if (
                !candidateId ||
                !jobId
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Candidate ID and Job ID are required"

                    });

            }


            if (
                !mongoose.Types.ObjectId.isValid(
                    candidateId
                ) ||
                !mongoose.Types.ObjectId.isValid(
                    jobId
                )
            ) {

                return res
                    .status(400)
                    .json({

                        success:
                            false,

                        message:
                            "Invalid candidate or job ID"

                    });

            }


            const candidate =
                await User.findById(
                    candidateId
                );


            if (!candidate) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Candidate not found"

                    });

            }


            const job =
                await Job.findById(
                    jobId
                );


            if (!job) {

                return res
                    .status(404)
                    .json({

                        success:
                            false,

                        message:
                            "Job not found"

                    });

            }


            const existing =
                await Application.findOne({

                    candidateId:
                        candidateId,

                    jobId:
                        jobId

                });


            if (existing) {

                return res
                    .status(409)
                    .json({

                        success:
                            true,

                        alreadyApplied:
                            true,

                        message:
                            "You have already applied for this job",

                        application:
                            existing

                    });

            }


            const application =
                await Application.create({

                    candidateId:
                        candidateId,

                    jobId:
                        jobId,

                    coverMessage:
                        coverMessage ||
                        "",

                    status:
                        "applied"

                });


            return res
                .status(201)
                .json({

                    success:
                        true,

                    message:
                        "Application submitted successfully",

                    application:
                        application

                });

        }

        catch (error) {

            console.error(
                "Application error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to submit application"

                });

        }

    }
);


// =====================================================
// CHECK APPLICATION
// =====================================================

app.get(
    "/api/applications/check/:candidateId/:jobId",
    async (
        req,
        res
    ) => {

        try {

            const application =
                await Application.findOne({

                    candidateId:
                        req.params.candidateId,

                    jobId:
                        req.params.jobId

                });


            return res
                .status(200)
                .json({

                    success:
                        true,

                    applied:
                        !!application,

                    application:
                        application ||
                        null

                });

        }

        catch (error) {

            console.error(
                "Check application error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to check application"

                });

        }

    }
);


// =====================================================
// GET ALL APPLICATIONS
// =====================================================

app.get(
    "/api/applications",
    async (
        req,
        res
    ) => {

        try {

            const {
                status,
                search,
                sort
            } = req.query;


            const query = {};


            if (status) {

                query.status =
                    status;

            }


            let applications =
                await Application
                    .find(query)
                    .populate(
                        "candidateId",
                        "-password"
                    )
                    .populate(
                        "jobId"
                    )
                    .sort({
                        createdAt:
                            sort ===
                            "oldest"
                                ? 1
                                : -1
                    })
                    .lean();


            if (search) {

                const text =
                    search
                        .trim()
                        .toLowerCase();


                applications =
                    applications.filter(
                        application => {

                            const candidate =
                                application
                                    .candidateId;

                            const job =
                                application
                                    .jobId;


                            return (

                                String(
                                    candidate?.name ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(text)

                                ||

                                String(
                                    candidate?.email ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(text)

                                ||

                                String(
                                    job?.title ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(text)

                                ||

                                String(
                                    job?.company ||
                                    ""
                                )
                                .toLowerCase()
                                .includes(text)

                            );

                        }
                    );

            }


            return res
                .status(200)
                .json({

                    success:
                        true,

                    applications:
                        applications

                });

        }

        catch (error) {

            console.error(
                "Get applications error:",
                error
            );

            return res
                .status(500)
                .json({

                    success:
                        false,

                    message:
                        "Unable to load applications",

                    applications:
                        []

                });

        }

    }
);


// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

async function updateApplicationStatus(
    req,
    res
) {

    try {

        const {
            status
        } = req.body;


        const allowedStatuses = [

            "applied",

            "reviewing",

            "shortlisted",

            "rejected",

            "selected"

        ];


        if (
            !allowedStatuses.includes(
                status
            )
        ) {

            return res
                .status(400)
                .json({

                    success:
                        false,

                    message:
                        "Invalid application status"

                });

        }


        const application =
            await Application.findByIdAndUpdate(

                req.params.id,

                {
                    $set: {
                        status:
                            status
                    }
                },

                {
                    new:
                        true
                }

            )
            .populate(
                "candidateId",
                "-password"
            )
            .populate(
                "jobId"
            );


        if (!application) {

            return res
                .status(404)
                .json({

                    success:
                        false,

                    message:
                        "Application not found"

                });

        }


        return res
            .status(200)
            .json({

                success:
                    true,

                message:
                    "Application status updated",

                application:
                    application

            });

    }

    catch (error) {

        console.error(
            "Update application error:",
            error
        );

        return res
            .status(500)
            .json({

                success:
                    false,

                message:
                    "Unable to update application"

            });

    }

}




// =====================================================
// UPDATE APPLICATION STATUS
// =====================================================

app.patch(
    "/api/applications/:id/status",
    async (req, res) => {

        try {

            const applicationId =
                String(req.params.id || "").trim();

            const newStatus =
                String(req.body.status || "").trim();


            console.log(
                "Updating application:",
                applicationId,
                "Status:",
                newStatus
            );


            // Check ID
            if (
                !applicationId ||
                !mongoose.Types.ObjectId.isValid(
                    applicationId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application ID"

                });

            }


            // Allowed statuses
            const statusMap = {

                "Applied": "applied",

                "Shortlisted": "shortlisted",

                "Rejected": "rejected",

                "Hired": "selected",

                "applied": "applied",

                "shortlisted": "shortlisted",

                "rejected": "rejected",

                "selected": "selected"

            };


            const finalStatus =
                statusMap[newStatus];


            if (!finalStatus) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application status"

                });

            }


            // Find application
            const application =
                await Application.findById(
                    applicationId
                );


            if (!application) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found"

                });

            }


            // Update
            application.status =
                finalStatus;


            await application.save();


            // Load complete application
            const updatedApplication =
                await Application
                    .findById(
                        application._id
                    )
                    .populate(
                        "candidateId",
                        "-password"
                    )
                    .populate(
                        "jobId"
                    )
                    .lean();


            return res.status(200).json({

                success: true,

                message:
                    "Application status updated successfully",

                application:
                    updatedApplication

            });

        }

        catch (error) {

            console.error(
                "APPLICATION STATUS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to update application status"

            });

        }

    }
);


// Also support PUT
app.put(
    "/api/applications/:id/status",
    async (req, res) => {

        try {

            const applicationId =
                String(req.params.id || "").trim();

            const newStatus =
                String(req.body.status || "").trim();


            const statusMap = {

                "Applied": "applied",
                "Shortlisted": "shortlisted",
                "Rejected": "rejected",
                "Hired": "selected",

                "applied": "applied",
                "shortlisted": "shortlisted",
                "rejected": "rejected",
                "selected": "selected"

            };


            const finalStatus =
                statusMap[newStatus];


            if (
                !applicationId ||
                !mongoose.Types.ObjectId.isValid(
                    applicationId
                )
            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application ID"

                });

            }


            if (!finalStatus) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid application status"

                });

            }


            const application =
                await Application.findByIdAndUpdate(

                    applicationId,

                    {
                        $set: {
                            status:
                                finalStatus
                        }
                    },

                    {
                        new: true
                    }

                )
                .populate(
                    "candidateId",
                    "-password"
                )
                .populate(
                    "jobId"
                );


            if (!application) {

                return res.status(404).json({

                    success: false,

                    message:
                        "Application not found"

                });

            }


            return res.status(200).json({

                success: true,

                message:
                    "Application status updated successfully",

                application:
                    application

            });

        }

        catch (error) {

            console.error(
                "PUT APPLICATION STATUS ERROR:",
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    error.message ||
                    "Unable to update application status"

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

                success:
                    true,

                message:
                    "HireFlow API is running successfully 🚀",

                timestamp:
                    new Date().toISOString()

            });

    }
);


// =====================================================
// ROOT
// =====================================================

app.get(
    "/",
    (
        req,
        res
    ) => {

        res.json({

            message:
                "Welcome to HireFlow API",

            version:
                "1.0.0"

        });

    }
);


// =====================================================
// ERROR HANDLER
// =====================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Server error:",
            error
        );


        res
            .status(500)
            .json({

                success:
                    false,

                message:
                    error.message ||
                    "Internal server error"

            });

    }
);


// =====================================================
// START SERVER
// =====================================================

app.listen(
    PORT,
    () => {

        console.log(
            `HireFlow API running on http://localhost:${PORT}`
        );

    }
);