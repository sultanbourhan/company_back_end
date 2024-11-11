const {check , bode} = require("express-validator")

const validationMiddiel = require("./validationResulte")

const companymodel = require("../models/companyModels");

const Categoreymodel = require("../models/CategoreyModels");

const usermodel = require("../models/userModels");

const Company_requestsmodel = require("../models/Company_requestsModels");


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
        .notEmpty().withMessage("Enter your phone number")
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("The phone number is invalid. It must be a valid Arabic phone number."),

    check("linkedIn")
        .custom(value => {
            if (value && !isValidLinkedInURL(value)) {
                throw new Error("The link must be a valid LinkedIn URL.");
            }
            return true;
        }),

    check("facebook")
        .custom(value => {
            if (value && !isValidFacebookURL(value)) {
                throw new Error("The link must be a valid Facebook URL.");
            }
            return true;
        }),

    check("instagram")
        .custom(value => {
            if (value && !isValidInstagramURL(value)) {
                throw new Error("The link must be a valid Instagram URL.");
            }
            return true;
        }),

    check("email")
        .notEmpty().withMessage("Enter your email")
        .isEmail().withMessage("Invalid email"),

    check("categorey")
        .notEmpty().withMessage("Enter a category for your company")
        .isMongoId().withMessage("Error in id")
        .custom((val) =>
            Categoreymodel.findById(val).then((Categorey) => {
                if (!Categorey) {
                    throw new Error(`There is no Categorey for this ID: ${val}`);
                }
            })
        ),

    check("user")
        .notEmpty().withMessage("Enter the user ID")
        .isMongoId().withMessage("Error in id")
        .custom((val) =>
            usermodel.findById(val).then((user) => {
                if (!user) {
                    throw new Error(`There is no user for this ID: ${val}`);
                }
            })
        ),

    check("Country")
        .notEmpty().withMessage("Enter your country"),

    // check("type")
    //     .notEmpty().withMessage("Select a plan")
    //     .isIn(["basic plan", "advanced plan", "premium plan"]).withMessage("Invalid plan type"),

    check("subscriptionType")
        .notEmpty().withMessage("Select a subscription type")
        .isIn(["Yearly", "Quarterly", "Monthly"]).withMessage("Invalid subscription type"),

    validationMiddiel
];


exports.update_company_my_V = [

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
        check("name")
        .notEmpty().withMessage("Enter your company name"),

        check("description")
        .notEmpty().withMessage("Enter a description of your company.")
        .isLength({ min: 15 }).withMessage("This description is short."),

        check("phone")
        .notEmpty().withMessage("Enter your phone number")
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA", "ar-SA", "ar-QA", "ar-KW", "ar-OM", "ar-JO", "ar-LB", "ar-DJ", "ar-MR", "ar-PS", "ar-TN", "ar-YE", "ar-IQ", "ar-SD", "ar-LY"])
        .withMessage("The phone number is invalid. It must be a valid Arabic phone number."),

    check("Country")
    .notEmpty().withMessage("Enter your country"),

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

    check("name")
        .notEmpty().withMessage("Enter your company name"),

    check("description")
        .notEmpty().withMessage("Enter a description of your company.")
        .isLength({ min: 15 }).withMessage("This description is short."),

    check("phone")
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

    check("Country")
    .notEmpty().withMessage("Enter your country"),

    
    check("email")
        .notEmpty().withMessage("Enter your email")
        .isEmail().withMessage("Invalid email"),

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
        
    validationMiddiel
];

exports.create_Categorey_V = [
    check("name")
    .notEmpty().withMessage("Enter category name"),

    check("Categoreyimage")
    .notEmpty().withMessage("Enter category image"),

    check("description")
    .notEmpty().withMessage("Enter a category description"),

    validationMiddiel
]

exports.update_Categorey_V = [
    check("name")
    .notEmpty().withMessage("Enter category name"),

    check("description")
    .notEmpty().withMessage("Enter a category description"),

    validationMiddiel
]



exports.delete_Categorey_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val)=>
        Categoreymodel.findById(val).then((Categorey) =>{
            if (!Categorey) {
                throw new Error(`There is no Categorey for this ID: ${val}`);
            }
        })
    )
    ,
    validationMiddiel
]

exports.get_Categorey_company_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    ,
    validationMiddiel
]

exports.create_Company_requests_V = [
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

    check("email")
    .optional()
    .isEmail().withMessage("Invalid email"),

    check("categorey")
    .notEmpty().withMessage("Enter a category for your company")
    .isMongoId().withMessage("Error in id")
    .custom((val)=>
        Categoreymodel.findById(val).then((Categorey) =>{
            if (!Categorey) {
                throw new Error(`There is no Categorey for this ID: ${val}`);
            }
        })
    ),

    check("subscription")
        .notEmpty().withMessage("Select a subscription type")
        .isIn(["Yearly", "Quarterly", "Monthly"]).withMessage("Invalid subscription type")
    ,
    validationMiddiel
]

exports.update_Company_requests_V = [

    check("description")
        .optional()
        .isLength({ min: 15 }).withMessage("This description is short.")
        .custom((val, { req }) => {
            if (req.type === 'basic plan' && val.length > 150) {
                throw new Error('The description must be less than 50 characters for a Basic plan.');
            }
            if (req.type === 'advanced plan' && val.length > 300) {
                throw new Error('The description must be less than 30 characters for a Basic plan.');
            }
            return true;
        }),

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

    check("email")
    .optional()
    .isEmail().withMessage("Invalid email"),

    check("categorey")
    .optional()
    .isMongoId().withMessage("Error in id")
    .custom((val)=>
        Categoreymodel.findById(val).then((Categorey) =>{
            if (!Categorey) {
                throw new Error(`There is no Categorey for this ID: ${val}`);
            }
        })
    )
    ,
    validationMiddiel
]

exports.get_Company_requests_id_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val)=>
        Company_requestsmodel.findById(val).then((Company)=>{
            if(!Company){
                throw new Error(`There is no request for a company account for this ID : ${val}`)
            }
        })
    )
    ,
    validationMiddiel
]

exports.delete_Company_requests_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val , {req})=>
        Company_requestsmodel.findById(val).then((Company)=>{
            if(!Company){
                throw new Error(`There is no request for a company account for this ID : ${val}`)
            }

            if(Company.user.toString() !== req.user._id.toString()){
                throw new Error(`This request is not for you.`)
            }
        })
    )
    ,
    validationMiddiel
]

exports.Accept_Company_requests_admin_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val)=>
        Company_requestsmodel.findById(val).then((Company)=>{
            if(!Company){
                throw new Error(`There is no request for a company account for this ID : ${val}`)
            }
        })
    )
    ,
    validationMiddiel
]

exports.delete_Company_requests_admin_V = [
    check("id")
    .isMongoId().withMessage("There is an error in id")
    .custom((val)=>
        Company_requestsmodel.findById(val).then((Company)=>{
            if(!Company){
                throw new Error(`There is no request for a company account for this ID : ${val}`)
            }
        })
    )
    ,
    validationMiddiel
]