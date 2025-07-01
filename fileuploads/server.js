const express = require("express");
const path = require("path");
const multer = require("multer");

// const upload = multer({ dest: "uploads/" });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    return cb(null, `${Date.now()}- ${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const app = express();
const PORT = process.env.PORT || 8000;

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

//middleware - it is used to read form data
app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("homepage");
});

app.post(
  "/upload",
  upload.fields([{ name: "profileImage" }, { name: "coverImage" }]),
  (req, res) => {
    return res.redirect("/");
  }
);

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
