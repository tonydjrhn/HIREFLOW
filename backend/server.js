const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const User = require("./models/User");
const Application = require("./models/Application");
const Job = require("./models/Job");

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

const pages = [
    "index.html",
    "login.html",
    "candidate-jobs.html",
    "candidate-profile.html",
    "candidate-dashboard.html",
    "candidate-application.html",
    "profile-preview.html",
    "recruiter-dashboard.html",
    "recruiter-candidates.html",
    "recruiter-jobs.html",
    "recruiter-applications.html",
    "shortlisted-candidates.html"
];

pages.forEach((page) => {
    app.get("/" + page, (req, res) => {
        res.sendFile(path.join(__dirname, page));
    });
});

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            role: role || "candidate"
        });

        await user.save();

        console.log("New user registered:", normalizedEmail);

        return res.status(201).json({
            success: true,
            message: "Registration successful"
        });

    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const normalizedEmail = email.trim().toLowerCase();

        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        console.log("User logged in:", normalizedEmail);

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
});

app.get("/api/jobs", async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 });
        return res.status(200).json({ success: true, jobs });
    } catch (error) {
        console.error("Get jobs error:", error);
        return res.status(500).json({ success: false, jobs: [], message: "Unable to load jobs" });
    }
});

app.post("/api/jobs", async (req, res) => {
    try {
        const { title, company, location, jobType, salary, experience, skills, description, recruiterId } = req.body;
        if (!title || !company) {
            return res.status(400).json({ success: false, message: "Title and company are required" });
        }
        const job = new Job({ title, company, location, jobType, salary, experience, skills, description, recruiterId });
        await job.save();
        return res.status(201).json({ success: true, job });
    } catch (error) {
        console.error("Create job error:", error);
        return res.status(500).json({ success: false, message: "Unable to create job" });
    }
});

app.put("/api/jobs/:id", async (req, res) => {
    try {
        const job = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!job) {
            return res.status(404).json({ success: false, message: "Job not found" });
        }
        return res.status(200).json({ success: true, job });
    } catch (error) {
        console.error("Update job error:", error);
        return res.status(500).json({ success: false, message: "Unable to update job" });
    }
});

app.post("/api/applications", async (req, res) => {
    try {
        const { candidateId, jobId, coverMessage } = req.body;
        if (!candidateId || !jobId) {
            return res.status(400).json({ success: false, message: "candidateId and jobId are required" });
        }
        const application = new Application({ candidateId, jobId, coverMessage: coverMessage || "" });
        await application.save();
        return res.status(201).json({ success: true, application });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Already applied to this job" });
        }
        console.error("Create application error:", error);
        return res.status(500).json({ success: false, message: "Unable to submit application" });
    }
});

app.get("/api/applications/check/:candidateId/:jobId", async (req, res) => {
    try {
        const existing = await Application.findOne({ candidateId: req.params.candidateId, jobId: req.params.jobId });
        return res.status(200).json({ success: true, applied: !!existing });
    } catch (error) {
        console.error("Check application error:", error);
        return res.status(500).json({ success: false, applied: false });
    }
});

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "HireFlow server is running",
        port: PORT
    });
});

if (process.env.MONGO_URI) {
    mongoose
        .connect(process.env.MONGO_URI)
        .then(() => {
            console.log("MongoDB connected successfully ✅");
        })
        .catch((err) => {
            console.error("MongoDB connection error:", err.message);
        });
} else {
    console.log("MONGO_URI not found. Starting without MongoDB.");
}

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>HireFlow - Page Not Found</title>
            <style>
                body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; background: #08080c; color: white; font-family: Arial, sans-serif; text-align: center; }
                h1 { font-size: 48px; margin-bottom: 10px; }
                p { color: #aaa; font-size: 18px; }
                a { display: inline-block; margin-top: 20px; padding: 12px 24px; background: white; color: black; text-decoration: none; border-radius: 8px; font-weight: bold; }
            </style>
        </head>
        <body>
            <div>
                <h1>404</h1>
                <p>Page not found.</p>
                <a href="/">Go to HireFlow</a>
            </div>
        </body>
        </html>
    `);
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireFlow server running on port ${PORT} 🚀`);
});
