const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  //exception-handling
  try {
    let userExists = await User.findOne({ email });
    if (userExists)
      return res.render("register", { error: "User already exists" });

    const user = await User.create({ name, email, password });
    const token = generateToken(user._id);

    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    res.render("register", { error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.render("login", { error: "Invalid credentials" });
    }

    const token = generateToken(user._id);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    res.render("login", { error: "Login failed" });
  }
};

exports.showDashboard = async (req, res) => {
  res.render("dashboard", { user: req.user });
};


exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.render("forgot", { error: "User not found" });

  // Generate a reset token using JWT
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
  await user.save();

  const resetURL = `http://localhost:${
    process.env.PORT || 5000
  }/reset-password/${token}`;
  console.log(`🔗 Password Reset Link: ${resetURL}`);

  res.render("forgot", {
    message: "Password reset link has been sent. Check console!",
  });
};

exports.renderResetForm = async (req, res) => {
  const { token } = req.params;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.send("Invalid or expired token");

    res.render('reset', { token });
  } catch (err) {
    res.send("Invalid token");
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.send("Invalid or expired token");

    user.password = password; // gets hashed automatically via pre-save hook
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.send("✅ Password updated! You can now <a href='/login'>login</a>.");
  } catch (err) {
    res.send("Token error or expired.");
  }
};
