const { check, body } = require("express-validator");
const validationMiddiel = require("./validationResulte");
const usermodel = require("../models/userModels");

exports.create_user_V = [
    check("name")
    .notEmpty().withMessage("الرجاء إدخال اسمك"),

    check("email")
    .notEmpty().withMessage("الرجاء إدخال بريدك الإلكتروني")
    .isEmail().withMessage("البريد الإلكتروني غير صحيح")
    .custom((val) =>
        usermodel.findOne({ email: val }).then((user) => {
            if (user) {
                throw new Error("البريد الإلكتروني مستخدم بالفعل");
            }
        })
    ),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA"]).withMessage("رقم الهاتف غير صالح"),

    check("password")
    .notEmpty().withMessage("الرجاء إدخال كلمة المرور")
    .isLength({ min: 5 }).withMessage("كلمة المرور قصيرة للغاية"),

    check("role")
    .notEmpty().withMessage("الرجاء إدخال الدور"),

    check("passwordConfirm")
    .notEmpty().withMessage("الرجاء تأكيد كلمة المرور")
    .custom((val, { req }) => {
        if (val !== req.body.password) {
            throw new Error("كلمة المرور غير متطابقة");
        }
        return true;
    }),

    validationMiddiel
];

exports.get_user_ID_V = [
    check("id")
    .isMongoId().withMessage("معرف المستخدم غير صحيح"),
    validationMiddiel
];

exports.update_user_V = [
    check("id")
    .isMongoId().withMessage("معرف المستخدم غير صحيح"),

    check("email")
    .optional()
    .isEmail().withMessage("البريد الإلكتروني غير صحيح")
    .custom((val) =>
        usermodel.findOne({ email: val }).then((user) => {
            if (user) {
                throw new Error("البريد الإلكتروني مستخدم بالفعل");
            }
        })
    ),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA"]).withMessage("رقم الهاتف غير صالح"),

    validationMiddiel
];

exports.delete_user_V = [
    check("id")
    .isMongoId().withMessage("معرف المستخدم غير صحيح"),
    validationMiddiel
];

exports.update_password_user_V = [
    check("id")
    .isMongoId().withMessage("معرف المستخدم غير صحيح"),

    check("password")
    .notEmpty().withMessage("الرجاء إدخال كلمة المرور الجديدة"),

    check("passwordConfirm")
    .notEmpty().withMessage("الرجاء تأكيد كلمة المرور")
    .custom((val, { req }) => {
        if (val !== req.body.password) {
            throw new Error("كلمة المرور غير متطابقة");
        }
        return true;
    }),

    validationMiddiel
];

exports.create_addresses_user_V = [
    check("address_location")
    .notEmpty().withMessage("الرجاء إدخال الموقع"),

    check("details")
    .notEmpty().withMessage("الرجاء إدخال تفاصيل العنوان"),

    check("phone")
    .optional()
    .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA"]).withMessage("رقم الهاتف غير صالح"),

    validationMiddiel
];

exports.delete_addresses_user_V = [
    check("addressesid")
    .isMongoId().withMessage("معرف العنوان غير صحيح"),
    validationMiddiel
];

exports.create_wichlist_user_V = [
    check("productid")
    .notEmpty().withMessage("الرجاء إدخال المنتج")
    .isMongoId().withMessage("المعرف غير صالح"),
    validationMiddiel
];

exports.delete_wichlist_user_V = [
    check("productid")
    .notEmpty().withMessage("الرجاء إدخال المنتج")
    .isMongoId().withMessage("المعرف غير صالح"),
    validationMiddiel
];
