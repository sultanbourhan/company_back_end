const express = require("express");
const path = require("path");
const dotenv = require("dotenv");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const xss = require("xss-clean");
const bodyParser = require("body-parser");
const session = require("express-session");
const mongoSanitize = require("express-mongo-sanitize");
const csurf = require("csurf");
const userroutes = require("./routes/userRoutes");
const authroutes = require("./routes/authRoutes");
const companyroutes = require("./routes/companyRoutes");

// const session = require('express-session');
const MongoStore = require("connect-mongo");

dotenv.config({ path: "config.env" });

mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log("mongoose yes");
  })
  .catch((err) => {
    console.log("mongoose no");
  });

const app = express();
app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:3000");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

//   ====================================================================


// ======================================================
// const session = require('express-session');
// const MongoStore = require('connect-mongo');

// تكوين الجلسات
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.DB_URL // استخدم URI الثابت الخاص بقاعدة البيانات
    }),
    cookie: {
        secure: false, // ضعها على true إذا كنت تستخدم HTTPS
        maxAge: 1000 * 60 * 60 // مدة الجلسة: ساعة واحدة
    }
}));

// تكوين csurf
// const csrfProtection = csurf();
// app.use(csrfProtection);

app.use(express.json({ limit: "10000kb" }));
app.use(express.static(path.join(__dirname, "image")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// To remove data using these defaults:
app.use(mongoSanitize());

// make sure this comes before any routes
app.use(xss());

// app.use((req, res, next) => {
//     res.locals.csrfToken = req.csrfToken(); // يمكنك استخدام ذلك في قوالب HTML
//     next();
// });

app.use(hpp());

require("./subscriptionReminder");

app.use("/api/v2/user", userroutes);
app.use("/api/v2/auth", authroutes);
app.use("/api/v2/company", companyroutes);

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
});

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(process.env.NODE_ENV);
}

app.get("/", (req, res) => {
  res.send("Hello World");
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log("port 8000");
});

process.on("unhandledRejection", (err) => {
  console.error(`unhandledRejection Error: ${err}`);
  server.close(() => {
    console.error(`Shutting down....`);
  });
  process.exit(1);
});
