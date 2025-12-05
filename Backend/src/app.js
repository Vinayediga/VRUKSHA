import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"




const app = express()

const allowedOrigins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "http://localhost:5175",
    "http://127.0.0.1:5175",
]

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true)
        }
        return callback(new Error("Not allowed by CORS"))
    },
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("Public/temp"))
app.use(cookieParser())

app.use((req, res, next) => {
    console.log("Request Cookies:", req.cookies); // Debug cookies
    console.log("Request Headers:", req.headers); // Debug headers
    next();
  });
//routes import
import userRouter from './routes/user.routes.js'



app.use("/api/v1/users", userRouter)




export { app }