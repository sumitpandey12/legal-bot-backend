const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const FilesController = require("../Controller/FilesController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("./uploads")) {
      fs.mkdirSync("./uploads");
    }
    cb(null, "./uploads");
  },
  filename: function (req, file, cb) {
    const filePath = path.join(__dirname, "../uploads", file.originalname);

    if (fs.existsSync(filePath)) {
      req.fileExists = true;
    } else {
      req.fileExists = false;
    }

    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.post("/", upload.single("file"), FilesController.uploadFiles);
router.get("/", FilesController.getFiles);
router.delete("/", FilesController.deleteFiles);

module.exports = router;
