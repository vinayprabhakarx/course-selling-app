import { User } from "../models/user.model.js";
import bcrypt from "bcrypt";
import { z } from "zod";
import jwt from "jsonwebtoken";
import config from "../config.js";
import dotenv from "dotenv";
import { Purchase } from "../models/purchase.mode.js";
import { Course } from "../models/course.model.js";

dotenv.config();

// ==========================
//      USER SIGNUP
// ==========================
export const signup = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Zod schema for validation
  const userSchema = z.object({
    firstName: z.string().min(3, "First name must be at least 3 characters"),
    lastName: z.string().optional(),
    email: z.string().email("Invalid email format"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must include at least one uppercase letter")
      .regex(/[a-z]/, "Must include at least one lowercase letter")
      .regex(/[0-9]/, "Must include at least one number")
      .regex(/[^A-Za-z0-9]/, "Must include at least one special character"),
  });

  const validateData = userSchema.safeParse(req.body);
  if (!validateData.success) {
    return res.status(400).json({
      errors: validateData.error.issues.map((err) => err.message),
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ errors: "User already exists" });
    }

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful!",
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
      },
    });
  } catch (error) {
    res.status(500).json({ errors: "Error in signup" });
    console.error("Signup error:", error);
  }
};

// ==========================
//      USER LOGIN
// ==========================
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // Compare plain text password with hashed password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(403).json({ errors: "Invalid credentials" });
    }

    // Generate JWT token after successful login
    const token = jwt.sign(
      {
        id: user._id,
      },
      config.JWT_USER_PASSWORD,
      { expiresIn: "1d" }
    );
    const cookieOptions = {
      expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
      httpOnly: true, //Can't accessed via js directly
      secure: process.env.NODE_ENV === "production", // True for https only
      sameSite: "Strict", // CSRF attacks prevention
    };
    res.cookie("jwt", token, cookieOptions);

    // Return success response with user info and token
    res.status(200).json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  } catch (error) {
    // Handle any server-side or DB errors
    console.error("Error in login:", error);
    res.status(500).json({ errors: "Server error during login" });
  }
};

// ==========================
//      LOGOUT
// ==========================
export const logout = (req, res) => {
  try {
    if (!req.cookies.jwt) {
      return res.status(401).json({ errors: "Kindly login first" });
    }
    res.clearCookie("jwt");
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ errors: "Error in logout" });
    console.log("Error in logout", error);
  }
};

// ==========================
//      PURCHASE
// ==========================
export const purchases = async (req, res) => {
  const userId = req.userId;
  try {
    const purchased = await Purchase.find({ userId });
    let purchasedCourseId = [];
    for (let i = 0; i < purchased.length; i++) {
      purchasedCourseId.push(purchased[i].courseId);
    }
    const courseData = await Course.find({
      _id: { $in: purchasedCourseId },
    });
    res.status(200).json({ purchased, courseData });
  } catch (error) {
    res.status(500).json({ error: "Error in purchases" });
    console.log("Error in purchase", error);
  }
};
