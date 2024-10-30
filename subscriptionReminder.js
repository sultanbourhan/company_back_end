// const cron = require('node-cron');
// const companymodel = require('./models/companyModels'); // تأكد من مسار الملف
// const sendemail = require('./resetEmail');

// cron.schedule('0 0 * * *', async () => {
//     const fiveDaysFromNow = new Date();
//     fiveDaysFromNow.setDate(fiveDaysFromNow.getDate() + 5);

// ---------------------------------

//     const companiesToRemind = await companymodel.find({
//         'subscription.endDate': { $eq: fiveDaysFromNow }
//     });


// --------------------------

//     companiesToRemind.forEach(company => {
//         const emailOptions = {
//             email: company.email,
//             subject: 'Subscription Expiry Reminder',
//             message: `Dear ${company.name},\n\nYour subscription is set to expire on ${company.subscription.endDate}. Please renew your subscription to continue enjoying our services.\n\nBest regards,\nYour Company Name`
//         };
//         sendemail(emailOptions);
//     });

//     console.log('Subscription reminders sent.');
// });


const cron = require('node-cron');
const companymodel = require('./models/companyModels'); // تأكد من مسار الملف
const sendemail = require('./resetEmail');

// تعيين مهمة مجدولة للتحقق يوميًا في منتصف الليل
cron.schedule('0 0 * * *', async () => {
    console.log("Checking for subscriptions to remind...");

    const currentDate = new Date();
    const fiveDaysFromNow = new Date(currentDate);
    fiveDaysFromNow.setDate(currentDate.getDate() + 5);

    // البحث عن الشركات التي ستنتهي اشتراكاتها في غضون 5 أيام أو أقل
    const companiesToRemind = await companymodel.find({
        'subscription.endDate': { $gte: currentDate, $lt: fiveDaysFromNow }
    });

    console.log("Companies to remind:", companiesToRemind);

    companiesToRemind.forEach(company => {
        const emailOptions = {
            email: company.email,
            subject: 'Subscription Expiry Reminder',
            message: `Dear ${company.name},\n\nYour subscription is set to expire on ${company.subscription.endDate}. Please renew your subscription to continue enjoying our services.\n\nBest regards,\nYour Company Name`
        };
        console.log("Sending email to:", company.email);
        sendemail(emailOptions);
    });

    console.log('Subscription reminders sent.');
});

