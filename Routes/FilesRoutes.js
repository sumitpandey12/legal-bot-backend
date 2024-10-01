const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const FilesController = require("../Controller/FilesController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("./tmp")) {
      fs.mkdirSync("./tmp");
    }
    cb(null, "./tmp");
  },
  filename: function (req, file, cb) {
    const filePath = path.join(__dirname, "../tmp", file.originalname);
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
