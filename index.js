const express = require("express");
require("dotenv").config();
const cors = require("cors");

const app = express();
const port = 3000;
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routes
app.use("/api/search", require("./Routes/SearchRoutes"));
app.use("/api/files", require("./Routes/FilesRoutes"));

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
