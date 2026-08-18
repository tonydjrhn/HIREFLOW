const mongoose = require("mongoose");

// =====================================================
// USER SCHEMA
// =====================================================

const userSchema = new mongoose.Schema(
    {
        // =====================================================
        // BASIC ACCOUNT INFORMATION
        // =====================================================

        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        password: {
            type: String,
            required: true,
            minlength: 6
        },

        role: {
            type: String,
            default: "candidate",
            trim: true
        },

        // =====================================================
        // BASIC PROFILE INFORMATION
        // =====================================================

        phone: {
            type: String,
            default: "",
            trim: true
        },

        location: {
            type: String,
            default: "",
            trim: true
        },

        // =====================================================
        // PROFESSIONAL PROFILE
        // =====================================================

        headline: {
            type: String,
            default: "",
            trim: true
        },

        about: {
            type: String,
            default: "",
            trim: true
        },

        careerGoal: {
            type: String,
            default: "",
            trim: true
        },

        // =====================================================
        // EDUCATION
        // =====================================================

        education: {
            type: [
                {
                    degree: {
                        type: String,
                        default: ""
                    },

                    institution: {
                        type: String,
                        default: ""
                    },

                    field: {
                        type: String,
                        default: ""
                    },

                    startYear: {
                        type: String,
                        default: ""
                    },

                    endYear: {
                        type: String,
                        default: ""
                    },

                    description: {
                        type: String,
                        default: ""
                    }
                }
            ],

            default: []
        },

        // =====================================================
        // SKILLS
        // =====================================================

        skills: {
            type: [String],
            default: []
        },

        // =====================================================
        // PROFILE PHOTO
        // =====================================================

        profilePhoto: {
            filename: {
                type: String,
                default: ""
            },

            path: {
                type: String,
                default: ""
            },

            uploadedAt: {
                type: Date,
                default: null
            }
        },

        // =====================================================
        // RESUME
        // =====================================================

        resume: {
            filename: {
                type: String,
                default: ""
            },

            path: {
                type: String,
                default: ""
            },

            uploadedAt: {
                type: Date,
                default: null
            }
        }
    },

    {
        timestamps: true
    }
);

// =====================================================
// EXPORT USER MODEL
// =====================================================

module.exports = mongoose.model("User", userSchema);