const mongoose = require("mongoose");

// 1 
const advertisementsSchema = new mongoose.Schema({
    Image : [String],
    title : String,
    description : String,
    likes :[{
        type : mongoose.Schema.ObjectId,
        ref : "user"
    }],

    Company : {
        type : mongoose.Schema.ObjectId,
        ref : "company"
    },

    categorey : {
        type : mongoose.Schema.ObjectId,
        ref : "categorey"
    }




},{timestamps: true})


const advertisementsmodel = mongoose.model("advertisements", advertisementsSchema)

module.exports = advertisementsmodel