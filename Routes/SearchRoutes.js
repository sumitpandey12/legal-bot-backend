const express = require("express");
const router = express.Router();
const SearchController = require("../Controller/SearchController");

// router.get("/chatHistory", SearchController.getChatHistory);
// router.delete("/chatHistory", SearchController.clearChatHistory);
router.post("/", SearchController.search);

module.exports = router;
