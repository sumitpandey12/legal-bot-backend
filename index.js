const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 3000;

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: false, // Set to true if you need to allow credentials
  })
);

app.use((req, res, next) => {
  console.log(`${req.method} request to ${req.url}`);
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/search", require("./Routes/SearchRoutes"));
app.use("/api/files", require("./Routes/FilesRoutes"));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
