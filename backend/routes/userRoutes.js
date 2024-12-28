const express = require("express");
const {
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
} = require("../controllers/userController.js");
const authMiddleware = require("../middleware/authMiddleware.js");
const adminCheckMiddleware = require("../middleware/adminCheckMiddleware.js");

const router = express.Router();

router.get("/byReputation", fetchUsersByReputation);
router.get("/", fetchAllUsers);
router.get("/:id", fetchOneUser);
router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/logout").post(logoutUser);
router
  .route("/:id/promote")
  .put(authMiddleware, adminCheckMiddleware, promoteUserToAdmin);
router.route("/:id/ban").put(authMiddleware, adminCheckMiddleware, banUser);
router.route("/:id/unban").put(authMiddleware, adminCheckMiddleware, unbanUser);
router.post("/forgotPassword", requestPasswordReset);
router.post("/resetPassword/:token", resetPassword);
router.post("/uploadImage", authMiddleware, uploadImage);

module.exports = router;
