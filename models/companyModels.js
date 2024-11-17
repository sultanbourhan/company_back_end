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

    email : String,
 
    advertisements : [{
        Image : String,
        title : String,
        description : String,
    }],

    ratingsAverage: {
        type: Number,
        min : [1 , "min ratingsAverage"],
        max : [5 , "max ratingsAverage"],
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
    }],

    categorey : {
        type : mongoose.Schema.ObjectId,
        ref : "categorey"
    },

    categoreys : {
        type : mongoose.Schema.ObjectId,
        ref : "categorey"
    },

    type : {
        type : String,
        enum : ["basic plan", "advanced plan" , "premium plan"],
    },

    Country: {
        type: String,
        set: (value) => {
            // تحويل أول حرف من القيمة إلى حرف كبير
            if (value && typeof value === 'string') {
                return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
            }
            return value; // في حال كانت القيمة فارغة أو غير موجودة
        }
    },
    city : String,
    street: String,

    subscription: {
        type: { type: String, enum: ['سنوي', 'ثلاث شهور', 'شهري'], required: true },
        startDate: { type: Date, default: Date.now },
        endDate: { type: Date, required: true }
    },


},{timestamps: true})


const companymodel = mongoose.model("company", companySchema)

module.exports = companymodel


