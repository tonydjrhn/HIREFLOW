const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
    {
        title: { type: String, required: true, trim: true },
        company: { type: String, required: true, trim: true },
        location: { type: String, trim: true, default: "" },
        jobType: { type: String, trim: true, default: "" },
        salary: { type: String, trim: true, default: "" },
        experience: { type: String, trim: true, default: "" },
        skills: { type: [String], default: [] },
        description: { type: String, trim: true, default: "" },
        recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }
    },
    { timestamps: true }
);

const Job = mongoose.models.Job || mongoose.model("Job", jobSchema);

module.exports = Job;
