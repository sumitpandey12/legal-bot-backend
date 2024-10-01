const {
  uploadTextToDBVector,
  deleteAllRowsFromDB,
} = require("../Utils/DocumentToDB");

const fs = require("fs");
const path = require("path");

const FilesController = {
  async uploadFiles(req, res) {
    try {
      if (req.fileExists) {
        return res.status(400).json({
          status: "success",
          message: "File already exists",
        });
      }

      const data = await uploadTextToDBVector({
        filePath: req.file.path,
        openAIApiKey: process.env.OPENAI_API_KEY,
        sbApiKey: process.env.SUPABASE_API_KEY,
        sbUrl: process.env.SUPABASE_URL_LC_CHATBOT,
        tableName: "documents",
      });
      console.log(data);

      return res.json({
        status: "success",
        message: "File uploaded successfully",
        data: {
          ...data,
          filename: req.file.filename,
          mimetype: req.file.mimetype,
        },
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async getFiles(req, res) {
    try {
      const files = fs.readdirSync("./tmp");

      const returnFiles = files.map((file) => {
        return {
          name: file,
          url: `${process.env.BASE_URL}/tmp/${file}`,
          minetype: file.split(".")[1],
        };
      });

      return res.json({
        status: "success",
        message: "Files fetched successfully",
        data: returnFiles,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  async deleteFiles(req, res) {
    try {
      const response = await deleteAllRowsFromDB({
        tableName: "documents",
        sbApiKey: process.env.SUPABASE_API_KEY,
        sbUrl: process.env.SUPABASE_URL_LC_CHATBOT,
      });
      console.log(response);

      const uploadsDir = path.join(__dirname, "./tmp");

      const files = fs.readdirSync(uploadsDir);

      for (const file of files) {
        const filePath = path.join(uploadsDir, file);
        fs.unlinkSync(filePath);
      }
      return res.json({
        status: "success",
        message: "File deleted successfully",
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = FilesController;
