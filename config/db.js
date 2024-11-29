const mongoose = require("mongoose");

const connectToDb = async () => {
  try {
    const connect = await mongoose.connect(process.env.MONGO_URL);
    console.log("Connected to DB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connectToDb };
