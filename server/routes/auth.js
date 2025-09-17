import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import upload from "../middlewares/upload.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "meetocure_secret";

// POST /auth/register
router.post("/register", upload.single("image"), async (req, res) => {
  try {
    const { hospitalName, address, contact, email, password } = req.body;
    if (!hospitalName || !address || !contact || !email || !password) {
      return res
        .status(400)
        .json({ success: false, error: "All fields are required." });
    }

    // Check if hospital/email already exists
    const exists = await User.findOne({ email, hospitalName });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, error: "Hospital already registered with this email." });
    }

    // ✅ Cloudinary automatically returns `req.file.path` as a URL
    let imageUrl = "";
    if (req.file && req.file.path) {
      imageUrl = req.file.path; // Cloudinary secure URL
    }

    const newUser = new User({
      hospitalName,
      address,
      contact,
      email,
      password,
      hospitalImage: imageUrl,
    });

    await newUser.save();

    const token = jwt.sign({ email, hospitalName }, JWT_SECRET, { expiresIn: "2h" });
    res.status(201).json({ success: true, token, hospitalName, hospitalImage: imageUrl });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password, hospitalName } = req.body;
    const user = await User.findOne({ email, hospitalName });
    if (user) {
      const isMatch = await user.comparePassword(password);
      if (!isMatch)
        return res.status(401).json({ success: false, error: "Invalid password" });

      const token = jwt.sign(
        { email, hospitalName: user.hospitalName },
        JWT_SECRET,
        { expiresIn: "2h" }
      );
      return res.json({
        success: true,
        token,
        hospitalName: user.hospitalName,
        email: user.email,
        id: user._id,
      });
    }

    // Email exists but for different hospital
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res
        .status(409)
        .json({ success: false, error: "This email is already registered for another hospital." });
    }

    return res
      .status(404)
      .json({ success: false, error: "Hospital or email not found. Please register." });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// GET /auth/me
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "No token provided" });

    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ email: decoded.email, hospitalName: decoded.hospitalName });
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
});

export default router;
