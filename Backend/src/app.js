import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import { ApiError } from "./utils/ApiError.js"




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

// 404 handler for undefined routes - MUST come before error handler
app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errors: [],
    data: null
  });
});

// Global error handler middleware - MUST be the very last middleware
// This MUST have 4 parameters (err, req, res, next) for Express to recognize it as an error handler
app.use((err, req, res, next) => {
  // Ensure we haven't already sent a response
  if (res.headersSent) {
    return next(err);
  }

  // Set default headers to JSON
  res.setHeader('Content-Type', 'application/json');
  
  // Log the error for debugging
  console.error("Error Handler Caught:", {
    message: err.message,
    statusCode: err.statusCode,
    stack: err.stack
  });
  
  // If it's an ApiError (has statusCode property), use its properties
  if (err && err.statusCode) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message || "Something went wrong",
      errors: err.errors || [],
      data: null
    });
  }

  // For other errors, return a generic 500 error
  console.error("Unhandled Error:", err);
  return res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errors: [],
    data: null
  });
});

export { app }