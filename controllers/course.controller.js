import { Course } from "../models/course.model.js"; // Importing Course model to interact with the course database
import { v2 as cloudinary } from "cloudinary"; // Importing cloudinary for uploading images to the cloud
import { Purchase } from "../models/purchase.mode.js";
import mongoose from "mongoose";

// ==========================
//      COURSE CREATION
// ==========================
export const createCourse = async (req, res) => {
  const adminId = req.adminId;
  const { title, description, price } = req.body;

  try {
    // Check if all necessary fields are provided
    if (!title || !description || !price) {
      return res.status(400).json({ errors: "All fields are required" });
    }

    // Handle file upload
    const { image } = req.files; // Extract the image from the uploaded files
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ errors: "No file uploaded" });
    }

    // Validate the image format
    const allowedFormat = ["image/png", "image/jpg", "image/jpeg"];
    if (!allowedFormat.includes(image.mimetype)) {
      return res
        .status(400)
        .json({ error: "Invalid image format. Only .png & .jpg allowed" });
    }

    // Upload image to Cloudinary
    const cloud_response = await cloudinary.uploader.upload(
      image.tempFilePath,
      {
        folder: "courses",
      }
    );
    if (!cloud_response || cloud_response.error) {
      return res
        .status(400)
        .json({ errors: "Error uploading file to Cloudinary" });
    }

    // Prepare the course data with image URL and public ID from Cloudinary response
    const courseData = {
      title,
      description,
      price,
      image: {
        public_id: cloud_response.public_id, // Store the Cloudinary public ID
        url: cloud_response.url, // Store the Cloudinary URL
      },
      creatorId: adminId,
    };

    // Save the new course in the database
    const course = await Course.create(courseData);

    // Respond with success message and the created course data
    res.json({
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    // Handle any unexpected errors
    console.log(error);
    res.status(500).json({ error: "Error creating course" });
  }
};

// ==========================
//      COURSE UPDATION
// ==========================
export const updateCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;
  const { title, description, price } = req.body;

  try {
    
    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ errors: "Invalid course ID or Course not found" });
    }
    const course = await Course.findOne({ _id: courseId, creatorId: adminId });
    if (!course) {
      return res
        .status(404)
        .json({ errors: "unauthorized access" });
    }

    // Update basic fields if provided
    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = price;

    // If a new image is uploaded
    if (req.files && req.files.image) {
      const newImage = req.files.image;

      // Validate image type
      const allowedFormats = ["image/png", "image/jpg", "image/jpeg"];
      if (!allowedFormats.includes(newImage.mimetype)) {
        return res.status(400).json({
          error: "Invalid image format. Only .png, .jpg, and .jpeg allowed",
        });
      }

      // Delete old image from Cloudinary
      await cloudinary.uploader.destroy(course.image.public_id);

      // Upload new image to Cloudinary
      const cloudResponse = await cloudinary.uploader.upload(
        newImage.tempFilePath,
        {
          folder: "courses",
        }
      );

      // Update image info
      course.image = {
        public_id: cloudResponse.public_id,
        url: cloudResponse.secure_url,
      };
    }

    // Save changes
    const updatedCourse = await course.save();

    res.status(200).json({
      message: "Course updated successfully",
      course: updatedCourse,
    });
  } catch (error) {
    console.error("Error in course updating:", error);
    res.status(500).json({ errors: "Internal server error during update" });
  }
};

// ==========================
//      COURSE DELETION
// ==========================
export const deleteCourse = async (req, res) => {
  const adminId = req.adminId;
  const { courseId } = req.params;

  try {
    // Step 1: Fetch only the image.public_id to avoid loading unnecessary data
    const course = await Course.findOne({
      _id: courseId,
      creatorId: adminId,
    }).select("image.public_id");

    // Step 2: Check if course exists and belongs to the requesting admin
    if (!course) {
      return res.status(404).json({
        errors: "Course not found or not authorized to delete",
      });
    }

    const publicId = course.image.public_id;

    // Step 3: Delete the course from DB
    await Course.deleteOne({ _id: courseId });

    // Step 4: Delete the image from Cloudinary
    const cloudinaryResponse = await cloudinary.uploader.destroy(publicId);

    // Step 5: Handle Cloudinary response
    if (cloudinaryResponse.result !== "ok") {
      return res.status(200).json({
        message: "Course deleted, but Cloudinary image deletion failed",
        cloudinaryResponse,
      });
    }

    res.status(200).json({
      message: "Course and image deleted successfully",
      cloudinaryResponse,
    });
  } catch (error) {
    console.error("Error in deleting course:", error);
    res.status(500).json({
      errors: "Internal server error while deleting course",
    });
  }
};

// ====================================
//      GET ALL COURSE DETAIL
// ====================================
export const getCourses = async (req, res) => {
  try {
    // Fetch all courses from the database
    const courses = await Course.find({});
    res.status(201).json({ courses }); // Respond with the list of courses
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({ errors: "Error in getting courses" });
    console.log("Error to get courses", error);
  }
};

// ====================================
//      GET PARTICULAR COURSE DETAIL
// ====================================
export const getDetails = async (req, res) => {
  const { courseId } = req.params; // Extract courseId from URL parameters
  try {
    // Fetch the course by ID
    const course = await Course.findById(courseId);

    // If course is not found, return error
    if (!course) {
      return res.status(404).json({ error: "Course not found!" });
    }

    // Respond with the course details
    res.status(200).json({ course });
  } catch (error) {
    // Handle any unexpected errors
    res.status(500).json({ errors: "Error in getting course details" });
    console.log("Error in getting course details", error);
  }
};

// ==========================
//      COURSE BUY
// ==========================
export const buyCourses = async (req, res) => {
  const { userId } = req;
  const { courseId } = req.params;

  try {
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    const existingPurchase = await Purchase.findOne({ userId, courseId });
    if (existingPurchase) {
      return res
        .status(400)
        .json({ error: "User has already purchased this course" });
    }
    const newPurchase = new Purchase({ userId, courseId });
    await newPurchase.save();
    res
      .status(201)
      .json({ message: "Course purchased sucessfully", newPurchase });
  } catch (error) {
    res.status(500).json({ errors: " Error in course buying!" });
    console.log("Error in course buying!", error);
  }
};
