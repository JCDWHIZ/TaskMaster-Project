const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");
const { connectToDb } = require("./config/db");

const app = express();

dotenv.config();

connectToDb();

app.use(express.json());
app.use(cors());
app.use(routes);

console.log(Date.now());
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app;
