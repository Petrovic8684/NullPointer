const User = require("../models/userModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { cloudinary } = require("../config/cloudinary");

// @desc    Fetches all users (with optional filters, search, and pagination)
// @route   GET /users
// @access  Public
const fetchAllUsers = async (req, res) => {
  const { isAdmin, isBanned, page, limit, search } = req.query;

  try {
    const filter = {};

    if (isAdmin !== undefined) filter.isAdmin = isAdmin === "true";
    if (isBanned !== undefined) filter.isBanned = isBanned === "true";
    if (search) filter.username = { $regex: search, $options: "i" };

    const query = User.find(filter).select("-password");

    const total = await User.countDocuments(filter);

    if (page && limit) {
      const skip = (page - 1) * limit;
      query.skip(skip).limit(Number(limit));
    }

    const users = await query.lean();

    res.status(200).json({
      total,
      page: Number(page) || 1,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetches user with id.
// @route   GET /users/:id
// @access  Public
const fetchOneUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId).select("-password").exec();

    if (!user) return res.status(404).send("User not found!");

    res.status(200).send(user);
  } catch (error) {
    res.status(400).json(error.message);
  }
};

// @desc    Fetches all users sorted by reputation in descending order ( with optional pagination).
// @route   GET /users/byReputation
// @access  Public
const fetchUsersByReputation = async (req, res) => {
  const { page, limit } = req.query;

  try {
    let users = await User.find()
      .select("username reputation")
      .sort({ reputation: -1 })
      .lean();

    if (!page || !limit || page <= 0 || limit <= 0)
      return res.status(200).json(users);

    // Pagination
    const skip = (page - 1) * limit;
    const usersLength = users.length;
    users = users.slice(skip, skip + Number(limit));

    res.status(200).json({
      total: usersLength,
      page: Number(page),
      totalPages: Math.ceil(usersLength / limit),
      users,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Registers a user in.
// @route   POST /users/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (password.length < 5) {
      return res
        .status(401)
        .json({ message: "Password must be at least 5 characters long!" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const userToSend = newUser.toObject();
    delete userToSend.password;

    res.status(201).json(userToSend);
  } catch (error) {
    res.status(500).json(error);
  }
};

// @desc    Logs a user in.
// @route   POST /users/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ message: "Invalid credentials!" });

    const token = jwt.sign({ userId: user._id }, process.env.TOKEN_SECRET, {
      expiresIn: "2h",
    });

    const userToSend = user.toObject();
    delete userToSend.password;

    res.status(200).json({ user: userToSend, token: token });
  } catch (error) {
    res.status(500).json(error);
  }
};

// @desc    Logs a user out.
// @route   POST /users/logout
// @access  Public
const logoutUser = (req, res) => {
  res.status(200).json({ message: "User successfully logged out!" });
};

// @desc    Promotes user to an admin.
// @route   PUT /users/:id/promote
// @access  Admin only
const promoteUserToAdmin = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    if (user.isAdmin)
      return res.status(200).json({ message: "User already an admin!" });

    if (user.isBanned)
      return res.status(200).json({
        message: "This user is banned! Unban them first then promote to admin!",
      });

    user.isAdmin = true;
    await user.save();

    const userToSend = user.toObject();
    delete userToSend.password;

    res.status(200).json(userToSend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bans a user.
// @route   PUT /users/:id/ban
// @access  Admin only
const banUser = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    if (user.isAdmin)
      return res
        .status(401)
        .json({ message: "Operation illegal because user is an admin!" });

    if (user.isBanned)
      return res.status(200).json({ message: "User already banned!" });

    user.isBanned = true;
    await user.save();

    const userToSend = user.toObject();
    delete userToSend.password;

    res.status(200).json(userToSend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Unbans a user.
// @route   PUT /users/:id/unban
// @access  Admin only
const unbanUser = async (req, res) => {
  const { id: userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found!" });

    if (user.isAdmin)
      return res
        .status(401)
        .json({ message: "Operation illegal because user is an admin!" });

    if (!user.isBanned)
      return res.status(200).json({ message: "User was not banned!" });

    user.isBanned = false;
    await user.save();

    const userToSend = user.toObject();
    delete userToSend.password;

    res.status(200).json(userToSend);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Requests user password reset.
// @route   POST /users/forgotPassword
// @access  Public
const requestPasswordReset = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "User not found with that email!" });
    }

    const resetToken = jwt.sign(
      { userId: user._id },
      process.env.TOKEN_SECRET,
      {
        expiresIn: "1h",
      }
    );

    const resetUrl = `http://localhost:${process.env.FRONTEND_PORT}/reset-password?token=${resetToken}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "null.pointer.noreply@gmail.com",
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: "null.pointer.app.noreply@gmail.com",
      to: user.email,
      subject: "NullPointer - Password Reset Request",
      text: `Please visit the following URL to reset your password: ${resetUrl}`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email sent for password reset!" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Resets user password.
// @route   POST /users/resetPassword/:token
// @access  Public
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);

    const user = await User.findById(decoded.userId);
    if (!user) return res.status(400).json({ message: "User not found!" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token!" });
  }
};

// @desc    Uploads a new user profile image.
// @route   POST /users/uploadImage
// @access  User
const uploadImage = async (req, res) => {
  try {
    if (!req.body.image)
      return res.status(400).json({ message: "No image provided!" });

    if (!process.env.CLOUDINARY_UPLOAD_PRESET)
      return res
        .status(500)
        .json({ message: "Missing cloudinary upload preset in .env!" });

    if (!process.env.CLOUDINARY_FOLDER)
      return res
        .status(500)
        .json({ message: "Missing cloudinary folder name in .env!" });

    const base64Image = req.body.image;

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found!" });

    // Checks daily upload limit
    const lastUpload = user.lastImageUpload;
    if (lastUpload && new Date() - new Date(lastUpload) < 24 * 60 * 60 * 1000)
      return res.status(429).json({
        message: "You can only change your profile picture once per day!",
      });

    // Deletes the existing image if it exists
    if (user.cloudinaryImageId)
      await cloudinary.uploader.destroy(user.cloudinaryImageId);

    const result = await cloudinary.uploader.upload(base64Image, {
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET.trim(),
      folder: process.env.CLOUDINARY_FOLDER.trim(),
      transformation: [{ width: 130, height: 130, crop: "fill" }],
    });

    // Updates user profile
    user.image = result.secure_url;
    user.cloudinaryImageId = result.public_id;
    user.lastImageUpload = new Date();
    await user.save();

    return res.status(200).json({
      message: "Image uploaded and saved successfully!",
      imageUrl: result.secure_url,
    });
  } catch (error) {
    if (error.http_code)
      return res.status(error.http_code).json({
        message: "Cloudinary error!",
        error: error.message,
      });

    return res.status(500).json({
      message: "Error uploading image!",
      error: error.message,
    });
  }
};

module.exports = {
  fetchAllUsers,
  fetchOneUser,
  fetchUsersByReputation,
  registerUser,
  loginUser,
  logoutUser,
  promoteUserToAdmin,
  banUser,
  unbanUser,
  requestPasswordReset,
  resetPassword,
  uploadImage,
};
