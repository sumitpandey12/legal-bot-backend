const fs = require("fs");
const path = require("path");

const FileExists = (req, res, next) => {
  try {
    return res.status(200).json({
      status: "test",
      message: "File already exists",
      fileExists: req.fileExists || false,
    });

    const filePath = path.join(__dirname, "../uploads", req.file.originalname);

    if (fs.existsSync(filePath)) {
      return res.status(400).json({
        status: "error",
        message: "File already exists",
      });
    }
  } catch (err) {
    console.log(err);
  }
  next();
};

module.exports = { FileExists };
