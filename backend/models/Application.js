const mongoose = require("mongoose");


// =====================================================
// APPLICATION SCHEMA
// =====================================================

const applicationSchema = new mongoose.Schema(

    {

        // -------------------------------------------------
        // CANDIDATE
        // -------------------------------------------------

        candidateId: {

            type:
                mongoose.Schema.Types.ObjectId,

            required: true,

            ref: "User"

        },


        // -------------------------------------------------
        // JOB
        // -------------------------------------------------

        jobId: {

            type:
                mongoose.Schema.Types.ObjectId,

            required: true,

            ref: "Job"

        },


        // -------------------------------------------------
        // APPLICATION STATUS
        // -------------------------------------------------

        status: {

            type: String,

            enum: [

                "applied",

                "reviewing",

                "shortlisted",

                "interview",

                "selected",

                "rejected"

            ],

            default: "applied"

        },


        // -------------------------------------------------
        // OPTIONAL COVER MESSAGE
        // -------------------------------------------------

        coverMessage: {

            type: String,

            default: "",

            trim: true,

            maxlength: 2000

        },


        // -------------------------------------------------
        // CREATED DATE
        // -------------------------------------------------

        appliedAt: {

            type: Date,

            default: Date.now

        }

    },

    {

        timestamps: true

    }

);


// =====================================================
// PREVENT DUPLICATE APPLICATIONS
// =====================================================
//
// One candidate can apply to the same job only once.
//

applicationSchema.index(

    {

        candidateId: 1,

        jobId: 1

    },

    {

        unique: true

    }

);


// =====================================================
// CREATE / REUSE MODEL
// =====================================================

const Application =

    mongoose.models.Application ||

    mongoose.model(

        "Application",

        applicationSchema

    );


// =====================================================
// EXPORT
// =====================================================

module.exports = Application;