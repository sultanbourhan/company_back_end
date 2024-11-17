const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 1
const Company_requestsModelsSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: [true, "require"],
    },

    slug: {
      type: String,
      lowercase: true,
    },

    description: String,

    companyImage: String,

    logoImage: String,

    user: {
      type: mongoose.Schema.ObjectId,
      ref: "user",
    },

    phone: String,

    linkedIn: String,

    facebook: String,

    instagram: String,

    email: String,

    advertisements: [
      {
        Image: String,
        title: String,
        description: String,
      },
    ],

    ratingsAverage: {
      type: Number,
      min: [1, "min ratingsAverage"],
      max: [5, "max ratingsAverage"],
    },

    // عدد المقيمي
    ratingsQuantity: {
      type: Number,
      default: 0,
    },

    // ----------------------------------------------------
    reviews: [
      {
        rating: { type: Number, min: 1, max: 5 },
        user_review: { type: mongoose.Schema.ObjectId, ref: "user" },
      },
    ],

    // --------------------------------------------------

    comments: [
      {
        comment: String,
        user_comment: {
          type: mongoose.Schema.ObjectId,
          ref: "user",
        },
      },
    ],

    categorey: {
      type: mongoose.Schema.ObjectId,
      ref: "categorey",
    },

    type: {
      type: String,
      enum: ["basic plan", "advanced plan", "premium plan"],
    },

    Country: String,
    city: String,
    street: String,

    subscription: {
      type: String,
      enum: ['سنوي', 'ثلاث شهور', 'شهري'],
      required: true,
    },
  },
  { timestamps: true }
);

const Company_requestsmodel = mongoose.model(
  "Company_requests",
  Company_requestsModelsSchema
);

module.exports = Company_requestsmodel;
