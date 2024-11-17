const { check, body } = require("express-validator");

const validationMiddiel = require("./validationResulte");

const usermodel = require("../models/userModels");

const slugify = require("slugify");
const bcrypt = require("bcryptjs");

exports.sign_up_V = [
    check("name")
        .notEmpty().withMessage("يجب إدخال اسمك"),

    check("email")
        .notEmpty().withMessage("يجب إدخال بريدك الإلكتروني")
        .isEmail().withMessage("البريد الإلكتروني غير صحيح")
        .custom((val) =>
            usermodel.findOne({ email: val }).then((user) => {
                if (user) {
                    throw new Error("البريد الإلكتروني مستخدم بالفعل");
                }
            })
        ),

    check("password")
        .notEmpty().withMessage("يجب إدخال كلمة المرور")
        .isLength({ min: 5 }).withMessage("كلمة المرور قصيرة"),

    check("passwordConfirm")
        .notEmpty().withMessage("يجب إدخال تأكيد كلمة المرور")
        .custom((val, { req }) => {
            if (val !== req.body.password) {
                throw new Error("كلمة المرور غير متطابقة");
            }

            return true;
        }),

    validationMiddiel
];

exports.login_V = [
    // لا حاجة للتحقق من البريد الإلكتروني وكلمة المرور هنا لأننا نستخدم الجلسة في تطبيقات الاستيثاق الحديثة
    validationMiddiel
];

exports.update_user_my_V = [
    check("name")
        .notEmpty().withMessage("يجب إدخال اسمك"),

    check("phone")
        .optional()
        .isMobilePhone(["ar-AE", "ar-BH", "ar-DZ", "ar-SY", "ar-MA"]).withMessage("الرقم غير صالح"),

    validationMiddiel
];

exports.update_user_password_my_V = [
    check("password")
        .notEmpty().withMessage("يجب إدخال كلمة المرور الحالية")
        .custom(async (val, { req }) => {
            const user = await usermodel.findById(req.user._id);

            if (!user) {
                throw new Error("لم يتم العثور على المستخدم");
            }

            const pass = await bcrypt.compare(val, user.password);

            if (!pass) {
                throw new Error("كلمة المرور الحالية غير صحيحة");
            }

            return true;
        }),

    check("newpassword")
        .notEmpty().withMessage("يجب إدخال كلمة مرور جديدة"),

    check("newpasswordConfirm")
        .notEmpty().withMessage("يجب إدخال تأكيد كلمة المرور الجديدة")
        .custom((val, { req }) => {
            if (val !== req.body.newpassword) {
                throw new Error("كلمة المرور الجديدة غير متطابقة");
            }

            return true;
        }),

    validationMiddiel
];

exports.forgotpassord_V = [
    check("email")
        .notEmpty().withMessage("يجب إدخال بريدك الإلكتروني")
        .custom((val) =>
            usermodel.findOne({ email: val }).then((user) => {
                if (!user) {
                    throw new Error("البريد الإلكتروني غير موجود");
                }
            })
        ),

    validationMiddiel
];

exports.receiveAndSendEmailMe_v = [
    check("email")
        .notEmpty().withMessage("يجب إدخال بريدك الإلكتروني")
        .isEmail().withMessage("يرجى إدخال بريد إلكتروني صالح"),

    check("subject")
        .notEmpty().withMessage("يجب إدخال الموضوع"),

    check("message")
        .notEmpty().withMessage("يجب إدخال الرسالة"),

    validationMiddiel
];
