//modules
const express = require("express");
const mongoose = require("mongoose");
const productRoute = require("./routes/product.route");
require('dotenv').config();

const app = express();

//middleware
//para enviar dados via postman pode ser usado json ou url encoded
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//routes
app.use("/api/products", productRoute);

app.get("/", (req, res) => {
  res.send("Hello from Node API Server");
});

const mongoURI = process.env.MONGO_URI;
mongoose
  .connect(
    mongoURI
  )
  .then(() => {
    console.log("Connected to the database!");
    app.listen(3000, () => {
      // server only runs if there is a successful connection with the database
      console.log("Server is running on port 3000");
    });
  })
  .catch(() => {
    console.log("Database connection failed!");
  });
