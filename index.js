import express from "express"; // Importing Express to create the server
import dotenv from "dotenv"; // Loading environment variables
import mongoose from "mongoose"; // MongoDB database connection
import { v2 as cloudinary } from "cloudinary"; // Cloudinary for image uploads
import courseRoute from "./routes/course.route.js"; // Course route
import userRoute from "./routes/user.route.js"; // User route
import adminRoute from "./routes/admin.route.js";
import fileUpload from "express-fileupload"; // Middleware for file uploads
import cookieParser from "cookie-parser";

const app = express();
dotenv.config(); // Load environment variables

// Middleware to parse JSON data and handle file uploads
app.use(express.json());
app.use(cookieParser())
app.use(
  fileUpload({
    useTempFiles: true, 
    tempFileDir: "/tmp/", 
  })
);

const port = process.env.PORT || 3000;
const DB_URI = process.env.MONGO_URL;

// MongoDB connection
try {
  await mongoose.connect(DB_URI); 
  console.log("connected to MongoDB"); 
} catch (error) {
  console.log(error); 
}

app.get("/", (req, res) => {
  res.send("Hello World!"); 
});

// API routes for course and user
app.use("/api/v1/course", courseRoute);
app.use("/api/v1/user", userRoute);
app.use("/api/v1/admin", adminRoute);

// Cloudinary configuration for file uploads
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
