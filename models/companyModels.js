const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1 
const companySchema = new mongoose.Schema({
    name : {
        type: String,
        require: [true, "require"],
    },

    slug : {
        type: String,
        lowercase: true,
    },

    description : String,

    companyImage: String,

    logoImage : String,

    user : {
        type : mongoose.Schema.ObjectId,
        ref : "user"
    },

    phone : String,

    linkedIn : String,

    facebook : String,

    instagram : String,
 
    advertisements : [{
        Image : String,
        title : String,
        description : String,
    }],

    ratingsAverage: {
        type: Number,
        min : [1 , "min ratingsAverage"],
        max : [5 , "max ratingsAverage"],
        default: 0,
    },

    // عدد المقيمي
    ratingsQuantity: {
        type: Number,
        default: 0,
    },

    // ----------------------------------------------------
    reviews: [{  
        rating: { type: Number, min: 1, max: 5 },
        user_review: { type: mongoose.Schema.ObjectId, ref: "user" }
    }],

    // --------------------------------------------------

    comments : [{
        comment : String,
        user_comment : {
            type : mongoose.Schema.ObjectId,
            ref : "user"
        }
    }]



},{timestamps: true})


const companymodel = mongoose.model("company", companySchema)

module.exports = companymodel


