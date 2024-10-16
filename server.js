const express = require('express');

const path = require("path")

const dotenv = require('dotenv');

const morgan = require("morgan")

const mongoose = require("mongoose")

const cors = require("cors");

const bodyParser = require("body-parser")

const userroutes = require("./routes/userRoutes")
const authroutes = require("./routes/authRoutes")
const companyroutes = require("./routes/companyRoutes")


dotenv.config({path : "config.env"})

mongoose.connect(process.env.DB_URL).then(()=>{
    console.log("mongoose yes")
}).catch((err)=>{
    console.log("mongoose no")
})

const app = express();

app.use(cors())

app.use(express.json())
app.use(express.static(path.join(__dirname, "image")))


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use("/api/v2/user", userroutes)
app.use("/api/v2/auth", authroutes)
app.use("/api/v2/company", companyroutes)




app.use((err, req, res, next)=>{
    err.statusCode = err.statusCode || 500
    err.status = err.status || "error"

    res.status(err.statusCode).json({
        status : err.status,
        error : err,
        message :err.message,
        stack : err.stack,
    })
})


if (process.env.NODE_ENV === "development") {
    app.use(morgan("dev"))
    console.log(process.env.NODE_ENV)
}

app.get('/', (req, res) => {
    res.send('Hello World');
});

const PORT = process.env.PORT || 8000
app.listen( PORT , ()=>{
    console.log("port 8000")
})


process.on(`unhandledRejection`,(err)=>{
    console.error(`unhandledRejection Error : ${err}`)
    server.close(()=>{
        console.error(`Shuttimg down....`) 
    })
    process.exit(1)
})

