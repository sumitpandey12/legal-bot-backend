const {
  uploadTextToDBVector,
  deleteAllRowsFromDB,
} = require("../Utils/DocumentToDB");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const FilesController = {
  async uploadFiles(req, res) {
    try {
      // if (req.fileExists) {
      //   return res.status(400).json({
      //     status: "success",
      //     message: "File already exists",
      //   });
      // }

      const data = await uploadTextToDBVector({
        filePath: req.file.path,
        openAIApiKey: process.env.OPENAI_API_KEY,
        sbApiKey: process.env.SUPABASE_API_KEY,
        sbUrl: process.env.SUPABASE_URL_LC_CHATBOT,
        tableName: "documents",
        fileName: req.filename,
      });
      console.log(data);

      return res.json({
        status: "success",
        message: "File uploaded successfully",
        fileExists: req.fileExists,
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
      const client = createClient(
        process.env.SUPABASE_URL_LC_CHATBOT,
        process.env.SUPABASE_API_KEY
      );
      const { data, error } = await client.from("documents").select("filename");

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.json({
        status: "success",
        message: "Files fetched successfully",
        data: getDistinctFilenames(data),
      });

      return;
      const files = fs.readdirSync("/tmp");

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

      const files = fs.readdirSync("/tmp");

      for (const file of files) {
        const filePath = path.join("/tmp", file);
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

  async deleteFile(req, res) {
    try {
      const { filename } = req.params;

      const client = createClient(
        process.env.SUPABASE_URL_LC_CHATBOT,
        process.env.SUPABASE_API_KEY
      );
      const { data, error } = await client
        .from("documents")
        .delete()
        .eq("filename", filename);

      if (error) {
        return res.status(500).json({ message: error.message });
      }

      return res.status(200).json({
        status: "success",
        message: "File deleted successfully",
        data: data,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

function getDistinctFilenames(data) {
  const distinctFilenames = new Set();
  data.forEach((item) => {
    if (item.filename) {
      distinctFilenames.add(item.filename);
    }
  });
  return Array.from(distinctFilenames);
}

module.exports = FilesController;
