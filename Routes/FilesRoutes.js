const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const FilesController = require("../Controller/FilesController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    if (!fs.existsSync("/tmp")) {
      fs.mkdirSync("/tmp");
    }
    cb(null, "/tmp");
  },
  filename: function (req, file, cb) {
    const files = fs.readdirSync("/tmp");
    let found = false;
    const returnFiles = files.map((item) => {
      if (item == file.originalname) {
        found = true;
        req.fileExists = true;
      }
    });
    if (!found) {
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
