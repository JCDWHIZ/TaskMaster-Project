const express = require("express");
const dotenv = require("dotenv");
const routes = require("./routes");
const cors = require("cors");
const { connectToDb } = require("./config/db");
const axios = require("axios");

const app = express();

dotenv.config();

connectToDb();

app.get("/", async (req, res) => {
  try {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Welcome</title>
    </head>
    <body>
      <h1>Welcome</h1>
      <p>To view the documentation for this api go <a href="https://www.apidog.com/apidoc/shared-2d84819f-6dc6-4ea3-82ac-e369d8d9a4c0">here</a></p>
    </body>
    </html>
  `);
  } catch (error) {
    res.status(500).send("An error occured");
  }
});

app.use(express.json());
app.use(cors());
app.use(routes);

console.log(Date.now());
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});

module.exports = app;
