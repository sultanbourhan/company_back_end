const mongoose = require("mongoose");

// 1 
const CategoreySchema = new mongoose.Schema({
    name : {
        type: String,
    },
    slug : {
        type: String,
        lowercase: true,
    },
    description : String,
    Categoreyimage: String,

},{timestamps: true})


const Categoreymodel = mongoose.model("categorey", CategoreySchema)

module.exports = Categoreymodel