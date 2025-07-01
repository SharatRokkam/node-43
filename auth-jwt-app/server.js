const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Setup EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static folder
app.use(express.static(path.join(__dirname, "public")));

// Middleware
//To read the form data
app.use(express.urlencoded({ extended: true }));
//to read json data
app.use(express.json());
//to read or parse cookie stored on client side
app.use(cookieParser());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/", authRoutes);

// DB + Server Start
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.error("DB Connection Failed", err));
