const usermodel = require("../models/userModels");
const ApiError = require("../ApiError");

const asyncHandler = require("express-async-handler");
const slugify = require("slugify");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jsonwebtoken = require("jsonwebtoken");

const sendemail = require("../resetEmail");
const sendemailMe = require("../sindEmailMe");

// -----------------------------------
const session = require('express-session'); // لضمان استخدام الجلسات
// -----------------------------------

exports.sign_up = asyncHandler(async (req, res, next) => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000); // رمز تحقق عشوائي مكون من 6 أرقام

    // حفظ البيانات في الجلسة بدلاً من التخزين المباشر في قاعدة البيانات
    req.session.tempUser = {
        name: req.body.name,
        email: req.body.email,
        password: await bcrypt.hash(req.body.password, 12),
        passwordConfirm: req.body.passwordConfirm,
        verificationCode: verificationCode // تخزين رمز التحقق في الجلسة
    };

    // إعداد البيانات لإرسال البريد الإلكتروني
    const emailData = {
        email: req.body.email,
        subject: 'Verification Code',
        message: `Your verification code is: ${verificationCode}`
    };

    console.log(req.session.tempUser);

    // إرسال البريد الإلكتروني
    await sendemail(emailData);

    // إعادة توجيه المستخدم إلى صفحة التحقق
    res.status(200).json({ data: req.session.tempUser });
});

// ---------------------------------------
exports.verify_code = asyncHandler(async (req, res, next) => {
    const { verificationCode } = req.body;
    const tempUser = req.body.tempUser;

    if (!tempUser || tempUser.verificationCode !== parseInt(verificationCode, 10)) {
        return res.status(400).json({ message: 'رمز التحقق غير صحيح' });
    }

    const user = await usermodel.create({
        name: tempUser.name,
        email: tempUser.email,
        password: tempUser.password,
        passwordConfirm: tempUser.passwordConfirm,
        isVerified: true
    });

    const token = jsonwebtoken.sign(
        { userID: user._id },
        process.env.WJT_SECRET,
        { expiresIn: process.env.WJT_EXPIRESIN }
    );

    req.session.tempUser = null;

    res.status(200).json({ data: user, token });
});

// ---------------------------------------
exports.login = asyncHandler(async (req, res, next) => {
    const user = await usermodel.findOne({ email: req.body.email });

    if (!user || !await bcrypt.compare(req.body.password, user.password)) {
        return next(new ApiError("البريد الإلكتروني أو كلمة المرور غير صحيحة", 401));
    }

    const token = jsonwebtoken.sign(
        { userID: user._id },
        process.env.WJT_SECRET,
        { expiresIn: process.env.WJT_EXPIRESIN }
    );

    user.active = true;
    await user.save();

    res.status(201).json({ data: user, token });
});

// ---------------------------------------
exports.check_login = asyncHandler(async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
    } else {
        return next(new ApiError("يرجى إدخال الرمز المميز", 401));
    }

    const codetoken = jsonwebtoken.verify(token, process.env.WJT_SECRET);

    const user = await usermodel.findById(codetoken.userID);
    if (!user) {
        return next(new ApiError("المستخدم غير موجود أو الرمز المميز غير صالح", 401));
    }

    if (user.password_Update_Time) {
        if (parseInt(user.password_Update_Time.getTime() / 1000) > codetoken.iat) {
            return next(new ApiError("يرجى تسجيل الدخول مجددًا", 401));
        }
    }

    if (user.active === false) {
        return next(new ApiError("يرجى تسجيل الدخول مجددًا", 401));
    }

    req.user = user;
    next();
});

// ---------------------------------------
exports.check_user_role = (...roles) => asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
        return next(new ApiError("ليس لديك الصلاحية لتنفيذ هذا الإجراء", 403));
    }

    next();
});

// ---------------------------------------
exports.get_user_my = asyncHandler(async (req, res, next) => {
    const user = await usermodel.findById(req.user._id);

    if (!user) {
        return next(new ApiError("المستخدم غير موجود", 404));
    }

    res.status(200).json({ data: user });
});

// ----------------------------------------
exports.update_user_my = asyncHandler(async (req, res, next) => {
    if (req.body.name) {
        req.body.slug = slugify(req.body.name);
    }

    const updateData = {
        name: req.body.name,
        slug: req.body.slug,
        phone: req.body.phone
    };

    // تحديث الحقل profileImage فقط إذا كانت الصورة موجودة
    if (req.body.profilImage) {
        updateData.profilImage = `${process.env.BASE_URL}/user/${req.body.profilImage}`;
    }

    const user = await usermodel.findOneAndUpdate(
        { _id: req.user._id },
        updateData,
        { new: true }
    );

    if (!user) {
        return next(new ApiError("لا يوجد مستخدم بهذا المعرف", 404));
    }

    res.status(200).json({ data: user });
});

// ----------------------------------------
exports.update_user_password_my = asyncHandler(async (req, res, next) => {
    const user = await usermodel.findOneAndUpdate(
        { _id: req.user._id },
        {
            password: await bcrypt.hash(req.body.newpassword, 12),
            password_Update_Time: Date.now()
        },
        { new: true }
    );

    if (!user) {
        return next(new ApiError("لا يوجد مستخدم بهذا المعرف", 404));
    }

    const token = jsonwebtoken.sign(
        { userID: user._id },
        process.env.WJT_SECRET,
        { expiresIn: process.env.WJT_EXPIRESIN }
    );

    res.status(200).json({ data: user, token });
});

// ---------------------------------------
exports.logout = asyncHandler(async (req, res, next) => {
    const user = await usermodel.findOneAndUpdate(
        { _id: req.user._id },
        { active: false },
        { new: true }
    );

    if (!user) {
        return next(new ApiError("لا يوجد مستخدم بهذا المعرف", 404));
    }

    res.status(200).json({ data: user });
});

// --------------------------------------
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const { email } = req.body;
    const user = await usermodel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const verificationCode = Math.floor(100000 + Math.random() * 900000);
    user.verificationCode = verificationCode;
    await user.save();

    const emailData = {
        email: user.email,
        subject: 'رمز التحقق لإعادة تعيين كلمة المرور',
        message: `رمز التحقق هو: ${verificationCode}`
    };

    await sendemail(emailData);

    res.status(200).json("تم إرسال رمز التحقق إلى بريدك الإلكتروني");
});

exports.verifyResetPassword = asyncHandler(async (req, res, next) => {
    const { email, verificationCode } = req.body;
    const user = await usermodel.findOne({ email, verificationCode });

    if (!user) {
        return res.status(400).json({ message: 'رمز التحقق غير صالح' });
    }

    res.status(200).json("الرجاء تغيير كلمة المرور الآن");
});

exports.resetPassword = asyncHandler(async (req, res, next) => {
    const { newPassword, passwordConfirm, email } = req.body;
    const user = await usermodel.findOne({ email });

    if (!user) {
        return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    if (newPassword !== passwordConfirm) {
        return res.status(400).json({ message: 'كلمات المرور غير متطابقة' });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.verificationCode = undefined;
    await user.save();

    res.status(200).json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
});

// ----------------------------------------
exports.receiveAndSendEmailMe = asyncHandler(async (req, res, next) => {
    const { email, subject, message } = req.body;

    const mailObject = {
        email,
        subject,
        message
    };

    try {
        await sendemailMe(mailObject);
        res.status(200).json({ message: 'تم إرسال رسالتك بنجاح' });
    } catch (error) {
        console.error('Error sending email: ', error);
        res.status(500).json({ message: 'حدث خطأ أثناء إرسال الرسالة. حاول مرة أخرى.' });
    }
});
