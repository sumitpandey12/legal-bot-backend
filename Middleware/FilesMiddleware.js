const fs = require("fs");
const path = require("path");

const FileExists = (req, res, next) => {
  try {
    return res.status(200).json({
      status: "test",
      message: "File already exists",
      fileExists: req.fileExists || false,
    });
  } catch (err) {
    console.log(err);
  }
  next();
};

module.exports = { FileExists };
