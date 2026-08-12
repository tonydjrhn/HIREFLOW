const express = require("express");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
const User = require("./models/User");
const app = express();

// =====================================================
// BASIC CONFIG
// =====================================================

const PORT = process.env.PORT || 5000;

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// =====================================================
// FRONTEND FILES
// IMPORTANT:
// server.js and index.html are in the SAME backend folder
// =====================================================

app.use(express.static(__dirname));

// =====================================================
// HOME PAGE
// =====================================================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// =====================================================
// HTML PAGE ROUTES
// =====================================================

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
// =====================================================
// REGISTER USER
// =====================================================

app.post("/api/register", async (req, res) => {

    try {

        const {
            name,
            email,
            password,
            role
        } = req.body;


        // Check required fields

        if (!name || !email || !password) {

            return res.status(400).json({
                success: false,
                message: "Name, email and password are required"
            });

        }


        // Normalize email

        const normalizedEmail =
            email.trim().toLowerCase();


        // Check whether user already exists

        const existingUser =
            await User.findOne({
                email: normalizedEmail
            });


        if (existingUser) {

            return res.status(400).json({
                success: false,
                message: "User already exists"
            });

        }


        // Hash password

        const hashedPassword =
            await bcrypt.hash(password, 10);


        // Create user

        const user = new User({

            name: name.trim(),

            email: normalizedEmail,

            password: hashedPassword,

            role: role || "candidate"

        });


        // Save user

        await user.save();


        console.log(
            "New user registered:",
            normalizedEmail
        );


        // Send JSON response

        return res.status(201).json({

            success: true,

            message: "Registration successful"

        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );


        return res.status(500).json({

            success: false,

            message: "Server error"

        });

    }

});
// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
    res.json({
        success: true,
        message: "HireFlow server is running",
        port: PORT
    });
});

// =====================================================
// MONGODB
// =====================================================

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
// =====================================================
// FRONTEND
// =====================================================

app.use(express.static(__dirname));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});
// =====================================================
// 404 HANDLER
// =====================================================

app.use((req, res) => {
    res.status(404).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>HireFlow - Page Not Found</title>
            <style>
                body {
                    margin: 0;
                    min-height: 100vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: #08080c;
                    color: white;
                    font-family: Arial, sans-serif;
                    text-align: center;
                }

                h1 {
                    font-size: 48px;
                    margin-bottom: 10px;
                }

                p {
                    color: #aaa;
                    font-size: 18px;
                }

                a {
                    display: inline-block;
                    margin-top: 20px;
                    padding: 12px 24px;
                    background: white;
                    color: black;
                    text-decoration: none;
                    border-radius: 8px;
                    font-weight: bold;
                }
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

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, "0.0.0.0", () => {
    console.log(`HireFlow server running on port ${PORT} 🚀`);
});