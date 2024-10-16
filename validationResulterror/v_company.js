const {check , bode} = require("express-validator")

const validationMiddiel = require("./validationResulte")

const companymodel = require("../models/companyModels");


function isValidLinkedInURL(value) {
    const regex = /^(https?:\/\/)?(www\.)?(linkedin\.com\/in\/[a-zA-Z0-9-]+)/;
    return regex.test(value);
}

function isValidFacebookURL(value) {
    const regex = /^(https?:\/\/)?(www\.)?(facebook\.com\/[a-zA-Z0-9.]+)/;
    return regex.test(value);
}

function isValidInstagramURL(value) {
    const regex = /^(https?:\/\/)?(www\.)?(instagram\.com\/[a-zA-Z0-9._]+)/;
    return regex.test(value);
}

exports.create_company_V = [
    check("name")
        .notEmpty().withMessage("Enter your company name"),

    check("description")
        .notEmpty().withMessage("Enter a description of your company.")
        .isLength({ min: 15 }).withMessage("This description is short."),

    check("companyImage")
        .notEmpty().withMessage("Enter a picture of your company."),

    check("logoImage")
        .notEmpty().withMessage("Enter your company logo"),

    check("phone")
        .optional()
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("The phone number is invalid. It must be a valid Arabic phone number."),

    check("linkedIn")
        .optional()
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("The link must be a valid LinkedIn URL.");
            }
            return true;
        }),

    check("facebook")
        .optional()
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("The link must be a valid Facebook URL.");
            }
            return true;
        }),

    check("instagram")
        .optional()
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("The link must be a valid Instagram URL.");
            }
            return true;
        }),

    validationMiddiel
];

exports.update_company_my_V = [
    check("phone")
        .optional()
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("The phone number is invalid. It must be a valid Arabic phone number."),

    check("linkedIn")
        .optional()
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("The link must be a valid LinkedIn URL.");
            }
            return true;
        }),

    check("facebook")
        .optional()
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("The link must be a valid Facebook URL.");
            }
            return true;
        }),

    check("instagram")
        .optional()
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("The link must be a valid Instagram URL.");
            }
            return true;
        }),

    validationMiddiel
]

exports.update_company_id_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val)=>
        companymodel.findById(val).then((company)=>{
            if(!company){
                throw new Error(`There is an error in idThere is no company account for this ID ${val}`)
            }
        })   
    ),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
    .withMessage("The phone number is invalid. It must be a valid Arabic phone number."),

    check("linkedIn")
    .optional()
    .custom(value => {
        if (value && !isValidLinkedInURL(value)) {
            throw new Error("The link must be a valid LinkedIn URL.");
        }
        return true;
    }),

    check("facebook")
    .optional()
    .custom(value => {
        if (value && !isValidFacebookURL(value)) {
            throw new Error("The link must be a valid Facebook URL.");
        }
        return true;
    }),

    check("instagram")
    .optional()
    .custom(value => {
        if (value && !isValidInstagramURL(value)) {
            throw new Error("The link must be a valid Instagram URL.");
        }
        return true;
    }),

    validationMiddiel
]

exports.get_company_id_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val)=>
        companymodel.findById(val).then((company)=>{
            if(!company){
                throw new Error(`There is an error in idThere is no company account for this ID${val}`)
            }
        })   
    ),

    validationMiddiel
]

exports.delete_company_id_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val)=>
        companymodel.findById(val).then((company)=>{
            if(!company){
                throw new Error(`There is an error in idThere is no company account for this ID${val}`)
            }
        })   
    ),

    validationMiddiel
]

exports.create_company_advertisements_my_V = [
    check("Image")
    .optional(),

    check("title")
    .notEmpty().withMessage("Ad title must be entered."),

    check("description")
    .notEmpty().withMessage("Ad details must be entered.")
    
    ,
    validationMiddiel
]

exports.delete_company_advertisements_my_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")

    ,
    validationMiddiel
]

exports.create_company_comments_V = [
    check("id")
        .isMongoId().withMessage("Error in id")
        .custom((val) =>
            companymodel.findById(val).then((company) => {
                if (!company) {
                    throw new Error(`There is no company account for this ID: ${val}`);
                }
            })
        ),
    check("comment")
        .notEmpty().withMessage("A comment must be written.")
        .trim().withMessage("A comment cannot be only spaces."),
        // .custom((val) => {
        //     if (val === "") {
        //         throw new Error(`A comment must be written.`);
        //     }
        // }),
    validationMiddiel
];
