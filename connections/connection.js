const mongoose = require("mongoose");
require("dotenv").config(); // Load environment variables

const connectDBandServer = async (app) => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to the database ✅");

    // Start the server only after DB connection is successful
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} ✅`);
    });
  } catch (error) {
    console.log("Database connection failed ❌");
  }
};

module.exports = connectDBandServer;
