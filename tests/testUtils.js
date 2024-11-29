const mongoose = require("mongoose");
jest.setTimeout(30000);

let mongoServer;

const connectTestDB = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
  }
};

const disconnectTestDB = async () => {
  await mongoose.disconnect();
};

module.exports = { connectTestDB, disconnectTestDB };
